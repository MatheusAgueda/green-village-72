# R30 — Continuous flow through bends

Validated locally on 2026-10-02. This revision continues the R29 service-circuit presentation.

## Corrections

- A highlight now splits across adjoining pipe/conduit segments, preserving its total illuminated length through bends. Route endpoints clip only the entering/leaving part. Shared collinear intervals merge to avoid double brightness at branch junctions.
- A native IntersectionObserver suspends the main renderer and flow phase when the model viewport is offscreen. Returning to the model starts with a fresh frame interval, retaining pause and speed settings.
- Electrical junction boxes are deduplicated by position. T0 now renders 2 physical boxes for 6 logical branches; T4 renders 6 for 18. Socket, switch and lighting endpoints remain present.

## Verification

| Check | Result |
| --- | --- |
| Core regression | 47 checks passed |
| Flow regression | 13 groups passed, including all prior 10 checks plus curve-length conservation, short/diagonal fragments and partial branch overlap |
| Full model variants | 14 variants, 340 routes; finite transforms and bounded instance capacity |
| Junction renderer | All 14 layout/bathroom variants passed uniqueness and terminal-preservation checks |
| R30 browser | 6 groups passed: actual offscreen scrolling, pause/speed persistence, zoom/rotation/keyboard focus, 385/768/1440 responsive views, repeated reconstruction |
| R29 browser retained | 11 groups passed, including real 4K export, translations, reduced motion and resource stability |
| R28 geometry retained | Glazing/window/deck, 2,016 aperture rays, 28 price/persistence cases and expansion restoration passed |

Both browser suites reported zero JavaScript or WebGL errors. R30 used real scrolling and the browser's IntersectionObserver, with a test-only bottom spacer when the natural document could not scroll the model entirely offscreen. The older R29 hidden-document check remains explicitly synthetic. Close-up frame pairs and responsive screenshots were reviewed.

Evidence: `audit/r30/browser/result.json`, `audit/r30/r29-regression/result.json` and their neighbouring screenshots. Flow remains illustrative; no pressure/current measurements, prices or commercial selections were introduced.
