/**
 * Paper Plane Orbit — public interface. Independent of the demo page, the
 * user's photo, Telegram and the other decorations.
 */
export {
  FPS,
  FRAME_COUNT,
  LOOP_DURATION_MS,
  mountPaperPlaneOrbit,
  PaperPlaneOrbitDecoration,
  renderPaperPlaneOrbitSvg,
  type PaperPlaneOrbitOptions,
} from './component/PaperPlaneOrbitDecoration';
export { AVATAR_AREA, CANVAS_SIZE, LAYER_ORDER } from './component/layout';
export { MOTION, PATH_KEYS, pathPoint, planeState, VIEW_SEGMENTS, viewBlend, type PlaneState } from './component/motion';
export { buildPaperPlaneOrbitSvg, HIGHLIGHT_SLOTS, planeFrame, planeFrameFromState, type Frame } from './component/composition';
export { ASSET_SOURCES } from './assets';
export { VIEWS, type ViewModel } from './component/planeModel';
export { ASSET_ROLES } from './assets';

export const PAPER_PLANE_ORBIT_META = {
  id: 'paper-plane-orbit',
  name: 'Paper Plane Orbit',
  version: '1.0.0',
  status: {
    web: 'approved (2026-10-30)',
    tgs: 'not-exported',
  },
} as const;
