const STATUS_RANK = { green: 0, yellow: 1, red: 2 };
function evaluateMission(inputs, missionData) {
  const sourceIssuedAt = missionData.sourceIssuedAt || missionData.pulledAt;
  const departure = buildAirportResult(inputs.departure, "Departure", inputs.takeoffTime, missionData, "departure", sourceIssuedAt);
  const destination = buildAirportResult(inputs.destination, "Destination", inputs.landingTime, missionData, "destination", sourceIssuedAt);
  const alternates = inputs.alternates.map((icao) =>
    buildAirportResult(icao, "Alternate", inputs.landingTime, missionData, "alternate", sourceIssuedAt)
  );

  const allResults = [departure, destination, ...alternates];
  const worst = allResults.reduce((current, result) =>
    STATUS_RANK[result.status] > STATUS_RANK[current.status] ? result : current
  );

  return {
    pulledAt: missionData.pulledAt,
    sourceIssuedAt,
    alternateRequired: isAlternateRequired(destination),
    summary: summarizeMission(destination, alternates, worst, allResults),
    results: allResults
  };
}

window.evaluateMission = evaluateMission;

function buildAirportResult(icao, role, targetTime, missionData, ruleType, pulledAt) {
  const airport = missionData.airports[icao];

  if (!airport) {
    return {
      icao,
      role,
      status: "yellow",
      title: `${icao} data unavailable`,
      reason: "No sample data exists for this airfield yet. Live connector should mark this as incomplete.",
      period: null,
      metar: null,
      tafRaw: null,
      notams: []
    };
  }

  const period = findApplicablePeriod(airport.taf, targetTime);
  const activeNotams = rulesMetadata.notamAvailable ? findActiveNotams(airport.notams, targetTime) : [];
  const weatherStatus = evaluateWeather(period, ruleType);
  const notamStatus = evaluateNotams(activeNotams);
  const locationStatus = evaluateLocation(airport, ruleType);
  const status = [weatherStatus, notamStatus, locationStatus].reduce((current, item) =>
    STATUS_RANK[item.status] > STATUS_RANK[current] ? item.status : current
  , "green");
  const cardStatus = [weatherStatus, notamStatus].reduce((current, item) =>
    STATUS_RANK[item.status] > STATUS_RANK[current] ? item.status : current
  , "green");
  const chips = buildIssueChips(weatherStatus, notamStatus, locationStatus, activeNotams);

  return {
    icao,
    role,
    name: airport.name,
    status,
    cardStatus,
    title: `${icao} ${role}`,
    reason: [weatherStatus.reason, notamStatus.reason, locationStatus.reason].filter(Boolean).join(" "),
    chips,
    evaluatedAt: targetTime,
    period,
    weatherImpacts: weatherStatus.impacts || {},
    locationImpact: locationStatus.impact,
    metar: airport.metar,
    tafRaw: airport.tafRaw,
    taf: airport.taf,
    notams: activeNotams
  };
}

function buildIssueChips(weatherStatus, notamStatus, locationStatus, notams) {
  const chips = [];
  const impacts = weatherStatus.impacts || {};
  if (impacts.ceiling) chips.push({ label: "LOW CEILING", status: impacts.ceiling });
  if (impacts.visibility) chips.push({ label: "LOW VIS", status: impacts.visibility });
  if (impacts.wind) chips.push({ label: "HIGH WIND", status: impacts.wind });
  if (notams.some((notam) => notam.impact === "closed")) chips.push({ label: "CLOSED", status: "red" });
  if (notamStatus.status === "yellow") chips.push({ label: "NOTAM", status: "yellow" });
  if (locationStatus.impact) chips.push({ label: "OCONUS", status: locationStatus.impact });
  return chips.length ? chips : [{ label: "NO ISSUES", status: "green" }];
}

function isAlternateRequired(destination) {
  return destination.status === "red" || destination.status === "yellow";
}

