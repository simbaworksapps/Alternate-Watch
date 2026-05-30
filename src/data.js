const rulesMetadata = {
  caoDate: "2026-05-29",
  rulesProfile: "Prototype thresholds pending current AFMAN 11-202V3 / AMC supplement mapping",
  weatherSource: "Sample",
  notamSource: "Unavailable",
  notamAvailable: false
};

const airportNameFallbacks = {
  EGUN: "RAF Mildenhall",
  EGUL: "RAF Lakenheath",
  EGVA: "RAF Fairford",
  ETAR: "Ramstein AB",
  ETAD: "Spangdahlem AB",
  LPLA: "Lajes Field",
  PGUA: "Andersen AFB",
  PHIK: "Hickam AFB",
  RKSO: "Osan AB",
  RKJK: "Kunsan AB",
  RJTY: "Yokota AB",
  RJOI: "MCAS Iwakuni",
  OKAS: "Ali Al Salem AB",
  OTBH: "Al Udeid AB"
};

async function getLiveMissionData(icaos) {
  const sampleData = getMissionData();
  const uniqueIcaos = [...new Set(icaos.filter(Boolean).map((icao) => icao.toUpperCase()))];
  if (uniqueIcaos.length === 0) return sampleData;

  try {
    const ids = encodeURIComponent(uniqueIcaos.join(","));
    const [metarText, tafText, stationInfo] = await Promise.all([
      fetchWeatherText("metar", ids),
      fetchWeatherText("taf", ids),
      fetchStationInfo(ids)
    ]);

    const metars = parseRawReports(metarText);
    const tafs = parseRawReports(tafText);
    const airports = {};

    uniqueIcaos.forEach((icao) => {
      const sample = sampleData.airports[icao] || {};
      const metar = metars[icao] || sample.metar || null;
      const tafRaw = tafs[icao] || sample.tafRaw || null;
      const taf = tafRaw ? parseTafPeriods(tafRaw) : sample.taf || [];

      airports[icao] = {
        name: getAirportName(icao, sample, stationInfo),
        conus: sample.conus ?? isLikelyConus(icao),
        metar,
        tafRaw,
        taf,
        notams: []
      };
    });

    rulesMetadata.weatherSource = "AWC";
    return {
      pulledAt: new Date().toISOString(),
      sourceIssuedAt: getLatestIssueTime(airports) || new Date().toISOString(),
      airports
    };
  } catch (error) {
    rulesMetadata.weatherSource = "Unavailable";
    return createUnavailableMissionData(uniqueIcaos);
  }
}

function createUnavailableMissionData(icaos) {
  return {
    pulledAt: new Date().toISOString(),
    sourceIssuedAt: new Date().toISOString(),
    wxUnavailable: true,
    airports: icaos.reduce((airports, icao) => {
      airports[icao] = {
        name: airportNameFallbacks[icao] || icao,
        conus: isLikelyConus(icao),
        metar: null,
        tafRaw: null,
        taf: [],
        notams: []
      };
      return airports;
    }, {})
  };
}

async function fetchStationInfo(encodedIds) {
  const proxyUrl = `./api/weather?type=stationinfo&ids=${encodedIds}`;
  const directUrl = `https://aviationweather.gov/api/data/stationinfo?ids=${encodedIds}&format=json`;

  try {
    const proxyResponse = await fetch(proxyUrl);
    if (proxyResponse.ok) return normalizeStationInfo(await proxyResponse.json());
  } catch (error) {
    // Static previews and GitHub Pages do not provide the proxy endpoint.
  }

  try {
    const directResponse = await fetch(directUrl);
    if (directResponse.ok) return normalizeStationInfo(await directResponse.json());
  } catch (error) {
    // Station names are helpful, but weather evaluation can continue without them.
  }

  return {};
}

