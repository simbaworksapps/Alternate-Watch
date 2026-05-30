# Rules Mapping

This file is the working bridge between the governing guidance and app logic.

Current status: prototype only. The thresholds in `src/rules.js` are placeholders until the current AFMAN 11-202V3 and AMC supplement language is reviewed and mapped.

## Metadata

- CAO date shown in the app: `2026-05-29`
- Data pulled timestamp shown in the app: generated every time the sample data adapter runs
- Intended production behavior: every displayed weather/NOTAM package must show both the source valid time and the application pull time

## Prototype Checks

| Area | Current app logic | Needed before operational use |
| --- | --- | --- |
| Departure weather | Red below 2,000 ft ceiling or below 3 SM visibility; yellow at/below 2,500 ft ceiling or 5 SM. Ceiling means BKN/OVC/VV only, not FEW/SCT. | Map real departure minimums by aircraft, approach category, and local guidance |
| Destination weather | Red below 2,000 ft ceiling or below 3 SM visibility; yellow at/below 2,500 ft ceiling or 5 SM. Ceiling means BKN/OVC/VV only, not FEW/SCT. | Encode exact 202V3/AMC alternate requirement rule and ETA window |
| Alternate weather | Red below 2,000 ft ceiling or below 3 SM visibility; yellow at/below 2,500 ft ceiling or 5 SM. Ceiling means BKN/OVC/VV only, not FEW/SCT. | Encode published alternate minimums, approach availability, and timing window |
| NOTAMs | Flags active runway, approach, and lighting NOTAMs as yellow | Parse DAIP NOTAMs by effective time, system affected, runway, approach, and impact |
| OCONUS | Departure or destination airfield with `conus: false` highlights the airfield name red and drives red status | Replace sample `conus` flag with authoritative airport location/source data |

## Review Principle

The app should show the exact data and rule explanation behind each color decision. AI summaries can help readability, but the final green/yellow/red status should come from deterministic, auditable rule logic.
