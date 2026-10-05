# R38 — Five-language client portfolio, information audit and coherent scene

## Goal

Add full French and Italian alongside Portuguese, English and Spanish. Audit commercial information and customer workflows; fix reproducible bugs. Replace the visibly joined village photographs with coherent perspective and improve the physical appearance of the same configured house. No claim that a simulated location or unmeasured product material is a real photograph of Porto.

## Scope and boundaries

Language controls, persistent/query language, dynamic UI, accessible labels, presentation, downloadable client PDF and image-set README. Audit prices/quantities, standard kitchen/bathroom references, terms, plans, utilities, windows/doors, expansion, save/restore/share/client privacy and export. All commercial assertions must retain a traceable source and uncertainty where unresolved.

Visual corrections must preserve the configurable product, geometry, sources and selected finishes. Native resolution is checked independently from source texture resolution. A panorama cannot be claimed as an exact Porto site without evidence. Scene resources must have verified provenance/licence. User values prevail: vinyl included, SPC +1200 EUR; front glass2600 and long side5190;3windows per long side; delivery90–180workingdays plus30daysonsite;10/5/2warranties.

## Acceptance criteria

- [x] AC1: WHEN a customer chooses FR or IT THE SYSTEM SHALL translate static and dynamic authored UI, persist/query the language and preserve configuration and user-authored text.
- [x] AC2: WHEN a customer exports a PDF or image set in FR or IT THE SYSTEM SHALL localise authored document content and formatting while preserving prices, original source data and private customer fields.
- [x] AC3: WHEN external scenes are viewed THE SYSTEM SHALL avoid duplicated photographic seams, cut-off scenery and camera-dependent foreground overlap; the configured house remains interactive and sharply rendered.
- [x] AC4: WHEN commercial information is audited THE SYSTEM SHALL retain the verified current values and clearly separate standard inclusions, paid options and unresolved facts, with no invented manufacturer claims.
- [x] AC5: WHEN customers operate windows, doors, expansion, utility views, save/undo/share or export THE SYSTEM SHALL preserve their intended configuration and recover gracefully from failures.
- [ ] AC6: WHEN released THE SYSTEM SHALL pass the documented regression/browser/PDF/visual checks and serve the reviewed assets publicly from clean current main.

## Test map

- AC1 → test: scripts/r38-i18n-regression.mjs; scripts/r38-browser-audit.mjs; retained language regressions.
- AC2 → test: scripts/r38-documents-regression.mjs; scripts/r38-documents-regression.mjs --browser; scripts/r38-scene-browser.mjs actual PDF/ZIP.
- AC3 → test: scripts/r38-scene-regression.mjs; scripts/r38-scene-browser.mjs; independent desktop/tablet/mobile screenshots.
- AC4 → test: scripts/project-options-regression.mjs; scripts/r33-terms-regression.mjs; docs/audit/r38-information-audit.md with source evidence.
- AC5 → test: scripts/r34-window-browser.mjs; scripts/client-project-browser.mjs; scripts/r36-presentation-browser.mjs; deployment/opening/model suites.
- AC6 → test: npm test; scripts/r38-public-verify.mjs; public browser receipt and manifest.

## Delivery

Work in clean clone /Users/claraazevedo/Documents/green-village-72-r38 based on current public main. Do not publish historical dirty source checkout. Retain audit scope, discovered/fixed issues and unresolved source limitations in the report. Refresh module versions before browser verification.
