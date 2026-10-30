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
export { AVATAR_AREA, CANVAS_SIZE, EAR_PIVOT, LAYER_ORDER, RIGHT_EAR } from './component/layout';
export { leftEarAngle, MOTION, rightEarAngle } from './component/motion';
export { EAR_PARTS, earTransforms } from './component/composition';
export { ASSET_ROLES } from './assets';

export const CAT_EARS_META = {
  id: 'cat-ears',
  name: 'Cat Ears',
  version: '1.0.0',
  status: {
    web: 'approved (2026-10-30)',
    tgs: 'not-exported',
  },
} as const;