async function fetchWeatherText(type, encodedIds) {
  const proxyUrl = `./api/weather?type=${type}&ids=${encodedIds}`;
  const directUrl = `https://aviationweather.gov/api/data/${type}?ids=${encodedIds}&format=raw${type === "metar" ? "&hours=3" : ""}`;

  try {
    const proxyResponse = await fetch(proxyUrl);
    if (proxyResponse.ok) return proxyResponse.text();
  } catch (error) {
    // Static previews and GitHub Pages do not provide the proxy endpoint.
  }

  const directResponse = await fetch(directUrl);
  if (!directResponse.ok) throw new Error("AWC request failed");
  return directResponse.text();
}

function normalizeStationInfo(payload) {
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.features)
      ? payload.features.map((feature) => feature.properties || feature)
      : [];

  return rows.reduce((stations, row) => {
    const icao = String(row.icaoId || row.stationId || row.id || row.icao || "").toUpperCase();
    if (!/^[A-Z0-9]{4}$/.test(icao)) return stations;
    const name = row.site || row.name || row.stationName || row.airportName || row.city || "";
    if (name) stations[icao] = cleanAirportName(name);
    return stations;
  }, {});
}

function getAirportName(icao, sample, stationInfo) {
  return sample.name || stationInfo[icao] || airportNameFallbacks[icao] || icao;
}

function cleanAirportName(value) {
  return String(value)
    .replace(/\s+/g, " ")
    .replace(/\bAIRPORT\b$/i, "Airport")
    .trim();
}

