# Alternate Watch

Use the app here: https://alternate-watch.pages.dev/

Alternate Watch is a mobile-friendly PWA training tool for aircrew to review destination and alternate weather against prototype alternate-planning thresholds.

The app pulls live METAR/TAF weather through Aviation Weather Center data when deployed with the included Cloudflare Pages function. NOTAM integration is not currently available, so the app clearly marks NOTAMs as unavailable.

This tool is for training and awareness only. It is not approved for operational flight planning.

## What It Does

- Accepts takeoff Zulu date/time, landing/ETA Zulu date/time, departure, destination, and alternates.
- Shows current local time and Zulu time for reference.
- Pulls available METAR and TAF data from AWC through the included backend proxy.
- Evaluates takeoff at takeoff time and destination/alternates at ETA plus or minus 1 hour.
- Displays METAR/TAF availability chips, data age, TAF currency, and whether takeoff/landing times are inside the TAF window.
- Highlights applicable TAF timing references with `T`, `L`, `ETA-1`, and `ETA+1`.
- Lets users tap METAR and TAF lines to expand training decodes.
- Supports SIMBA assist, which can show or hide weather answer colors/chips for training.
- Supports custom weather limits saved on the device.
- Shows whether the active run is using factory limits or custom limits.
- Supports installable mobile PWA behavior.

## Default Alternates

The default alternate list is:

```text
KTPA, KCOF, KHST, KPAM, KVPS, KWRB, KCHS, KBHM, KMEI, KGSB
```

Users can edit the list before checking a mission. The defaults panel can also save a preferred departure, destination, alternates list, dice region settings, SIMBA assist default state, and custom weather limits on the device.

## Custom Limits

The Defaults panel includes compact limit tiles for:

- Ceiling
- Visibility
- Wind

Users can tap a tile to edit the yellow and red trigger values saved on that device. Visibility and wind limits include a ruler button that opens a conversion table because the app treats SM/KT thresholds as applying to equivalent metric values when the METAR or TAF reports meters or meters per second.

The Review Required or Review Items box shows either `FACTORY LIMITS` or `CUSTOM LIMITS`. Tapping that pill opens the active limits page so users can see exactly which thresholds are being applied.

Factory limits are:

```text
Ceiling: yellow 2,500 ft AGL, red 2,000 ft AGL
Takeoff ceiling: red 300 ft AGL, takeoff alternate 200 ft AGL
Visibility: yellow 5 SM, red 3 SM
Wind: yellow above 15 kt, red above 25 kt
```

Custom limits affect normal mission checks and red-dice bad-weather practice searches. If a user raises red wind to `50 kt`, the red dice searches for airfields that are red using that saved `50 kt` trigger.

The app corrects invalid limit combinations before saving, such as red wind being lower than yellow wind or red visibility being higher than yellow visibility.

## How To Use

1. Set takeoff Zulu date/time.
2. Set landing/ETA Zulu date/time.
3. Enter the departure ICAO.
4. Enter the destination ICAO.
5. Enter alternates separated by commas or spaces.
6. Select `Check Mission`.

All mission evaluation times are Zulu. The date attached to each takeoff/landing input is the Zulu date used by the TAF logic.

## SIMBA Assist

The star button toggles SIMBA assist.

When assist is on, the app shows weather answer colors, issue chips, and weather values for ceiling, visibility, and wind.

When assist is off, the app hides those answer cues so the user must evaluate the METAR and TAF. The app still shows airfields, METAR/TAF availability chips, raw weather, and decode tools.

In assist-off mode:

- Review Required changes to `Review Items`.
- An `Assist Off` pill appears.
- The `FACTORY LIMITS` or `CUSTOM LIMITS` pill remains available so users can review the thresholds without revealing the weather answers.
- RED/YEL/GRN counts are hidden to avoid giving away the answer.
- Card borders and status pills go neutral.

## Time References

Each card is evaluated against the mission time that applies to that airfield:

- Departure card: takeoff Zulu time.
- Destination card: landing/ETA Zulu time, plus or minus 1 hour for alternate review.
- Alternate cards: landing/ETA Zulu time, plus or minus 1 hour for alternate review.

The card header shows `T/O` or `LND` with the evaluated Zulu time. The small green/red time pill shows how far that evaluated time is from the current clock.

TAF lines can show:

- `T`: takeoff time falls in that TAF period.
- `L`: landing/ETA time falls in that TAF period.
- `ETA-1`: one hour before ETA falls in that TAF period.
- `ETA+1`: one hour after ETA falls in that TAF period.

## Color Logic

Cards and chips use three colors when assist is on:

- Green: no issue identified for the evaluated period.
- Yellow: approaching a threshold.
- Red: exceeds a critical threshold or requires attention.

Factory weather logic:

- Ceiling below `2,000 ft AGL` is red.
- Ceiling at or below `2,500 ft AGL` is yellow.
- Visibility below `3 SM` is red.
- Visibility at or below `5 SM` is yellow.
- Wind greater than `15 kt` is yellow.
- Wind greater than `25 kt` is red.
- Takeoff ceiling below `300 ft AGL` flags red.
- Takeoff ceiling below `200 ft AGL` drives takeoff alternate review.

Ceiling uses the lowest `BKN`, `OVC`, or `VV` layer. For example, `VV002` is treated as a `200 ft AGL` ceiling.

`TEMPO` lines override the weather elements they state. If a `TEMPO` line changes visibility or wind but does not state a ceiling, the app keeps the underlying prevailing ceiling for that ceiling value.

`BECMG` lines are handled as transition periods. During the transition window, the app considers the previous/underlying condition and the becoming condition so the worst applicable value is not missed.

If custom limits are saved, the same logic is applied using those custom thresholds instead of the factory thresholds.

## OCONUS Logic

If a departure or destination airfield is outside CONUS, the app shows an `OCONUS` chip because that can drive alternate planning review.

The card itself can still remain green if the weather is good. This helps users understand the item is location/rule-related, not necessarily weather-related.

## METAR And TAF Decode

Tap a raw METAR or TAF line to expand a training decode.

METAR decode includes items such as:

- Station
- Observation time
- Wind, including MPS-to-knot conversion
- Visibility, including meter-to-SM conversion
- Weather
- Clouds and vertical visibility
- Temperature/dewpoint
- Altimeter
- Common remarks such as `AO2`, `SLP`, precise temperature groups, precipitation groups, lightning, runway state groups, QFE groups, and maintenance indicators

TAF decode includes items such as:

- Change type: `FM`, `BECMG`, `TEMPO`, `PROB`, and related regional groups
- Valid time
- Wind, including MPS-to-knot conversion
- Visibility, including meter-to-SM conversion
- Weather
- Clouds
- Remarks/admin items such as `QNH`, `TX`, `TN`, `LAST NO AMD`, `AFT`, and `NEXT`

If a token cannot be decoded, the app lists it in a `Not Decoded` section instead of silently dropping it.

## Search And Dice

The airfield search uses the included offline airport search file. If an airport is not listed, users can still type a valid ICAO directly into the field and run the mission.

The white dice generates a random practice mission. The red dice searches for bad-weather practice missions that evaluate red using the active saved limits. Dice region settings can include CONUS, OCONUS, or both.

If the red dice cannot find three live red-weather fields quickly enough, the app reports what it found and may use sample fields for practice continuity.

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
