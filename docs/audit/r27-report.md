# Green Village 72 — R27 verification

Date: 2026-10-02. Scope: service circuits, opening assignments, separately selected kitchen extras, cabinet finishes, supplier worktops, exterior setting, prices and customer PDF.

## Delivered behaviour

- Water has separate cold, hot and waste routes with risers and fittings anchored to the current kitchen, basin, shower and toilet. The toilet has no invented hot supply. Fixture visibility is reduced only in the service views so connections remain visible.
- Electrical routes connect the panel, junctions, sockets, switches and lights. Panel placement avoids window openings. These are illustrative routes, not a manufacturer installation drawing or certification.
- Adding a window asks the customer to select its opening. Selecting a rear opening focuses the rear facade. Replacing an open tilt-turn window with a panoramic model retains the valid opening state.
- An island is a separate requested additional item. Upper cupboards appear only when selected. Unsupported island arrangements remain recorded for quotation without adding intersecting furniture.
- Kitchen and bathroom cabinet colours are independent customer requests. Worktops use 78 original photographs from the supplied public catalogue, selectable by image or list. These choices persist through history, reload, JSON, sharing and customer PDF.
- The exterior has grass, sky, planting and an entrance path. The illustrative setting is absent from technical and expansion views and is not quoted as a supplied item.
- The PDF includes the chosen swatches/worktop and separates known additional prices from items awaiting quotation. Material cards paginate to avoid overflow.

## Price and factual evidence

The 22 priced catalogue entries match the current recorded PVP update of 2026-09-20 (ba59ec8). All 26 option types were checked at minimum and maximum quantities (52 arithmetic cases). Cabinet geometry does not multiply the 580 EUR upper-cupboard option by the number of illustrated modules.

| Item | Current treatment | Evidence / limit |
| --- | --- | --- |
| Vinyl flooring | Included | User's explicit commercial instruction retained |
| SPC flooring | +1,200 EUR once | User's explicit commercial instruction; VAT not invented |
| Upper kitchen cupboards | 580 EUR | Current PVP; historical catalogue 700 EUR is not the active price |
| Island | Quotation required | No supported fixed selling price supplied |
| Custom cabinet colours | Quotation required | Customer preference is recorded; available stock/colour price not asserted |
| Worktop colour/product | Quotation required | Supplied public catalogue has images/names but no prices |
| Air conditioning | Existing terms preserved | 12,000 BTU monosplit 500 EUR with installation; 3x1 multisplit under quotation |

Worktop source: https://biz.cli.im/test/GX300499?coding=I2syRW&qrurl=http%3A%2F%2Fqr14.cn%2FI2syRW&gtype=2 . The 78 original files are retained without invented prices. Source URL, original label and SHA-256 are recorded in worktop-data.js. Customer-facing numbered names are neutral identifiers, not invented supplier specifications.

Manufacturer dimensions/construction were checked against the supplied 40FT proforma, house specification and foundation plan. The newer public R26 factual update (046b981, 2026-09-28) is preserved: 2.48 m external height, 2.24 m internal height, 11.80 × 2.20 × 2.48 m folded dimensions and documented construction/electrical values. The 3D height remains explicitly illustrative. Existing commercial delivery/warranty terms are preserved; the June commercial original was not re-opened during this audit.

Unresolved source differences remain unresolved: base selling price, business address, VAT on certain additional items, installation tolerances and technical validation of custom layouts. The manufacturer's SPC-equipped variant does not silently replace the user's vinyl-included/SPC-upgrade offer. No new base price, technical approval, certification or availability guarantee was invented.

## Verification executed

| Verification | Result |
| --- | --- |
| Main regression | 47 checks passed |
| New services/options/source integrity | 7 groups; 14 networks, 340 routes, 78 image hashes/round trips |
| Independent service sweep | 112 configurations; 2,528 routes; 13,140 finite coordinates; panel clearances passed |
| Additional-item regression | 826 checks passed |
| Opening geometry | 98 configurations, 5,292 aperture rays, 3,840 sliding checks |
| Bathroom regression | 14 cases and 1,414 positions; runtime 2/2 |
| Standard package / PDF | 18 checks passed |
| Presentation segregation | 8 checks passed |
| Expansion | 7,007 positions, 84 cycles; deployment replay 56 cycles |
| Existing browser regression | 5 desktop/tablet/phone flows, no page errors |
| New browser regression | 9 flows including sample pagination, rear assignment, open-window replacement, persistence, services and customer PDF; no page errors |
| PDF languages | 6 PT/EN/ES vinyl/SPC outputs, no errors |

The customer PDF with custom finishes was rendered and inspected. Its 11 pages preserve the client name, independent cabinet colours, selected worktop and known versus pending prices. Exterior, kitchen, bathroom, circuits, rear windows, sample gallery and mobile screenshots were inspected. Evidence is retained locally under audit/r26/ (the implementation began under that internal directory name; the public release is R27).

## Publication

Release is based on public main 046b981 in a clean checkout, preserving its factual corrections. Publication and public-browser verification are recorded separately in the release receipt. No private client records, supplier cost documents, credentials or local source inspection output are included in the site.
