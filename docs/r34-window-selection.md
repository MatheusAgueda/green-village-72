# R34 — Window selection and opening

User report: the large thermal-break window does not work.

## Reproduction and diagnosis

- At 1366 × 768, the existing options content region is 213 px high. A selected large-window card occupies about 1937 px.
- Adding an item previously changed the quotation before asking for a location. Until the subsequent location checkbox was checked, the 3D model intentionally stayed unchanged.
- Existing model ray tests and browser assignment/opening checks succeeded. Fixed glass, movable sash and frame of the operable large window already activate its moving leaf. No mechanism or dimensions were changed.

## Delivered behaviour

- Seven window products use compact cards with photograph, current price and a visible Apply to 3D action.
- A dedicated dialog drafts locations and quantity. Apply commits the chosen locations and the quotation together, then frames their facade. Cancel has no commercial effect.
- Saving without a 3D location remains available for custom requests. Partial assignment shows assigned/requested counts; quantity and observations survive.
- An assigned window has its own opening/closing control. Global, direct canvas and article controls synchronize their accessible pressed state.
- Mobile application brings the 3D viewport into view. The dialog has a scrollable body and a persistent confirmation footer.
- Product source photographs, current prices and unconfirmed dimensions/billing scope remain unchanged. Mosquito screens retain their existing accessory flow and coexistence rules.
- New customer text is translated in PT, EN and ES.

## Verification

- Baseline failure: `audit/r34/baseline.log` records the missing direct application action.
- `scripts/r34-window-browser.mjs`: eight browser scenarios including all seven products, cost, cancel, quantity validation, persistence, undo/redo, unassigned requests, short desktop/tablet/phone, EN/ES and zero page errors.
- Core suite: 47 checks. Project selections: 916 checks. Model regression: 98 window configurations, 6132 rays, 3840 collision checks. Opening mechanisms: nine checks across 46 instances.
- Integrated R24 browser checks include clicking the large-window sash in the actual canvas.

Historical R18 `button-audit*.mjs` scripts retain obsolete whole-application assumptions and are not the R34 acceptance harness. Maintained R24/R26/client-project browser harnesses have been adapted to the new editor.

Deployment and public verification are recorded in `audit/r34/publication.json` after publication.
