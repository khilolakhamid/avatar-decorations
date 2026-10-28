/**
 * Static layout of the Halloween Pumpkin decoration.
 *
 * Every vector keeps its original orientation and size; only bat #2 is
 * turned (39°). Fit error against the reference is at anti-aliasing level.
 *
 * All numbers are in the 512 × 512 composition space (the reference
 * illustration is the same composition rendered at 1.5×, i.e. 768 × 768).
 * Vectors are only positioned — never redrawn.
 *
 * Positions were fitted against the reference illustration
 * (reference/composition-reference.jpg). Adjust here if needed —
 * nothing else in the code holds coordinates.
 */
import type { Placement } from '../../../shared/svg';

/** Size of the composition (also the TGS canvas size). */
export const CANVAS_SIZE = 512;

/**
 * Where the user's photo goes. NOT drawn by the decoration — host pages
 * use it to position the round avatar underneath.
 */
export const AVATAR_AREA = { cx: 256, cy: 256, r: 218 } as const;

/**
 * One bat = the three original vectors in a shared local frame
 * (origin = top-left of the bat's original 55 × 56 frame). Both bats reuse this exact assembly;
 * they differ only by their own placement (`BatInstance`).
 */
export interface BatAssembly {
  head: Placement;
  leftWing: Placement;
  rightWing: Placement;
}

/** Where one bat instance sits in the composition. */
export type BatInstance = Placement;

export interface HalloweenPumpkinLayout {
  leaf1: Placement;
  leaf2: Placement;
  pumpkin: Placement;
  plant: Placement;
  miniPumpkin: Placement;
  /** Absolute position; at render time it is nested inside `miniPumpkin`. */
  tail: Placement;
  bat: BatAssembly;
  bats: [BatInstance, BatInstance];
}

export const LAYOUT: HalloweenPumpkinLayout = {
  leaf1: { x: 369, y: 419 },
  leaf2: { x: 408, y: 394 },
  pumpkin: { x: 32, y: 256 },
  // its flat cut (x≈70.4) overlaps the stem cut inside `pumpkin` by ~0.5 px,
  // so no hairline seam is visible at the joint
  plant: { x: 9, y: 255 },
  miniPumpkin: { x: 30, y: 5 },
  tail: { x: 52, y: 4 },
  bat: {
    // bat_head.svg is drawn upright (40 × 43); in the bat it is turned like
    // the wings' own frame, so it lands exactly where the previous head was
    head: { x: 0, y: 16.4738, rotate: -24.3208 },
    leftWing: { x: -24, y: 19.75 },
    rightWing: { x: 31.5, y: -5.5 },
  },
  bats: [
    { x: 397.25, y: 94.5 },
    // same bat, turned clockwise as in the reference
    { x: 446.25, y: 162.75, rotate: 39 },
  ],
};

/**
 * Drawing order, back to front. The avatar photo (supplied by the host
 * page) sits behind all of these.
 */
export const LAYER_ORDER = [
  'leaf_2',
  'leaf_1',
  'pumpkin',
  'plant',
  'mini pumpkin', // with `tail` nested inside
  'bat-1',
  'bat-2',
] as const;
