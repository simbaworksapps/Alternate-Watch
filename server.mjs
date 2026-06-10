import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const port = Number(process.env.PORT || 5173);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json"
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (url.pathname === "/api/weather") {
      await proxyWeather(url, response);
      return;
    }

    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const filePath = normalize(join(root, decodeURIComponent(pathname)));
    if (!filePath.startsWith(normalize(root))) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(body);
  } catch (error) {
    response.writeHead(404);
    response.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Alternate Watch running at http://127.0.0.1:${port}`);
});

async function proxyWeather(url, response) {
  const type = url.searchParams.get("type");
  const ids = normalizeWeatherIds(url.searchParams.get("ids"));
  if (!["metar", "taf", "stationinfo"].includes(type) || !ids) {
    response.writeHead(400);
    response.end("Invalid weather request");
    return;
  }

  const params = new URLSearchParams({ ids, format: type === "stationinfo" ? "json" : "raw" });
  if (type === "metar") params.set("hours", "3");

  const awcResponse = await fetch(`https://aviationweather.gov/api/data/${type}?${params.toString()}`);
  if (!awcResponse.ok && type === "stationinfo") {
    response.writeHead(502);
    response.end("Weather source unavailable");
    return;
  }

  const awcText = awcResponse.ok ? await awcResponse.text() : "";
  const weatherData = await fillMissingWeatherReports(type, ids, awcText);
  if (!weatherData.text && !awcResponse.ok) {
    response.writeHead(502);
    response.end("Weather source unavailable");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": type === "stationinfo" ? "max-age=86400" : "max-age=60",
    "Content-Type": type === "stationinfo" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8",
    "X-Weather-Sources": formatWeatherSourceHeader(weatherData.sources)
  });
  response.end(weatherData.text);
}

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
  const response = await fetch(`https://tgftp.nws.noaa.gov/data/${folder}/stations/${icao}.TXT`);
  if (!response.ok) return "";
  return normalizeNoaaStationWeatherText(type, icao, await response.text());
}

function normalizeNoaaStationWeatherText(type, icao, text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\d{4}\/\d{2}\/\d{2}\s+\d{2}:\d{2}$/.test(line))
    .filter((line) => !/^(METAR|SPECI|TAF)$/.test(line));
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
