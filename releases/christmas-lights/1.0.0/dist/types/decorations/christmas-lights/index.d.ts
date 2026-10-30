/**
 * Christmas Lights — public interface. Independent of the demo page, the
 * user's photo, Telegram and the other decorations.
 */
export { ChristmasLightsDecoration, FPS, FRAME_COUNT, LOOP_DURATION_MS, mountChristmasLights, renderChristmasLightsSvg, type ChristmasLightsOptions, } from './component/ChristmasLightsDecoration.js';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER, PLACEMENT } from './component/layout.js';
export { bulbState, MOTION, sparkleState, stateAt, type BulbState, type SparkleState } from './component/motion.js';
export { buildChristmasLightsSvg, garlandFrame, type Frame } from './component/composition.js';
export { ALIGN, BULB_NAMES, BULB_TURNS, HANG_POINTS, LIT_IN } from './component/garlandModel.js';
export { ASSET_ROLES, ASSET_SOURCES } from './assets/index.js';
export declare const CHRISTMAS_LIGHTS_META: {
    readonly id: "christmas-lights";
    readonly name: "Christmas Lights";
    readonly version: "1.0.0";
    readonly status: {
        readonly web: "approved (2026-10-30)";
        readonly tgs: "not-exported";
    };
};
