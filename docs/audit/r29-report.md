# R29 — Water and electrical flow

Validated locally on 2026-10-02. Scope: animated presentation of the existing service routes, playback controls and lifecycle behaviour.

## Delivered behaviour

- Water columns remain visible through translucent casings. Moving highlights follow cold/hot supply towards fixtures and drainage towards the exterior outlet.
- Electrical highlights follow the existing branches from the distribution board to outlets, switches and lighting points.
- Shared pipe runs are merged before rendering. The illustrative inlet was moved upstream of the kitchen connection to remove a doubled-back route.
- Playback and 0.5×/1×/2× controls are available in Portuguese, English and Spanish; preferences remain presentation state, outside commercial configuration.
- Reduced motion starts paused. Off-page, hidden-document and export states suspend flow; only the active service network is updated.
- Four bounded instanced meshes are nested outside static geometry batching, with owned resource disposal.
- Direct entry is supported through `?view=plumbing` and `?view=electrical`.

## Verification

| Verification | Observed result |
| --- | --- |
| Core regression, including versioned module graph and commercial/source integrity | 47 checks passed |
| R29 route/direction/overlap/speed/disposal regression | 10 checks passed; 7 layouts, 14 variants and 340 routes |
| R29 real Chrome browser regression | 11 checks passed; no JavaScript or WebGL errors |
| R28 windows, glazing, deck and expansion restoration | Passed; 28 long faces, 224 fixed panes, 2,016 aperture rays and 28 price/persistence cases |
| R26 service connectivity, optional prices, worktops and translations | 7 checks passed |
| R25 bathroom and runtime checks | 14 bathroom cases, 1,414 door positions and both runtime checks passed |
| Desktop paired screenshots, 450 ms apart | 1,163 water pixels and 771 electrical pixels changed by more than 16/255 in at least one colour channel |
| Mobile, 390 px viewport | No horizontal overflow; 10 px clearance between circuit legend and model toolbar |
| Eight consecutive model rebuilds | Stable at 411 GPU geometries, 7 textures and 2 active material leases |
| Electrical image export | Actual 3,840 × 2,160 PNG produced; phase held during export and resumed afterwards |

Browser evidence lives in `audit/r29/browser-final/result.json` and neighbouring screenshots. The hidden-document test simulates the read-only getter and `visibilitychange` event; it is not an operating-system tab-backgrounding test. The export test delays delivery of the real PNG encoding callback by 900 ms to make the existing export lock observable.

Independent review found no remaining blocking issue after the upstream inlet correction. Flow is an illustrative visualisation; no measured pressure, current, voltage or certified installation design is asserted.
