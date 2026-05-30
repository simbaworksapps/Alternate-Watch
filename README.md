# Alternate Watch

Use the app here: https://alternate-watch.pages.dev/

Alternate Watch is a mobile-friendly PWA training tool for aircrew to review destination and alternate weather against prototype alternate-planning thresholds.

The app pulls live METAR/TAF weather through Aviation Weather Center data when deployed with the included Cloudflare Pages function. NOTAM integration is not currently available, so the app clearly marks NOTAMs as unavailable.

This tool is for training and awareness only. It is not approved for operational flight planning.

## What It Does

- Accepts departure, destination, mission date, takeoff Zulu, landing/ETA Zulu, and alternates.
- Evaluates the weather period that applies to the takeoff or landing time.
- Highlights applicable TAF lines with:
  - `T` for takeoff
  - `L` for landing/ETA
- Displays color-coded status cards and issue chips.
- Lets users tap METAR and TAF lines to decode the raw weather.
- Shows the CAO date and the time the data was pulled.
- Supports installable mobile PWA behavior.

## Default Alternates

The default alternate list is:

```text
KTPA, KCOF, KHST, KPAM, KVPS, KWRB, KCHS, KBHM, KMEI, KGSB
```

Users can edit the list before checking a mission.

## How To Use

1. Enter the departure ICAO.
2. Enter the destination ICAO.
3. Select the mission date.
4. Enter takeoff time in Zulu, such as `0923Z`.
5. Enter landing/ETA time in Zulu, such as `1223Z`.
6. Enter alternates separated by commas.
7. Select `Check Mission`.

All mission times are handled as Zulu. The date is also treated as the Zulu mission date.

## What “Evaluated At” Means

Each card is evaluated against the mission time that applies to that airfield:

- Departure card: takeoff Zulu time.
- Destination card: landing/ETA Zulu time.
- Alternate cards: landing/ETA Zulu time.

The app uses that time to choose the applicable TAF period and highlight the raw TAF line that drove the displayed ceiling, visibility, and wind.

## Color Logic

Cards and chips use three colors:

- Green: no issue identified for the evaluated period.
- Yellow: approaching a threshold.
- Red: exceeds a critical threshold or requires attention.

Current prototype weather logic:

- Ceiling below `2,000 ft AGL` is red.
- Ceiling at or below `2,500 ft AGL` is yellow.
- Visibility below `3 SM` is red.
- Visibility at or below `5 SM` is yellow.
- Wind greater than `15 kt` is yellow.
- Wind greater than `25 kt` is red.

Ceiling uses the lowest `BKN`, `OVC`, or `VV` layer. For example, `VV002` is treated as a `200 ft AGL` ceiling.

`TEMPO` lines override only the weather elements they state. If a `TEMPO` line changes visibility or wind but does not state a ceiling, the app keeps the underlying prevailing ceiling.

## OCONUS Logic

If a departure or destination airfield is outside CONUS, the app shows a red `OCONUS` chip because that can drive an alternate requirement.

The card itself can still remain green if the weather is good. This helps users understand the item is red because of location/rule logic, not because weather is below minimums.

## METAR And TAF Decode

Tap a raw METAR or TAF line to expand a training decode.

METAR decode includes items such as:

- Station
- Observation time
- Wind
- Visibility
- Weather
- Clouds and vertical visibility
- Temperature/dewpoint
- Altimeter
- Common remarks such as `AO2`, `SLP`, precise temperature groups, precipitation groups, and `$`

TAF decode includes items such as:

- Change type: `FM`, `BECMG`, `TEMPO`, `PROB`
- Valid time
- Wind
- Visibility
- Weather
- Clouds
- Remarks/admin items such as `QNH`, `TX`, `TN`, `LAST NO AMD`, `AFT`, and `NEXT`

## NOTAMs

NOTAM data is currently unavailable in this prototype.

The app intentionally displays:

```text
NOTAM feature currently unavailable.
```

Future NOTAM support should use an approved FAA, DAIP, or other authorized NOTAM source through a backend connector.

## Run Locally

For local live-weather testing, run:

```text
node server.mjs
```

Then open:

```text
http://127.0.0.1:5173
```

Opening `index.html` directly can display the app, but live AWC weather may not work because Aviation Weather Center requests need a same-origin proxy.

## Deploy

This app is intended to deploy on Cloudflare Pages.

Important files:

```text
index.html
manifest.webmanifest
sw.js
src/
public/SIMBA.jpg
functions/api/weather.js
```

The Cloudflare Pages function at `functions/api/weather.js` proxies live weather requests so the browser can use AWC data.

## Install On Mobile

After deployment:

1. Open the Cloudflare Pages URL on a phone.
2. Use the browser install option:
   - iPhone Safari: Share -> Add to Home Screen.
   - Android Chrome: Install app or Add to Home Screen.
3. Open Alternate Watch from the home screen.

If the app appears stale after an update, close and reopen it or refresh the browser tab. The service worker cache is versioned in `sw.js`.