function evaluateLocation(airport, ruleType) {
  if (airport.conus !== false) {
    return { status: "green", reason: "", impact: null };
  }

  const applies = ruleType === "departure" || ruleType === "destination";
  return {
    status: applies ? "red" : "green",
    reason: applies ? "OCONUS airfield requires an alternate for departure or arrival." : "",
    impact: applies ? "red" : null
  };
}

function findApplicablePeriod(periods, targetTime) {
  const target = new Date(targetTime).getTime();
  const applicable = periods.filter((period) => {
    const start = new Date(period.validFrom).getTime();
    const end = new Date(period.validTo).getTime();
    return target >= start && target <= end;
  });
  if (!applicable.length) return null;

  return applicable.sort((left, right) => {
    if (left.conditional !== right.conditional) return left.conditional ? -1 : 1;
    return new Date(right.validFrom).getTime() - new Date(left.validFrom).getTime();
  })[0];
}

function findActiveNotams(notams, targetTime) {
  const target = new Date(targetTime).getTime();
  return notams.filter((notam) => target >= new Date(notam.starts).getTime() && target <= new Date(notam.ends).getTime());
}

function evaluateWeather(period, ruleType) {
  if (!period) {
    return {
      status: "yellow",
      reason: "No TAF period covers the selected mission time.",
      impacts: { taf: "yellow" }
    };
  }

  const windStatus = evaluateWind(period.wind);
  const thresholds = {
    departure: { redCeiling: 2000, redVisibility: 3, yellowCeiling: 2500, yellowVisibility: 5 },
    destination: { redCeiling: 2000, redVisibility: 3, yellowCeiling: 2500, yellowVisibility: 5 },
    alternate: { redCeiling: 2000, redVisibility: 3, yellowCeiling: 2500, yellowVisibility: 5 }
  }[ruleType];

  const ceilingFt = getCeilingFeet(period);
  if ((ceilingFt !== null && ceilingFt < thresholds.redCeiling) || period.visibilitySm < thresholds.redVisibility) {
    return {
      status: "red",
      reason: `Forecast ${formatCeiling(ceilingFt)} / ${formatVisibility(period)} is below prototype ${ruleType} threshold.`,
      impacts: {
        ceiling: ceilingFt !== null && ceilingFt < thresholds.redCeiling ? "red" : null,
        visibility: period.visibilitySm < thresholds.redVisibility ? "red" : null
      }
    };
  }

  if (windStatus.status === "red") {
    return windStatus;
  }

  if ((ceilingFt !== null && ceilingFt <= thresholds.yellowCeiling) || period.visibilitySm <= thresholds.yellowVisibility) {
    return {
      status: "yellow",
      reason: `Forecast ${formatCeiling(ceilingFt)} / ${formatVisibility(period)} is approaching prototype ${ruleType} threshold.`,
      impacts: {
        ceiling: ceilingFt !== null && ceilingFt <= thresholds.yellowCeiling ? "yellow" : null,
        visibility: period.visibilitySm <= thresholds.yellowVisibility ? "yellow" : null
      }
    };
  }

  if (windStatus.status === "yellow") {
    return windStatus;
  }

  return {
    status: "green",
    reason: `Forecast ${formatCeiling(ceilingFt)} / ${formatVisibility(period)} is comfortably above prototype ${ruleType} threshold.`,
    impacts: {}
  };
}

function getCeilingFeet(period) {
  return Number.isFinite(period.ceilingFt) ? period.ceilingFt : null;
}

function formatCeiling(ceilingFt) {
  return ceilingFt === null ? "no ceiling" : `${ceilingFt} ft ceiling`;
}

function formatVisibility(period) {
  return period.visibilitySource || `${period.visibilitySm} SM`;
}

function evaluateWind(wind) {
  const speed = getMaxWindSpeed(wind);
  if (speed > 25) {
    return {
      status: "red",
      reason: `Forecast wind ${wind} exceeds 25 knots.`,
      impacts: { wind: "red" }
    };
  }

  if (speed > 15) {
    return {
      status: "yellow",
      reason: `Forecast wind ${wind} exceeds 15 knots.`,
      impacts: { wind: "yellow" }
    };
  }

  return {
    status: "green",
    reason: "",
    impacts: {}
  };
}

