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
import type { Placement } from '../../../shared/svg.js';
/** Size of the composition (also the TGS canvas size). */
export declare const CANVAS_SIZE = 512;
/**
 * Where the user's photo goes. NOT drawn by the decoration — host pages
 * use it to position the round avatar underneath.
 */
export declare const AVATAR_AREA: {
    readonly cx: 256;
    readonly cy: 256;
    readonly r: 218;
};
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
export declare const LAYOUT: HalloweenPumpkinLayout;
/**
 * Drawing order, back to front. The avatar photo (supplied by the host
 * page) sits behind all of these.
 */
export declare const LAYER_ORDER: readonly ["leaf_2", "leaf_1", "pumpkin", "plant", "mini pumpkin", "bat-1", "bat-2"];
