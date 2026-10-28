/**
 * Ghost Orbit — public interface. Independent of the demo page, the user's
 * photo and Telegram.
 */
export { GhostOrbitDecoration, mountGhostOrbit, renderGhostOrbitSvg, FPS, FRAME_COUNT, LOOP_DURATION_MS, type GhostOrbitOptions, } from './component/GhostOrbitDecoration.js';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER, ORBIT } from './component/layout.js';
export { ghostPose, STEP_DEG, type GhostPose } from './component/orbit.js';
export { ghostMotion, MOTION, type GhostMotion } from './component/motion.js';
export { GHOST_PARTS, ghostLocalTransforms } from './component/composition.js';
export { FACE_IN_GHOST } from './component/layout.js';
export { ASSET_ROLES } from './assets/index.js';
export declare const GHOST_ORBIT_META: {
    readonly id: "ghost-orbit";
    readonly name: "Ghost Orbit";
    readonly version: "1.0.0";
    readonly status: {
        readonly web: "approved (2026-10-28)";
        readonly tgs: "not-exported";
    };
};
