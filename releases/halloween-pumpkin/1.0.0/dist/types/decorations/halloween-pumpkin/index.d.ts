/**
 * Halloween Pumpkin — public interface.
 *
 * Everything another project needs is exported from this file; nothing
 * here depends on the demo page, a user profile, a photo or Telegram.
 */
export { HalloweenPumpkinDecoration, mountHalloweenPumpkin, renderHalloweenPumpkinSvg, type HalloweenPumpkinOptions, } from './component/HalloweenPumpkinDecoration.js';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER } from './component/layout.js';
export { LOOP_DURATION_MS, FPS, FRAME_COUNT } from './animation/index.js';
export { SOURCE_FILE_NAMES } from './assets/index.js';
export declare const HALLOWEEN_PUMPKIN_META: {
    readonly id: "halloween-pumpkin";
    readonly name: "Halloween Pumpkin";
    readonly version: "1.0.0";
    readonly status: {
        /** Web component: approved by the owner. Not to be changed without a separate request. */
        readonly web: "approved";
        /** Telegram TGS: not exported and not verified yet. */
        readonly tgs: "not-exported";
    };
    readonly approvedOn: "2026-10-28";
};
