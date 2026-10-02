# R33 — Delivery and warranty update

Commercial instruction supplied directly by Green Village on 2026-10-02:

- Delivery: 90 to 180 working days.
- Additional on-site assembly/finishing: 30 days on the customer's land.
- Warranty: 10 years structure, 5 years expansion system, 2 years finishes.

One canonical module supplies the technical sheet, PDF, current source ledger and PT/EN/ES commercial translations. The initial HTML FAQ matches that module and is regression-checked. Superseded90-day delivery and2-year structure/1-year equipment claims were removed from active text. No start event, combined total or30-working-day qualification was introduced. Historical source documents were retained.

Commercial warranty confirmation is separate from genuinely missing technical certificates/tests. The current ledger has structured delivery, on-site and warranty values with the owner's confirmation source. Existing item prices and client configuration data were not edited.

## Verification

- Core regression:47 checks passed. The inventory check retains45 documentary records and explicitly checks the2 new owner-confirmed commercial records.
- Targeted regression:5 groups passed, covering values/units, both translation engines, initial/generated markup, current source ledger and absence of retired/unsupported claims.
- Browser:8 groups passed across PT/EN/ES FAQ, technical sheet, real source-ledger download,375px layout and real customer PDF downloads. No JavaScript or HTTP errors.
- Three8-page customer PDFs were generated. Their commercial terms on page7 were text-extracted, checked for page bounds and visually reviewed. Added30-day and all three warranty statements are legible.

Evidence: `audit/r33/regression.json` and `audit/r33/browser/result.json`, PDFs and screenshots in the same directory. Existing noncommercial dimension/distribution labels that remain Portuguese on some EN/ES technical cards were outside this bounded update; all newly changed commercial terms are translated. Public deployment verification is recorded separately in the publication receipt.
