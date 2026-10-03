# R37 — Village presentation and native 8K

## Implemented scope

The configured house is now presented by default in an illustrative inhabited village square inspired by the Porto region. Four original photographic elevations show Portuguese facades, cafes and pedestrians. A separate physical stone forecourt, planted granite beds, benches and access steps provide contact shadows around the model. Garden and neutral studio remain selectable; technical and room-detail views remain neutral.

The scenic shell writes depth so distant ground cannot cover pedestrians or facades. It stays beyond the camera on zoom/pan. Neighbouring photographic edges are softly blended; a small repeated/ghosted vegetation transition remains perceptible at some joins. This is an illustrative surround, not a surveyed location or a continuous measured 360-degree capture. People are static photographic figures, not animated 3D characters.

Uniform exterior catalogue samples no longer tile their baked lighting into white stripes across the building. Their recorded sampled colours and intact source comparison remain available. This does not establish colourimetric identity with the manufactured finish. Glass uses one physical transmission model. Display density is bounded and contact-shadow maps use up to 4096 pixels per side.

Native 7680 × 4320 PNG export is available from both the configurator and immersive presentation. It checks GPU limits, the actual drawing buffer, PNG dimensions, current configuration and resource readiness. Failure restores the prior renderer/camera; no silent upscaling or incomplete export. Existing 3840 × 2160 PNG and three-image ZIP remain.

## Executed local verification

| Check | Result |
| --- | --- |
| Core tests | 47 passed |
| Project options/prices | 916 passed |
| Stage lifecycle/density | 10 passed |
| Runtime viewport/layers | 2 passed |
| Sampled exterior/source integrity | 6 groups passed |
| Native 8K export/failure handling | 9 groups passed |
| Backdrop sectors/depth/camera/disposal | 4 groups passed |
| Village browser and missing panorama/elevation handling | 8 passed |
| Retained immersive visit/4K ZIP/privacy/browser | 10 passed |
| Window option/editor/opening browser | 8 passed |
| Opening geometry/raycast including current physical glass | 9 groups, 46 instances passed |

Real Chrome downloaded and decoded a 7680 × 4320 PNG, then restored the interactive canvas and configuration. The retained ZIP contains three native 3840 × 2160 PNGs with valid CRCs; private client data is excluded. PT/EN/ES, desktop, tablet and phone were exercised. Browser scenarios reported no page or shader errors.

An independent review found that direct export rendering could bypass scenic-shell camera fitting after a preset change. Shared frame preparation now runs before PNG capture and again on interactive restoration. The regression checks call order and camera identity for both resolutions and perspective/orthographic cameras. All retained browser export scenarios passed again after the fix.

Visual evidence: `audit/r37/visual-v4/`. Browser evidence: `audit/r37/browser/`, `audit/r37/retained-presentation/`, `audit/r37/windows-independent/`. Large PNG/ZIP artifacts remain local and are not website assets.

## Resource record

The four native elevations are 1254 × 1254 each. The environmental panorama is 1774 × 887 LDR, not HDR. Three Poly Haven CC0 ground maps are 2048 × 2048. Total eight-image payload is 20,710,556 bytes; native 8K export does not imply 8K detail in each photographic source. Hashes, dimensions, source/licence and exact generation prompts are in `r37-assets.json`, `r37-elevation-prompts.md`, `r37-image-prompt.md` and `dist/assets/scene-r37/sources-terrain.json`.

No catalogue prices, commercial terms, client data boundaries or product layout were changed. Scenic land/planting/furniture are not priced inclusions. The white module remains a real-time model and is not claimed to be an indistinguishable photograph.

## Publication

Release prepared from clean public main `f134b4cd4227db428463b929aeb4d64ba8d0b6c5`. Only the reviewed R37 module/assets/test/documentation delta is copied; unrelated dirty source files and unused R35 trial assets are excluded. Public verification is recorded separately after deployment.

Application commit `b2f213a100910b1240e154f617b479033c0f83d5` was published on 2026-10-03. Pages run `37085317588` completed successfully. Public entry: https://matheusagueda.github.io/green-village-72/?v=r37 .

Public verification confirmed HTTP200 for the root and all65checked application resources, including54unique import-map targets, with exact SHA256 matches. All8R37 browser scenarios passed on the public URL, without page or shader errors. The public site produced a real7680×4320PNG of53,663,589bytes and restored the canvas. Evidence: `audit/r37/publication.json`, `audit/r37/public-browser/result.json`, `audit/r37/public-browser/8k.json`.

The independent public window suite passed8/8scenarios with zero page errors. Fresh public desktop/phone captures confirmed the new village (not the earlier meadow), complete street figures and both8Kbuttons. Evidence: `audit/r37/public-windows/result.json`, `audit/r37/public-visual/`. Small public verification receipts are copied beside this report in `r37/`.
