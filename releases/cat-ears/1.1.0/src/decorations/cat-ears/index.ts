/**
 * Cat Ears — public interface. Independent of the demo page, the user's
 * photo, Telegram and the other decorations.
 */
export {
  CatEarsDecoration,
  FPS,
  FRAME_COUNT,
  LOOP_DURATION_MS,
  mountCatEars,
  renderCatEarsSvg,
  type CatEarsOptions,
} from './component/CatEarsDecoration';
export { AVATAR_AREA, CANVAS_SIZE, EAR_PIVOT, EAR_TIP, LAYER_ORDER, RIGHT_EAR } from './component/layout';
export { leftEarAngle, MOTION, rightEarAngle, swayAngle } from './component/motion';
export { bendPoint, bendShare, EAR_SIDES, earBends, earFrame, earSways, swayShare, type EarSide, type Frame } from './component/composition';
export { ASSET_ROLES } from './assets';

export const CAT_EARS_META = {
  id: 'cat-ears',
  name: 'Cat Ears',
  version: '1.1.0',
  status: {
    web: 'approved (2026-10-30); 1.0.0 stays available in releases/cat-ears/1.0.0/',
    tgs: 'not-exported',
  },
} as const;
