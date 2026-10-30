/**
 * Christmas Lights — public interface. Independent of the demo page, the
 * user's photo, Telegram and the other decorations.
 */
export {
  ChristmasLightsDecoration,
  FPS,
  FRAME_COUNT,
  LOOP_DURATION_MS,
  mountChristmasLights,
  renderChristmasLightsSvg,
  type ChristmasLightsOptions,
} from './component/ChristmasLightsDecoration';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER, PLACEMENT } from './component/layout';
export { bulbState, MOTION, sparkleState, stateAt, type BulbState, type SparkleState } from './component/motion';
export { buildChristmasLightsSvg, garlandFrame, type Frame } from './component/composition';
export { ALIGN, BULB_NAMES, BULB_TURNS, HANG_POINTS, LIT_IN } from './component/garlandModel';
export { ASSET_ROLES, ASSET_SOURCES } from './assets';

export const CHRISTMAS_LIGHTS_META = {
  id: 'christmas-lights',
  name: 'Christmas Lights',
  version: '1.0.0',
  status: {
    web: 'approved (2026-10-30)',
    tgs: 'not-exported',
  },
} as const;
