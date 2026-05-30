# Alternate Watch

A mobile-first PWA prototype for aircrew alternate weather and NOTAM awareness.

The app accepts departure, destination, takeoff time, landing/ETA time, and optional alternates. The default demo route is `KMCF` to `KMCF` with `KTPA` as the alternate. It displays the weather period that applies to those times, active sample NOTAMs, a CAO rules date, and the time the data package was pulled.

## Run

For live weather locally, run:

```text
node server.mjs
```

Then open `http://127.0.0.1:5173`.

Opening `index.html` directly still works, but live weather may fall back to sample data because AviationWeather.gov blocks direct browser requests without a same-origin proxy.

## Current State

- Dependency-free static PWA that can be opened directly from `index.html`
- Sample weather and NOTAM data
- Prototype green/yellow/red rules
- Installable manifest and service worker
- Dark Simba-branded theme using `public/SIMBA.jpg`

## Next Steps

- Replace placeholder thresholds with current AFMAN 11-202V3 / AMC supplement logic
- Add approved live weather and DAIP NOTAM connectors
- Replace `public/simba-mark.svg` with the real Simba logo
- Add GitHub Pages deployment workflow

This prototype is not approved for flight planning.
