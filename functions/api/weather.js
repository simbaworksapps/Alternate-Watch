export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const type = searchParams.get("type");
  const ids = normalizeWeatherIds(searchParams.get("ids"));

  if (!["metar", "taf", "stationinfo"].includes(type) || !ids) {
    return new Response("Invalid weather request", { status: 400 });
  }

  const params = new URLSearchParams({
    ids,
    format: type === "stationinfo" ? "json" : "raw"
  });

  if (type === "metar") {
    params.set("hours", "3");
  }

  const awcUrl = `https://aviationweather.gov/api/data/${type}?${params.toString()}`;
  const response = await fetch(awcUrl, {
    headers: {
      "User-Agent": "Alternate-Watch-PWA"
    }
  });

  if (!response.ok && type === "stationinfo") {
    return new Response("Weather source unavailable", { status: 502 });
  }

  const awcText = response.ok ? await response.text() : "";
  const weatherData = await fillMissingWeatherReports(type, ids, awcText);
  if (!weatherData.text && !response.ok) {
    return new Response("Weather source unavailable", { status: 502 });
  }

  return new Response(weatherData.text, {
    headers: {
      "Cache-Control": type === "stationinfo" ? "max-age=86400" : "max-age=60",
      "Content-Type": type === "stationinfo" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
      "X-Weather-Sources": formatWeatherSourceHeader(weatherData.sources)
    }
  });
}

const NOAA_STATION_MAX_AGE_HOURS = {
  metar: 6,
  taf: 36
};

async function fillMissingWeatherReports(type, ids, text) {
  if (type !== "metar" && type !== "taf") return { text, sources: {} };
  const idList = ids.split(",");
  const awcReports = parseRawReports(text);
  const fallbackReports = {};
  const sources = {};

  await Promise.all(idList.map(async (icao) => {
    if (awcReports[icao] || weatherTextHasReport(text, icao)) {
      sources[icao] = "AWC";
      return;
    }
    const fallback = await fetchNoaaStationWeatherText(type, icao);
    if (fallback) {
      fallbackReports[icao] = parseRawReports(fallback)[icao] || fallback;
      sources[icao] = "NOAA";
    }
  }));

  return {
    text: idList
      .map((icao) => awcReports[icao] || fallbackReports[icao] || "")
      .filter(Boolean)
      .join("\n"),
    sources
  };
}

function formatWeatherSourceHeader(sources) {
  return Object.entries(sources || {})
    .map(([icao, source]) => `${icao}=${source}`)
    .join(",");
}

function weatherTextHasReport(text, icao) {
  return new RegExp(`(?:^|\\n)\\s*(?:METAR\\s+|SPECI\\s+|TAF\\s+(?:AMD\\s+|COR\\s+)?)?${icao}\\b`).test(text);
}

function parseRawReports(text) {
  return combineRawReports(text)
    .map((raw) => raw.trim())
    .filter((raw) => raw && !/^(METAR|SPECI|TAF)$/i.test(raw))
    .reduce((reports, raw) => {
      const normalized = raw
        .replace(/^(METAR|SPECI)\s+/, "")
        .replace(/^TAF\s+(AMD\s+|COR\s+)?/, "")
        .replace(/\s+\$/g, "")
        .trim();
      const icao = normalized.split(/\s+/)[0];
      if (/^[A-Z0-9]{4}$/.test(icao) && !reports[icao]) {
        reports[icao] = normalized;
      }
      return reports;
    }, {});
}

function combineRawReports(text) {
  return normalizeRawReportBoundaries(text)
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ""))
    .filter(Boolean)
    .filter((line) => !/^(METAR|SPECI|TAF)$/i.test(line.trim()))
    .reduce((reports, line) => {
      const startsReport = isRawReportStart(line);
      if (startsReport || reports.length === 0) {
        reports.push(line.trim());
      } else {
        reports[reports.length - 1] += `\n${line.trim()}`;
      }
      return reports;
    }, []);
}

function normalizeRawReportBoundaries(text) {
  return String(text || "")
    .replace(/\bTAF\s*\r?\n\s+(?=(?:AMD|COR)\s+[A-Z0-9]{4}\b)/g, "TAF ")
    .replace(/\s+(?=(?:METAR|SPECI|TAF)\s+(?:AMD\s+|COR\s+)?[A-Z0-9]{4}\b)/g, "\n")
    .replace(/\s+(?=(?:AMD\s+|COR\s+)?[A-Z0-9]{4}\s+\d{6}Z\b)/g, "\n");
}

function isRawReportStart(line) {
  const text = String(line || "").trim();
  return /^(METAR|SPECI|TAF)\s+/.test(text)
    || /^(?:AMD\s+|COR\s+)?[A-Z0-9]{4}\s+\d{6}Z\b/.test(text);
}

async function fetchNoaaStationWeatherText(type, icao) {
  const folder = type === "metar" ? "observations/metar" : "forecasts/taf";
  const response = await fetch(`https://tgftp.nws.noaa.gov/data/${folder}/stations/${icao}.TXT`, {
    headers: {
      "User-Agent": "Alternate-Watch-PWA"
    }
  });
  if (!response.ok) return "";
  return normalizeNoaaStationWeatherText(type, icao, await response.text());
}

function normalizeNoaaStationWeatherText(type, icao, text) {
  const rawLines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!isNoaaStationFileFresh(type, rawLines)) return "";
  const lines = rawLines
    .filter((line) => !/^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}$/.test(line))
    .filter((line) => !/^(METAR|SPECI|TAF)$/.test(line));
  const report = cleanNoaaWeatherReport(lines.join(type === "taf" ? "\n" : " "));
  if (!weatherTextHasReport(report, icao)) return "";
  return report;
}

function isNoaaStationFileFresh(type, lines, now = new Date()) {
  const fileTime = getNoaaStationFileTime(lines);
  if (!fileTime) return true;
  const maxAgeHours = NOAA_STATION_MAX_AGE_HOURS[type] || 24;
  const ageMs = now.getTime() - fileTime.getTime();
  if (ageMs < -10 * 60 * 1000) return false;
  return ageMs <= maxAgeHours * 60 * 60 * 1000;
}

function getNoaaStationFileTime(lines) {
  const timestamp = (lines || [])
    .map((line) => String(line || "").match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})$/))
    .find(Boolean);
  if (!timestamp) return null;
  return new Date(Date.UTC(
    Number(timestamp[1]),
    Number(timestamp[2]) - 1,
    Number(timestamp[3]),
    Number(timestamp[4]),
    Number(timestamp[5])
  ));
}

function cleanNoaaWeatherReport(report) {
  return String(report || "")
    .replace(/\s+\$/g, "")
    .replace(/\s+$/g, "")
    .trim();
}

function normalizeWeatherIds(value) {
  const ids = String(value || "")
    .split(",")
    .map((id) => id.trim().toUpperCase())
    .filter(Boolean);

  if (!ids.length || ids.length > 100) return "";
  if (!ids.every((id) => /^[A-Z0-9]{4}$/.test(id))) return "";
  return [...new Set(ids)].join(",");
}