function getMissionData() {
  return {
    pulledAt: new Date().toISOString(),
    sourceIssuedAt: new Date().toISOString(),
    airports: {
      KMCF: {
        name: "MacDill AFB",
        conus: true,
        metar: "KMCF 291456Z 25009KT 10SM SCT025 BKN045 31/23 A2994",
        tafRaw: "KMCF 291120Z 2912/3018 25009KT 10SM SCT025 BKN045 FM291800 24011KT 6SM VCSH SCT020 BKN030",
        taf: [
          {
            validFrom: "2026-05-29T10:00:00Z",
            validTo: "2026-05-29T18:00:00Z",
            ceilingFt: 4500,
            ceilingSource: "BKN045",
            visibilitySm: 10,
            visibilitySource: "10SM",
            wind: "25009KT",
            raw: "FM291000 25009KT 10SM SCT025 BKN045"
          },
          {
            validFrom: "2026-05-29T18:00:00Z",
            validTo: "2026-05-30T02:00:00Z",
            ceilingFt: 3000,
            ceilingSource: "BKN030",
            visibilitySm: 6,
            visibilitySource: "6SM",
            wind: "24011KT",
            raw: "FM291800 24011KT 6SM VCSH SCT020 BKN030"
          }
        ],
        notams: [
          {
            id: "KMCF-05-014",
            starts: "2026-05-29T13:00:00Z",
            ends: "2026-05-29T23:30:00Z",
            category: "INFO",
            raw: "BIRD ACT INVOF AIRFIELD"
          }
        ]
      },
      KTPA: {
        name: "Tampa Intl",
        conus: true,
        metar: "KTPA 291453Z 25010KT 10SM FEW030 SCT050 32/24 A2993",
        tafRaw: "KTPA 291120Z 2912/3018 25010KT P6SM FEW030 SCT050 FM291800 26012KT P6SM VCTS SCT030 BKN035CB",
        taf: [
          {
            validFrom: "2026-05-29T10:00:00Z",
            validTo: "2026-05-29T18:00:00Z",
            ceilingFt: null,
            ceilingSource: null,
            visibilitySm: 10,
            visibilitySource: "P6SM",
            wind: "25010KT",
            raw: "FM291000 25010KT P6SM FEW030 SCT050"
          },
          {
            validFrom: "2026-05-29T18:00:00Z",
            validTo: "2026-05-30T02:00:00Z",
            ceilingFt: 3500,
            ceilingSource: "BKN035CB",
            visibilitySm: 6,
            visibilitySource: "P6SM",
            wind: "26012KT",
            raw: "FM291800 26012KT P6SM VCTS SCT030 BKN035CB"
          }
        ],
        notams: []
      },
      KCOF: createSampleAirport("KCOF", "Patrick SFB", "14008KT", 4200, 7),
      KHST: createSampleAirport("KHST", "Homestead ARB", "11010KT", 3800, 6),
      KPAM: createSampleAirport("KPAM", "Tyndall AFB", "19009KT", 4500, 7),
      KVPS: createSampleAirport("KVPS", "Eglin AFB", "21011KT", 4000, 6),
      KWRB: createSampleAirport("KWRB", "Robins AFB", "24008KT", 5000, 10),
      KBHM: createSampleAirport("KBHM", "Birmingham Intl", "22010KT", 3600, 6),
      KMEI: createSampleAirport("KMEI", "Key Field", "20007KT", 4800, 8),
      KGSB: createSampleAirport("KGSB", "Seymour Johnson AFB", "23009KT", 4200, 7),
      KCHS: {
        name: "Joint Base Charleston",
        conus: true,
        metar: "KCHS 291456Z 21012KT 7SM SCT018 BKN035 26/22 A2992",
        tafRaw: "KCHS 291120Z 2912/3018 21012KT 7SM SCT018 BKN035 FM291800 22015G22KT 5SM SHRA BKN018",
        taf: [
          {
            validFrom: "2026-05-29T10:00:00Z",
            validTo: "2026-05-29T18:00:00Z",
            ceilingFt: 3500,
            ceilingSource: "BKN035",
            visibilitySm: 7,
            visibilitySource: "7SM",
            wind: "21012KT",
            raw: "FM291000 21012KT 7SM SCT018 BKN035"
          },
          {
            validFrom: "2026-05-29T18:00:00Z",
            validTo: "2026-05-30T00:00:00Z",
            ceilingFt: 1800,
            ceilingSource: "BKN018",
            visibilitySm: 5,
            visibilitySource: "5SM",
            wind: "22015G22KT",
            raw: "FM291800 22015G22KT 5SM SHRA BKN018"
          }
        ],
        notams: [
          {
            id: "KCHS-05-112",
            starts: "2026-05-29T12:00:00Z",
            ends: "2026-05-29T23:00:00Z",
            category: "RWY",
            raw: "RWY 15/33 CLSD BTN TWY A AND TWY C"
          }
        ]
      },
      KDOV: {
        name: "Dover AFB",
        conus: true,
        metar: "KDOV 291455Z 16009KT 4SM BR OVC012 22/21 A2990",
        tafRaw: "KDOV 291120Z 2912/3018 16009KT 4SM BR OVC012 FM291900 17012KT 2SM RA BR OVC008",
        taf: [
          {
            validFrom: "2026-05-29T12:00:00Z",
            validTo: "2026-05-29T19:00:00Z",
            ceilingFt: 1200,
            ceilingSource: "OVC012",
            visibilitySm: 4,
            visibilitySource: "4SM",
            wind: "16009KT",
            raw: "FM291200 16009KT 4SM BR OVC012"
          },
          {
            validFrom: "2026-05-29T19:00:00Z",
            validTo: "2026-05-30T02:00:00Z",
            ceilingFt: 800,
            ceilingSource: "OVC008",
            visibilitySm: 2,
            visibilitySource: "2SM",
            wind: "17012KT",
            raw: "FM291900 17012KT 2SM RA BR OVC008"
          }
        ],
        notams: [
          {
            id: "KDOV-05-221",
            starts: "2026-05-29T16:30:00Z",
            ends: "2026-05-30T03:00:00Z",
            category: "APCH",
            raw: "ILS RWY 01 GP U/S"
          }
        ]
      },
      KILM: {
        name: "Wilmington Intl",
        conus: true,
        metar: "KILM 291453Z 23008KT 6SM SCT020 BKN045 25/21 A2995",
        tafRaw: "KILM 291120Z 2912/3018 23008KT 6SM SCT020 BKN045",
        taf: [
          {
            validFrom: "2026-05-29T12:00:00Z",
            validTo: "2026-05-30T00:00:00Z",
            ceilingFt: 4500,
            ceilingSource: "BKN045",
            visibilitySm: 6,
            visibilitySource: "6SM",
            wind: "23008KT",
            raw: "FM291200 23008KT 6SM SCT020 BKN045"
          }
        ],
        notams: []
      },
      KRIC: {
        name: "Richmond Intl",
        conus: true,
        metar: "KRIC 291454Z 17010KT 5SM -RA BKN017 OVC030 21/19 A2991",
        tafRaw: "KRIC 291120Z 2912/3018 17010KT 5SM -RA BKN017 OVC030 FM292200 18010KT 3SM RA BR OVC009",
        taf: [
          {
            validFrom: "2026-05-29T12:00:00Z",
            validTo: "2026-05-29T22:00:00Z",
            ceilingFt: 1700,
            ceilingSource: "BKN017",
            visibilitySm: 5,
            visibilitySource: "5SM",
            wind: "17010KT",
            raw: "FM291200 17010KT 5SM -RA BKN017 OVC030"
          },
          {
            validFrom: "2026-05-29T22:00:00Z",
            validTo: "2026-05-30T04:00:00Z",
            ceilingFt: 900,
            ceilingSource: "OVC009",
            visibilitySm: 3,
            visibilitySource: "3SM",
            wind: "18010KT",
            raw: "FM292200 18010KT 3SM RA BR OVC009"
          }
        ],
        notams: [
          {
            id: "KRIC-05-087",
            starts: "2026-05-29T14:00:00Z",
            ends: "2026-05-29T21:00:00Z",
            category: "LIGHTS",
            raw: "ALS RWY 16 OTS"
          }
        ]
      }
    }
  };
}

