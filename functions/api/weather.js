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

  if (!response.ok) {
    return new Response("Weather source unavailable", { status: 502 });
  }

  const awcText = await response.text();
  const weatherData = await fillMissingWeatherReports(type, ids, awcText);

  return new Response(weatherData.text, {
    headers: {
      "Cache-Control": type === "stationinfo" ? "max-age=86400" : "max-age=60",
      "Content-Type": type === "stationinfo" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
      "X-Weather-Sources": formatWeatherSourceHeader(weatherData.sources)
    }
  });
}

async function fillMissingWeatherReports(type, ids, text) {
  if (type !== "metar" && type !== "taf") return { text, sources: {} };
  const reports = [text.trim()].filter(Boolean);
  const sources = {};

  await Promise.all(ids.split(",").map(async (icao) => {
    if (weatherTextHasReport(text, icao)) {
      sources[icao] = "AWC";
      return;
    }
    const fallback = await fetchNoaaStationWeatherText(type, icao);
    if (fallback) {
      reports.push(fallback);
      sources[icao] = "NOAA";
    }
  }));

  return { text: reports.join("\n"), sources };
}

function formatWeatherSourceHeader(sources) {
  return Object.entries(sources || {})
    .map(([icao, source]) => `${icao}=${source}`)
    .join(",");
}

function weatherTextHasReport(text, icao) {
  return new RegExp(`(?:^|\\n)\\s*(?:METAR\\s+|SPECI\\s+|TAF\\s+(?:AMD\\s+|COR\\s+)?)?${icao}\\b`).test(text);
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
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}$/.test(line));
  const report = cleanNoaaWeatherReport(lines.join(type === "taf" ? "\n" : " "));
  if (!weatherTextHasReport(report, icao)) return "";
  return report;
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
