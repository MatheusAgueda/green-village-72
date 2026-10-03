# R36 — Immersive client presentation

Verified and published on 2026-10-03. Application commit: `13eb029432d00c8749638c3da6db473ffefdd207`. GitHub Pages deployment `37081482628` succeeded.

Public entry: https://matheusagueda.github.io/green-village-72/?v=r36

## Changes

- Presentation mode expands the existing canvas, with manual room navigation, optional guided playback, daylight/late-afternoon light and image downloads.
- A guided tour visits arrival, garden, overview, interior, available kitchen and bathroom. Dragging, hiding the document, exporting or leaving pauses playback. Reduced-motion preferences disable camera interpolation.
- Leaving restores the original view, hidden layers, openings, light, page and focus. Priced configuration remains unchanged.
- A local ZIP export contains three native 3840 × 2160 PNGs, validated public configuration and a PT/EN/ES README. Private client records are excluded. Asset failures prevent an incomplete export.
- The 4K gallery highlights the client's current configuration above the older example renders.
- Compact presentation controls, responsive layout and a dedicated touch-sized presentation dock. Translation now survives replacing a previously translated caption.

## Verification actually executed

| Check | Result |
| --- | --- |
| Core regression | 47 passed |
| Project options and prices | 916 passed, 0 failed |
| Stage regression | 9 passed |
| Runtime viewport/layer regression | 2 passed |
| ZIP structure, CRC, dimensions, names and privacy | 7 groups passed |
| R36 real-browser presentation suite | 10 local and 10 public checks passed |
| Caption translation regression | 3 local and 3 public groups passed |
| Existing multilingual browser suite | 19 passed |
| Window editor and opening controls | 8 passed |
| Client records, JSON, attachments and sharing | 14 passed |
| Actual client PDF | 18 pages verified |
| Changed/new public application assets | 10/10 HTTP 200, SHA256 matches |
| Public import map | 51/51 module hashes match source and release |
| Root entry | HTTP 200; Chrome confirmed query-preserving redirect to /dist/ |

Desktop, tablet and phone were inspected at 1440, 768 and 390 pixels in PT/EN/ES. The new presentation suite also checks successful ZIP download, failed image encoding, missing HDR, restored openings and focus, manual pause, visibility-change pause and reduced motion. Public presentation and translation runs recorded no JavaScript page errors.

## Evidence

- `audit/r36/publication.json`: public HTTP statuses and SHA256 receipt.
- `audit/r36/public-browser/result.json`: actual public interaction results.
- `audit/r36/public-browser/current-configuration-4k.zip`: actual public download.
- `audit/r36/public-browser/archive-validation.json`: decoded ZIP entry names, PNG dimensions and CRC result.
- `audit/r36/windows/result.json`, `audit/r36/client/report.json`: preserved configurator/client behaviour.
- `docs/audit/r36/`: responsive visual inspection captures.

The evidence artifacts above are retained in the working project; client test files and large generated ZIPs are not published as website assets.

## Limits and resources

No external image/video generation API was used. Existing local rendering and licensed R35 assets were reused. Vault metadata did not establish provider free balances; no unverified allowance was treated as available credit. See `r36-resources.md`.

The garden is an illustrative setting, not a surveyed plot in Porto or a priced inclusion. This release does not invent manufacturer details or change catalogue prices. Verification covers the stated scenarios and failure paths; it is not a claim that every possible browser/device defect is absent.