function parseRawReports(text) {
  return combineRawReports(text)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .reduce((reports, raw) => {
      const normalized = raw
        .replace(/^(METAR|SPECI)\s+/, "")
        .replace(/^TAF\s+(AMD\s+|COR\s+)?/, "")
        .trim();
      const icao = normalized.split(/\s+/)[0];
      if (/^[A-Z0-9]{4}$/.test(icao) && !reports[icao]) {
        reports[icao] = normalized;
      }
      return reports;
    }, {});
}

function combineRawReports(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ""))
    .filter(Boolean)
    .reduce((reports, line) => {
      const startsReport = /^(METAR|SPECI|TAF)\s+/.test(line.trim());
      if (startsReport || reports.length === 0) {
        reports.push(line.trim());
      } else {
        reports[reports.length - 1] += `\n${line.trim()}`;
      }
      return reports;
    }, []);
}

function parseTafPeriods(tafRaw) {
  const normalized = tafRaw.replace(/^TAF\s+(AMD\s+|COR\s+)?/, "").trim();
  const tokens = normalized.split(/\s+/);
  const issuedTokenIndex = tokens.findIndex((token) => /^\d{6}Z$/.test(token));
  const validTokenIndex = tokens.findIndex((token) => /^\d{4}\/\d{4}$/.test(token));
  if (issuedTokenIndex === -1 || validTokenIndex === -1) return [];

  const issuedAt = tafTokenToDate(tokens[issuedTokenIndex]);
  const validWindow = tokens[validTokenIndex];
  const baseStart = tafWindowBoundaryToDate(validWindow.slice(0, 4), issuedAt);
  const baseEnd = tafWindowBoundaryToDate(validWindow.slice(5, 9), baseStart);
  const bodyTokens = tokens.slice(validTokenIndex + 1);
  const groups = splitTafGroups(bodyTokens);
  let prevailing = null;

  return groups.map((group, index) => {
    const window = getTafGroupWindow(group, index, groups, issuedAt, baseStart, baseEnd);
    const validFrom = window.validFrom;
    const validTo = window.validTo;
    const raw = group.raw;
    const elements = mergeWeatherElements(group, extractWeatherElements(raw), prevailing);
    if (!group.conditional) {
      prevailing = elements;
    }
    return {
      validFrom: validFrom.toISOString(),
      validTo: validTo.toISOString(),
      changeType: group.changeType,
      conditional: group.conditional,
      ceilingFt: elements.ceilingFt,
      ceilingSource: elements.ceilingSource,
      visibilitySm: elements.visibilitySm,
      visibilitySource: elements.visibilitySource,
      wind: elements.wind,
      raw
    };
  });
}

