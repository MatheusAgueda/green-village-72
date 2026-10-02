# R31 — Visible animated water drops and lightning

Validated locally on 2026-10-02. The user requested recognisable moving lightning bolts and water motion, rather than the subtle travelling highlights in R30.

## Delivered

- Outlined yellow lightning bolts move along electrical routes. Water drops move with the blue, orange and green water/drain highlights, retaining their respective directions.
- Vector symbols face the camera and remain readable at overview scale. Their centres stay on the original routes through bends; shared branches deduplicate coincident markers. Symbol spacing has an independent phase so the smaller highlight cycle cannot make them jump.
- Existing play/pause/speed, reduced-motion, hidden/offscreen gating and route geometry remain intact. Materials retain depth testing; building geometry occludes the symbols. The internal fluid/conduit material no longer writes depth, allowing symbols inside it to show.
- No commercial values, customer selections, dimensions, images or video sources changed. These remain illustrative circuit animations.

## Verification

| Check | Result |
| --- | --- |
| Core regression | 47 passed |
| Retained R29/R30 flow | 13 groups passed |
| Junction renderer | 14 variants passed |
| R31 actual symbol geometry | 6 groups, all 14 layout/bathroom variants; 617 symbols and 27 distinct resources disposed exactly once |
| R31 browser | 5 groups passed: real desktop/mobile navigation, rendered symbol movement, pause/rotation/speed, reduced-motion explicit Play, and both deep links |

Browser checks compare actual WebGL image pixels and positions between successive frames, and require an unchanged canvas while paused after camera settling. They report zero JavaScript or WebGL errors. Desktop overview A/B frames were visually inspected independently: both symbol types are recognisable and change location on the routes.

Evidence: `audit/r31/motion-result.json`, `audit/r31/browser/result.json`, the surrounding image pairs and `audit/r31/preview-errors.json`. Browser viewport emulation does not constitute testing on physical mobile hardware. Publication receipt is recorded separately after deployment and public verification.
