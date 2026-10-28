/**
 * Halloween Pumpkin — public interface.
 *
 * Everything another project needs is exported from this file; nothing
 * here depends on the demo page, a user profile, a photo or Telegram.
 */
export {
  HalloweenPumpkinDecoration,
  mountHalloweenPumpkin,
  renderHalloweenPumpkinSvg,
  type HalloweenPumpkinOptions,
} from './component/HalloweenPumpkinDecoration';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER } from './component/layout';
export { LOOP_DURATION_MS, FPS, FRAME_COUNT } from './animation';
export { SOURCE_FILE_NAMES } from './assets';

export const HALLOWEEN_PUMPKIN_META = {
  id: 'halloween-pumpkin',
  name: 'Halloween Pumpkin',
  version: '1.0.0',
  status: {
    /** Web component: approved by the owner. Not to be changed without a separate request. */
    web: 'approved',
    /** Telegram TGS: not exported and not verified yet. */
    tgs: 'not-exported',
  },
  approvedOn: '2026-10-28',
} as const;