function extractWeatherElements(raw) {
  const ceiling = extractCeiling(raw);
  const visibility = extractVisibility(raw);
  return {
    ceilingFt: ceiling.ceilingFt,
    ceilingSource: ceiling.ceilingSource,
    visibilitySm: visibility.visibilitySm,
    visibilitySource: visibility.visibilitySource,
    wind: extractWind(raw)
  };
}

function mergeWeatherElements(group, elements, prevailing) {
  const base = group.conditional || group.changeType === "BECMG" ? prevailing : null;
  return {
    ceilingFt: elements.ceilingFt ?? base?.ceilingFt ?? null,
    ceilingSource: elements.ceilingSource ?? base?.ceilingSource ?? null,
    visibilitySm: elements.visibilitySm ?? base?.visibilitySm ?? 99,
    visibilitySource: elements.visibilitySource ?? base?.visibilitySource ?? "P6SM",
    wind: elements.wind ?? base?.wind ?? "00000KT"
  };
}

function splitTafGroups(tokens) {
  const groups = [];
  let current = [];

  tokens.forEach((token) => {
    if (isTafChangeToken(token) && current.length) {
      groups.push(buildTafGroup(current));
      current = [token];
    } else {
      current.push(token);
    }
  });

  if (current.length) groups.push(buildTafGroup(current));
  return groups;
}

function buildTafGroup(tokens) {
  const changeToken = tokens[0];
  const changeType = getTafChangeType(changeToken);
  return {
    changeType,
    changeToken,
    conditional: changeType === "TEMPO" || changeType === "PROB",
    raw: tokens.join(" ")
  };
}

function isTafChangeToken(token) {
  return /^FM\d{6}$/.test(token) || token === "BECMG" || token === "TEMPO" || /^PROB\d{2}$/.test(token);
}

function getTafChangeType(token) {
  if (/^FM\d{6}$/.test(token)) return "FM";
  if (token === "BECMG") return "BECMG";
  if (token === "TEMPO") return "TEMPO";
  if (/^PROB\d{2}$/.test(token)) return "PROB";
  return "BASE";
}

function getTafGroupWindow(group, index, groups, issuedAt, baseStart, baseEnd) {
  if (group.changeType === "FM") {
    const validFrom = tafFmToDate(group.changeToken, issuedAt);
    return { validFrom, validTo: getNextPrevailingStart(groups, index + 1, issuedAt, baseEnd) };
  }

  if (group.changeType === "BECMG" || group.changeType === "TEMPO" || group.changeType === "PROB") {
    const window = tafWindowFromGroup(group, issuedAt);
    if (group.changeType === "BECMG") {
      return { validFrom: window.validFrom, validTo: getNextPrevailingStart(groups, index + 1, issuedAt, baseEnd) };
    }
    return window;
  }

  return { validFrom: baseStart, validTo: getNextPrevailingStart(groups, index + 1, issuedAt, baseEnd) };
}

function getNextPrevailingStart(groups, startIndex, issuedAt, fallback) {
  const next = groups.slice(startIndex).find((group) => group.changeType === "FM" || group.changeType === "BECMG");
  if (!next) return fallback;
  if (next.changeType === "FM") return tafFmToDate(next.changeToken, issuedAt);
  return tafWindowFromGroup(next, issuedAt).validFrom;
}

function tafWindowFromGroup(group, issuedAt) {
  const windowToken = group.changeType === "BECMG" || group.changeType === "TEMPO" || group.changeType === "PROB"
    ? group.raw.match(/\b(\d{4})\/(\d{4})\b/)?.[0]
    : null;
  if (!windowToken) return { validFrom: issuedAt, validTo: issuedAt };
  const validFrom = tafWindowBoundaryToDate(windowToken.slice(0, 4), issuedAt);
  const validTo = tafWindowBoundaryToDate(windowToken.slice(5, 9), validFrom);
  return { validFrom, validTo };
}

