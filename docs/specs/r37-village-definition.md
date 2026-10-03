# R37 — Inhabited village setting and model definition

## Goal

Replace the default empty rural field with an inhabited Portuguese village square inspired by the Porto region. Keep the house as the actual configurable 3D model and correct visible material/rendering defects. Provide true high-resolution output, without presenting upscaled imagery as native detail.

## Scope

Original panoramic village backdrop with distant pedestrians, shops, cafe and Portuguese architecture; local PBR stone forecourt/contact shadows; preserve optional garden and neutral technical backgrounds. Fix repeated lighting in uniform exterior samples. Improve display pixel density and shadows. Add native8K export if supported, keep4K/ZIP/PDF/window controls intact. No invented manufacturer textures, surveyed location, prices or included land. Panorama people are contextual photographic figures, not animated3Dcharacters.

## Acceptance criteria

- [x] AC1: WHEN the exterior first loads THE SYSTEM SHALL show the real configured module in the inhabited village setting, with optional garden/studio and correct resource readiness/failure handling.
- [x] AC2: WHEN a uniform sampled exterior colour is selected THE SYSTEM SHALL avoid tiling photographed lighting artifacts and preserve the original catalogue reference and selected configuration.
- [x] AC3: WHEN the module is displayed THE SYSTEM SHALL use bounded high-density rendering and sharper contact shadows without breaking responsive interaction or neutral technical views.
- [x] AC4: WHEN8K export is selected THE SYSTEM SHALL render and verify7680×4320nativepixels or report an explicit device limitation, never silently upscale, and restore the interactive renderer.
- [x] AC5: WHEN a customer changes languages or opens the presentation THE SYSTEM SHALL show correct PT/EN/ES setting and image controls, keep prices, openings and private data boundaries unchanged.
- [x] AC6: WHEN released THE SYSTEM SHALL pass browser/visual and core/options regression and serve reviewed asset hashes publicly.

## Test map

- AC1 → test: scripts/r37-village-browser.mjs environment and missing-resource scenarios
- AC2 → test: scripts/r37-material-regression.mjs plus browser surface inspection
- AC3 → test: scripts/r37-village-browser.mjs density, shadows, technical views and responsive captures
- AC4 → test: scripts/r37-export-regression.mjs and actual browser8Kdownload
- AC5 → test: scripts/r37-village-browser.mjs PT/EN/ES; scripts/r34-window-browser.mjs; scripts/r36-presentation-browser.mjs retained configuration/ZIP tests
- AC6 → test: npm test; scripts/project-options-regression.mjs; publicbrowser and SHA256receipt

## Release constraints

Use clean public-main checkout; source remains historically dirty. Base is R36mainf134b4cd4227db428463b929aeb4d64ba8d0b6c5. Preserve immutable original generated image and record its true dimensions, prompt and terrain licences. Do not claim panorama has higher native resolution than the actual file.
