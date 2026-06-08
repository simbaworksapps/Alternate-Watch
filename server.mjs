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
  if (!awcResponse.ok) {
    response.writeHead(502);
    response.end("Weather source unavailable");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": type === "stationinfo" ? "max-age=86400" : "max-age=60",
    "Content-Type": type === "stationinfo" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8"
  });
  response.end(await awcResponse.text());
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
