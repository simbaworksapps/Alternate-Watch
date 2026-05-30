export async function onRequestGet(context) {
  const { searchParams } = new URL(context.request.url);
  const type = searchParams.get("type");
  const ids = searchParams.get("ids");

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

  return new Response(await response.text(), {
    headers: {
      "Cache-Control": type === "stationinfo" ? "max-age=86400" : "max-age=60",
      "Content-Type": type === "stationinfo" ? "application/json; charset=utf-8" : "text/plain; charset=utf-8"
    }
  });
}