function extractWind(raw) {
  return raw.match(/\b(?:\d{3}|VRB)\d{2,3}(?:G\d{2,3})?KT\b/)?.[0] || null;
}

function extractVisibility(raw) {
  const tokens = raw.split(/\s+/);
  let visibilitySource = null;
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token === "P6SM" || /^\d{1,2}(?:\/\d)?SM$/.test(token) || /^\d{4}$/.test(token)) {
      visibilitySource = token;
      break;
    }
    if (/^\d+$/.test(token) && /^\d\/\dSM$/.test(tokens[index + 1] || "")) {
      visibilitySource = `${token} ${tokens[index + 1]}`;
      break;
    }
  }
  if (!visibilitySource) return { visibilitySm: null, visibilitySource: null };
  if (visibilitySource === "P6SM") return { visibilitySm: 6.1, visibilitySource };
  if (/^\d{4}$/.test(visibilitySource)) {
    return { visibilitySm: metersToSm(Number(visibilitySource)), visibilitySource: `${visibilitySource}M` };
  }
  return { visibilitySm: parseVisibilitySm(visibilitySource), visibilitySource };
}

function metersToSm(meters) {
  return Math.round((meters / 1609.344) * 10) / 10;
}

function parseVisibilitySm(value) {
  const clean = value.replace("SM", "");
  if (clean.includes(" ")) {
    const [whole, fraction] = clean.split(" ");
    return Number(whole) + parseFraction(fraction);
  }
  if (clean.includes("/")) return parseFraction(clean);
  return Number(clean);
}

function parseFraction(value) {
  const [numerator, denominator] = value.split("/").map(Number);
  return denominator ? numerator / denominator : 0;
}

function extractCeiling(raw) {
  const matches = [...raw.matchAll(/\b(BKN|OVC|VV)(\d{3})(CB)?\b/g)];
  if (!matches.length) return { ceilingFt: null, ceilingSource: null };
  const lowest = matches.reduce((current, match) => (Number(match[2]) < Number(current[2]) ? match : current));
  return {
    ceilingFt: Number(lowest[2]) * 100,
    ceilingSource: lowest[0]
  };
}

function tafTokenToDate(token) {
  const now = new Date();
  const day = Number(token.slice(0, 2));
  const hour = Number(token.slice(2, 4));
  const minute = Number(token.slice(4, 6));
  return nearestUtcDate(day, hour, minute, now);
}

function tafWindowBoundaryToDate(token, referenceDate) {
  const day = Number(token.slice(0, 2));
  const hour = Number(token.slice(2, 4));
  const date = nearestUtcDate(day, hour, 0, referenceDate);
  if (date < referenceDate && Math.abs(date - referenceDate) > 12 * 60 * 60 * 1000) {
    date.setUTCMonth(date.getUTCMonth() + 1);
  }
  return date;
}

function tafFmToDate(token, referenceDate) {
  const day = Number(token.slice(2, 4));
  const hour = Number(token.slice(4, 6));
  const minute = Number(token.slice(6, 8));
  return nearestUtcDate(day, hour, minute, referenceDate);
}

function nearestUtcDate(day, hour, minute, referenceDate) {
  const date = new Date(Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), day, hour, minute));
  const diff = date - referenceDate;
  if (diff > 15 * 24 * 60 * 60 * 1000) date.setUTCMonth(date.getUTCMonth() - 1);
  if (diff < -15 * 24 * 60 * 60 * 1000) date.setUTCMonth(date.getUTCMonth() + 1);
  return date;
}

function getLatestIssueTime(airports) {
  const issueTimes = Object.values(airports)
    .map((airport) => airport.tafRaw?.match(/\b(\d{6})Z\b/)?.[1])
    .filter(Boolean)
    .map((token) => tafTokenToDate(`${token}Z`).getTime());
  if (!issueTimes.length) return null;
  return new Date(Math.max(...issueTimes)).toISOString();
}

function isLikelyConus(icao) {
  return /^K[A-Z0-9]{3}$/.test(icao);
}

