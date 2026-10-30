/**
 * Cat Ears — public interface. Independent of the demo page, the user's
 * photo, Telegram and the other decorations.
 */
export { CatEarsDecoration, FPS, FRAME_COUNT, LOOP_DURATION_MS, mountCatEars, renderCatEarsSvg, type CatEarsOptions, } from './component/CatEarsDecoration.js';
export { AVATAR_AREA, CANVAS_SIZE, EAR_PIVOT, LAYER_ORDER, RIGHT_EAR } from './component/layout.js';
export { leftEarAngle, MOTION, rightEarAngle } from './component/motion.js';
export { EAR_PARTS, earTransforms } from './component/composition.js';
export { ASSET_ROLES } from './assets/index.js';
export declare const CAT_EARS_META: {
    readonly id: "cat-ears";
    readonly name: "Cat Ears";
    readonly version: "1.0.0";
    readonly status: {
        readonly web: "approved (2026-10-30)";
        readonly tgs: "not-exported";
    };
};
