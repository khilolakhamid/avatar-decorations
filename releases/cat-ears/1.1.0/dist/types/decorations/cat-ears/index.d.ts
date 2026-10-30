/**
 * Cat Ears — public interface. Independent of the demo page, the user's
 * photo, Telegram and the other decorations.
 */
export { CatEarsDecoration, FPS, FRAME_COUNT, LOOP_DURATION_MS, mountCatEars, renderCatEarsSvg, type CatEarsOptions, } from './component/CatEarsDecoration.js';
export { AVATAR_AREA, CANVAS_SIZE, EAR_PIVOT, EAR_TIP, LAYER_ORDER, RIGHT_EAR } from './component/layout.js';
export { leftEarAngle, MOTION, rightEarAngle, swayAngle } from './component/motion.js';
export { bendPoint, bendShare, EAR_SIDES, earBends, earFrame, earSways, swayShare, type EarSide, type Frame } from './component/composition.js';
export { ASSET_ROLES } from './assets/index.js';
export declare const CAT_EARS_META: {
    readonly id: "cat-ears";
    readonly name: "Cat Ears";
    readonly version: "1.1.0";
    readonly status: {
        readonly web: "approved (2026-10-30); 1.0.0 stays available in releases/cat-ears/1.0.0/";
        readonly tgs: "not-exported";
    };
};
