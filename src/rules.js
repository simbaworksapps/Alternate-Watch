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

  if (missionData.wxUnavailable) {
    return {
      icao,
      role,
      name: airport?.name || icao,
      status: "yellow",
      cardStatus: "yellow",
      title: `${icao} weather unavailable`,
      reason: "Live AWC weather could not be pulled. Current METAR/TAF data is unavailable.",
      chips: [{ label: "WX !", status: "yellow" }],
      evaluatedAt: targetTime,
      period: null,
      weatherImpacts: { wx: "yellow" },
      locationImpact: null,
      metar: null,
      tafRaw: null,
      taf: [],
      notams: []
    };
  }

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

  const hasTaf = Boolean(airport.tafRaw && airport.taf?.length);
  const tafEvaluation = hasTaf ? findEvaluatedPeriods(airport.taf, targetTime, ruleType) : { period: null, periods: [] };
  const period = tafEvaluation.period;
  const activeNotams = rulesMetadata.notamAvailable ? findActiveNotams(airport.notams, targetTime) : [];
  const weatherStatus = evaluateWeather(period, ruleType, hasTaf);
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
    filterStatus: cardStatus,
    title: `${icao} ${role}`,
    reason: [weatherStatus.reason, notamStatus.reason, locationStatus.reason].filter(Boolean).join(" "),
    chips,
    evaluatedAt: targetTime,
    period,
    applicablePeriods: tafEvaluation.periods,
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
  if (impacts.taf && weatherStatus.tafLabel !== "NO TAF") chips.push({ label: weatherStatus.tafLabel || "TAF TIME", status: impacts.taf });
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

function findEvaluatedPeriods(periods, targetTime, ruleType) {
  const target = new Date(targetTime).getTime();
  const windowMs = ruleType === "departure" ? 0 : 60 * 60 * 1000;
  const startWindow = target - windowMs;
  const endWindow = target + windowMs;
  const applicable = periods.filter((period) => {
    const start = new Date(period.validFrom).getTime();
    const end = new Date(period.validTo).getTime();
    return start <= endWindow && end >= startWindow;
  });
  if (!applicable.length) return { period: null, periods: [] };
  return {
    period: applicable.sort(compareWeatherPeriods)[0],
    periods: applicable
  };
}

function compareWeatherPeriods(left, right) {
  const leftStatus = evaluateWeather(left, "alternate", true).status;
  const rightStatus = evaluateWeather(right, "alternate", true).status;
  if (STATUS_RANK[leftStatus] !== STATUS_RANK[rightStatus]) {
    return STATUS_RANK[rightStatus] - STATUS_RANK[leftStatus];
  }
  const leftCeiling = Number.isFinite(left.ceilingFt) ? left.ceilingFt : 99999;
  const rightCeiling = Number.isFinite(right.ceilingFt) ? right.ceilingFt : 99999;
  if (leftCeiling !== rightCeiling) return leftCeiling - rightCeiling;
  return (left.visibilitySm ?? 99) - (right.visibilitySm ?? 99);
}

function findActiveNotams(notams, targetTime) {
  const target = new Date(targetTime).getTime();
  return notams.filter((notam) => target >= new Date(notam.starts).getTime() && target <= new Date(notam.ends).getTime());
}

function evaluateWeather(period, ruleType, hasTaf = true) {
  if (!period) {
    return {
      status: "yellow",
      reason: hasTaf ? "No TAF period covers the selected mission time." : "No TAF is available from AWC for this airfield.",
      tafLabel: hasTaf ? "TAF TIME" : "NO TAF",
      impacts: { taf: "yellow" }
    };
  }

  const windStatus = evaluateWind(period.wind);
  const thresholds = {
    departure: { redCeiling: 200, redVisibility: 3, yellowCeiling: 300, yellowVisibility: 5, redChipCeiling: 300 },
    destination: { redCeiling: 2000, redVisibility: 3, yellowCeiling: 2500, yellowVisibility: 5 },
    alternate: { redCeiling: 2000, redVisibility: 3, yellowCeiling: 2500, yellowVisibility: 5 }
  }[ruleType];

  const ceilingFt = getCeilingFeet(period);
  const impacts = {};
  if (ceilingFt !== null && ceilingFt < thresholds.redCeiling) {
    impacts.ceiling = "red";
  } else if (ruleType === "departure" && ceilingFt !== null && ceilingFt < thresholds.redChipCeiling) {
    impacts.ceiling = "red";
  } else if (ceilingFt !== null && ceilingFt <= thresholds.yellowCeiling) {
    impacts.ceiling = "yellow";
  }
  if (period.visibilitySm < thresholds.redVisibility) {
    impacts.visibility = "red";
  } else if (period.visibilitySm <= thresholds.yellowVisibility) {
    impacts.visibility = "yellow";
  }
  if (windStatus.impacts.wind) {
    impacts.wind = windStatus.impacts.wind;
  }

  const status = Object.values(impacts).reduce((current, impact) =>
    STATUS_RANK[impact] > STATUS_RANK[current] ? impact : current
  , "green");
  const reason = status === "red"
    ? `Forecast ${formatCeiling(ceilingFt)} / ${formatVisibility(period)} is below prototype ${ruleType} threshold.`
    : status === "yellow"
      ? `Forecast ${formatCeiling(ceilingFt)} / ${formatVisibility(period)} is approaching prototype ${ruleType} threshold.`
      : `Forecast ${formatCeiling(ceilingFt)} / ${formatVisibility(period)} is comfortably above prototype ${ruleType} threshold.`;

  return { status, reason, impacts };
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
  const match = String(wind).match(/(?:\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS)/);
  if (!match) return 0;
  const multiplier = match[3] === "MPS" ? 1.94384 : 1;
  const sustained = Math.round(Number(match[1]) * multiplier);
  const gust = match[2] ? Math.round(Number(match[2]) * multiplier) : sustained;
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
      chips: result.chips || []
    }));
}