function createSampleAirport(icao, name, wind, ceilingFt, visibilitySm) {
  return {
    name,
    conus: true,
    metar: `${icao} 291456Z ${wind} ${visibilitySm}SM SCT025 BKN${String(Math.round(ceilingFt / 100)).padStart(3, "0")} 28/21 A2992`,
    tafRaw: `${icao} 291120Z 2912/3018 ${wind} P6SM SCT025 BKN${String(Math.round(ceilingFt / 100)).padStart(3, "0")} FM291800 ${wind} P6SM SCT030 BKN${String(Math.round(Math.max(ceilingFt - 500, 1500) / 100)).padStart(3, "0")}`,
    taf: [
      {
        validFrom: "2026-05-29T10:00:00Z",
        validTo: "2026-05-29T18:00:00Z",
        ceilingFt,
        ceilingSource: `BKN${String(Math.round(ceilingFt / 100)).padStart(3, "0")}`,
        visibilitySm,
        visibilitySource: "P6SM",
        wind,
        raw: `FM291000 ${wind} P6SM SCT025 BKN${String(Math.round(ceilingFt / 100)).padStart(3, "0")}`
      },
      {
        validFrom: "2026-05-29T18:00:00Z",
        validTo: "2026-05-30T02:00:00Z",
        ceilingFt: Math.max(ceilingFt - 500, 1500),
        ceilingSource: `BKN${String(Math.round(Math.max(ceilingFt - 500, 1500) / 100)).padStart(3, "0")}`,
        visibilitySm: 6,
        visibilitySource: "P6SM",
        wind,
        raw: `FM291800 ${wind} P6SM SCT030 BKN${String(Math.round(Math.max(ceilingFt - 500, 1500) / 100)).padStart(3, "0")}`
      }
    ],
    notams: []
  };
}

function getRedPracticeMissionData() {
  const now = new Date();
  const validFrom = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const validTo = new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString();
  const airports = {
    KDOV: createPracticeAirport("KDOV", "Dover AFB", "18012KT", 800, "OVC008", 2, "2SM", "-RA BR"),
    KRIC: createPracticeAirport("KRIC", "Richmond Intl", "19014KT", 900, "OVC009", 2.5, "2SM", "RA BR"),
    KCHS: createPracticeAirport("KCHS", "Joint Base Charleston", "22018G28KT", 1800, "BKN018", 4, "4SM", "SHRA"),
    KMEI: createPracticeAirport("KMEI", "Key Field", "19004KT", 500, "OVC005", 6, "P6SM", "BR"),
    KVPS: createPracticeAirport("KVPS", "Eglin AFB", "23028G36KT", 3500, "BKN035", 8, "P6SM", "NSW")
  };

  Object.values(airports).forEach((airport) => {
    airport.taf[0].validFrom = validFrom;
    airport.taf[0].validTo = validTo;
  });

  return {
    pulledAt: now.toISOString(),
    sourceIssuedAt: now.toISOString(),
    practice: true,
    airports
  };
}

function createPracticeAirport(icao, name, wind, ceilingFt, ceilingSource, visibilitySm, visibilitySource, weather) {
  const visibility = visibilitySource === "P6SM" ? "P6SM" : visibilitySource;
  const raw = `FM300000 ${wind} ${visibility} ${weather} ${ceilingSource}`.replace(/\s+/g, " ").trim();
  return {
    name,
    conus: true,
    metar: `${icao} 300000Z ${wind} ${visibility} ${weather} ${ceilingSource} 22/21 A2990`,
    tafRaw: `${icao} 300000Z 3000/3106 ${wind} ${visibility} ${weather} ${ceilingSource}`,
    taf: [
      {
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
        ceilingFt,
        ceilingSource,
        visibilitySm,
        visibilitySource,
        wind,
        raw
      }
    ],
    notams: []
  };
}

window.rulesMetadata = rulesMetadata;
window.getMissionData = getMissionData;
window.getLiveMissionData = getLiveMissionData;
window.getRedPracticeMissionData = getRedPracticeMissionData;
