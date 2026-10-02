# R29 — Animated water and electricity circuits

Requested: show water flowing through the existing pipes and electric pulses travelling along the existing circuits, with a more lifelike presentation.

Acceptance criteria:
- Cold and hot supply travel towards connected fixtures. Wastewater travels from fixtures to the exterior outlet, including the exterior stubs.
- Moving elements follow the existing route geometry at constant world-space speed, without jumping between polyline vertices or stacking on shared trunks.
- The physical pipes, connections and electrical equipment remain visible. Motion represents an illustrative flow, without claiming measured current, pressure or a certified installation design.
- Water/electrical views expose keyboard-accessible play/pause and 0.5×/1×/2× presentation controls in Portuguese, English and Spanish.
- Motion preferences survive model rebuilds and view changes, without changing saved commercial configuration, pricing or customer information.
- Reduced-motion preference defaults to paused; users may explicitly play. Rendering stops when the service view is absent, the page is hidden or an export is running.
- Geometry/materials are bounded and disposed once. Model batching must not merge away animated instances. Existing glazing, deck and expansion behaviour remains intact.

Verification: geometry/direction/resource tests, browser movement/pause/speed/rebuild/reduced-motion checks, visual review on desktop/mobile, existing core and R28 regressions, clean release and public asset/browser verification.
