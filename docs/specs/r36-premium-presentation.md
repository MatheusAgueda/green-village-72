# R36 — Premium client presentation with existing free tools

## Goal

Make the existing Green Village portfolio more polished and useful in client meetings, using the real configurable model, local Three.js rendering, existing licensed environments and media. Add a distraction-free presentation and a downloadable image set. Preserve commercial facts, options, customer records and window interactions.

## Scope and resources

Use local browser rendering and existing assets; no paid provider calls or speculative free balances. Vault inspection may expose service names and capability metadata only. No credentials in source, generated files, logs or client UI. The garden remains illustrative. Do not change manufacturer finishes, prices or architectural dimensions to make marketing images prettier. Keep PT/EN/ES and sector-specific media.

## Acceptance criteria

- [x] AC1: WHEN presentation mode opens THE SYSTEM SHALL expand the existing interactive canvas and provide accessible exit, view, light, playback and image controls without creating another renderer or changing the priced configuration.
- [x] AC2: WHEN a guided visit plays THE SYSTEM SHALL move through exterior, garden, overview and available interior views, pause on manual interaction or hidden documents, honour reduced motion and restore the prior visual state and focus on exit.
- [x] AC3: WHEN the client downloads the image set THE SYSTEM SHALL produce one ZIP containing three native 3840 × 2160 PNG views and a configuration manifest, await resources and restore the original view and controls on success or failure.
- [x] AC4: WHEN the image set is created THE SYSTEM SHALL include only validated public configuration data and exclude private client names, contacts, attachments and notes.
- [x] AC5: WHEN the portfolio is viewed on desktop or mobile THE SYSTEM SHALL use a compact commercial hierarchy, preserve model and customization access and show new presentation controls in PT, EN and ES without horizontal overflow.
- [x] AC6: WHEN the updated site is validated THE SYSTEM SHALL retain working windows, original catalogue prices, client PDF/export boundaries and neutral technical diagrams, with the published assets matching the reviewed release.

## Test map

- AC1 → test: scripts/r36-presentation-browser.mjs presentation and no-config-change scenarios
- AC2 → test: scripts/r36-presentation-browser.mjs play/pause/manual/reduced-motion/restore scenarios
- AC3 → test: scripts/r36-presentation-browser.mjs real ZIP download and PNG dimensions; scripts/r36-archive-regression.mjs ZIP integrity
- AC4 → test: scripts/r36-archive-regression.mjs seeded private fields and asynchronous configuration snapshot; scripts/r36-presentation-browser.mjs actual exported manifest
- AC5 → test: scripts/r36-presentation-browser.mjs responsive and languages plus actual screenshots
- AC6 → test: scripts/r34-window-browser.mjs; scripts/client-project-browser.mjs; npm test; scripts/project-options-regression.mjs; public SHA-256 comparison

## Release

Compare against public main82ccb7dc652a27f31f75a744eb0667701e444373. Publish only reviewed changes from a clean release checkout; source history is older and dirty. Inspect desktop/mobile/presentation captures before publication. Record limitations and actual evidence, not subjective perfection claims.
