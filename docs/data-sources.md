# Data Sources

The app tries to load live weather through `/api/weather`, then falls back to direct AWC access, then local sample data. A same-origin proxy is required for browser deployments because AviationWeather.gov does not expose CORS headers for direct PWA fetches.

Live NOTAMs are currently unavailable, so the app displays an explicit unavailable message instead of presenting sample NOTAMs as operational data.

## Planned Connectors

- Weather: approved METAR/TAF source for departure, destination, and alternates
- NOTAMs: DAIP or approved DAIP-derived access path
- Airport/approach data: source for published alternate minimums and approach availability

## Display Requirements

Every result should show:

- Data pulled time
- Weather issue/valid time
- NOTAM active window
- Rules CAO date
- Source adapter name once live integrations are added

## Operational Caveat

This starter is not approved for flight planning. It is a prototype for UI, workflow, and rules-mapping discussion.