function getMaxWindSpeed(wind) {
  const match = String(wind).match(/(?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT/);
  if (!match) return 0;
  const sustained = Number(match[1]);
  const gust = match[2] ? Number(match[2]) : sustained;
  return Math.max(sustained, gust);
}

function evaluateNotams(notams) {
  if (notams.length === 0) {
    return { status: "green", reason: "" };
  }

  notams.forEach((notam) => {
    notam.impact = classifyNotamImpact(notam);
  });

  const closed = notams.some((notam) => notam.impact === "closed");
  if (closed) {
    return {
      status: "red",
      reason: "Active NOTAM reports an airfield, runway, approach, lighting, or other critical item closed."
    };
  }

  const limiting = notams.some((notam) => ["APCH", "RWY", "LIGHTS"].includes(notam.category));
  return {
    status: limiting ? "yellow" : "green",
    reason: limiting ? "Active NOTAM may affect approach, runway, or lighting usability." : ""
  };
}

function classifyNotamImpact(notam) {
  const text = `${notam.category || ""} ${notam.raw || ""}`.toUpperCase();
  const closurePatterns = [
    /\bCLSD\b/,
    /\bCLOSED\b/,
    /\bAERODROME CLSD\b/,
    /\bAD CLSD\b/,
    /\bRWY \d{1,2}[LCR]?\/?\d{0,2}[LCR]? CLSD\b/,
    /\bAPCH\b.*\b(U\/S|OTS|CLSD)\b/,
    /\bILS\b.*\b(U\/S|OTS|CLSD)\b/,
    /\bALS\b.*\b(U\/S|OTS|CLSD)\b/,
    /\bLIGHTS?\b.*\b(U\/S|OTS|CLSD)\b/
  ];

  if (closurePatterns.some((pattern) => pattern.test(text))) {
    return "closed";
  }

  if (["APCH", "RWY", "LIGHTS"].includes(notam.category)) {
    return "limiting";
  }

  return "info";
}

function summarizeMission(destination, alternates, worst, allResults) {
  const problemAirfields = summarizeProblemAirfields(allResults);
  const items = summarizeProblemItems(allResults);
  if (destination.status === "red") {
    return {
      status: "red",
      label: "Alternate Driven",
      headline: "Destination weather appears to drive an alternate.",
      reason: `${destination.icao}: ${destination.reason}`,
      items
    };
  }

  const bestAlternate = alternates.find((alternate) => alternate.status === "green");
  if (destination.status === "yellow" && !bestAlternate) {
    return {
      status: "yellow",
      label: "Review Required",
      headline: "Destination is near threshold and no green alternate is shown.",
      reason: problemAirfields ? `${problemAirfields}: ${worst.reason}` : worst.reason,
      items
    };
  }

  return {
    status: worst.status,
    label: worst.status === "green" ? "Within Prototype Criteria" : "Watch Item",
    headline: worst.status === "green" ? "No alternate trigger in sample data." : `Review ${problemAirfields}.`,
    reason: worst.status === "green" ? worst.reason : `${problemAirfields}: ${worst.reason}`,
    items
  };
}

function summarizeProblemAirfields(results) {
  const problemStatuses = results.some((result) => result.status === "red") ? ["red"] : ["yellow"];
  const airfields = [...new Set(results.filter((result) => problemStatuses.includes(result.status)).map((result) => result.icao))];
  return airfields.join(", ");
}

function summarizeProblemItems(results) {
  const problemStatus = results.some((result) => result.status === "red") ? "red" : "yellow";
  return results
    .filter((result) => result.status === problemStatus)
    .map((result) => ({
      icao: result.icao,
      chips: (result.chips || []).filter((chip) => chip.status === problemStatus)
    }));
}
