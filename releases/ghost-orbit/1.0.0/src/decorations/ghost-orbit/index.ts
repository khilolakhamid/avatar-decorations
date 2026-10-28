/**
 * Ghost Orbit — public interface. Independent of the demo page, the user's
 * photo and Telegram.
 */
export {
  GhostOrbitDecoration,
  mountGhostOrbit,
  renderGhostOrbitSvg,
  FPS,
  FRAME_COUNT,
  LOOP_DURATION_MS,
  type GhostOrbitOptions,
} from './component/GhostOrbitDecoration';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER, ORBIT } from './component/layout';
export { ghostPose, STEP_DEG, type GhostPose } from './component/orbit';
export { ghostMotion, MOTION, type GhostMotion } from './component/motion';
export { GHOST_PARTS, ghostLocalTransforms } from './component/composition';
export { FACE_IN_GHOST } from './component/layout';
export { ASSET_ROLES } from './assets';

export const GHOST_ORBIT_META = {
  id: 'ghost-orbit',
  name: 'Ghost Orbit',
  version: '1.0.0',
  status: {
    web: 'approved (2026-10-28)',
    tgs: 'not-exported',
  },
} as const;
