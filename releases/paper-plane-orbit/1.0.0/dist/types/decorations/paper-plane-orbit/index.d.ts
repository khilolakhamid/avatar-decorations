/**
 * Paper Plane Orbit — public interface. Independent of the demo page, the
 * user's photo, Telegram and the other decorations.
 */
export { FPS, FRAME_COUNT, LOOP_DURATION_MS, mountPaperPlaneOrbit, PaperPlaneOrbitDecoration, renderPaperPlaneOrbitSvg, type PaperPlaneOrbitOptions, } from './component/PaperPlaneOrbitDecoration.js';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER } from './component/layout.js';
export { MOTION, PATH_KEYS, pathPoint, planeState, VIEW_SEGMENTS, viewBlend, type PlaneState } from './component/motion.js';
export { buildPaperPlaneOrbitSvg, HIGHLIGHT_SLOTS, planeFrame, planeFrameFromState, type Frame } from './component/composition.js';
export { ASSET_SOURCES } from './assets/index.js';
export { VIEWS, type ViewModel } from './component/planeModel.js';
export { ASSET_ROLES } from './assets/index.js';
export declare const PAPER_PLANE_ORBIT_META: {
    readonly id: "paper-plane-orbit";
    readonly name: "Paper Plane Orbit";
    readonly version: "1.0.0";
    readonly status: {
        readonly web: "approved (2026-10-30)";
        readonly tgs: "not-exported";
    };
};
