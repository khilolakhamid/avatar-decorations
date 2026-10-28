/**
 * Halloween Pumpkin — keyframes. One loop = 3 s = 180 frames at 60 fps.
 *
 *   frame        0 ──── 66 ── 78 ─ 82 ──── 102 ──────────────── 180
 *   pumpkin      rest → inhale peak (1.1 s) ─── slow exhale ──── rest
 *   blink                 66–78 close · 78–82 hold · 82–102 open
 *   mini pumpkin rest ───────────── peak at 90 (1.5 s) ───────── rest
 *   leaf_1       sway ±3.5°, 2 swings per loop
 *   leaf_2       sway ±3°,   2 swings, 0.25 s behind leaf_1
 *   tail         sway ±6°,   1 slow swing per loop, follows the cap
 *   plant        tip bends ±3.5°, 1 slow swing per loop
 *
 *   bat 1        fade in 30–54 · flies up-left · fade out 108–132 · 3 beats/s
 *   bat 2        fade in 46–70 · flies up-left · fade out 124–148 · 3.3 beats/s
 *
 * Every track ends on the value it starts with, so the loop has no jump.
 */
import { type Timeline } from '../../../shared/animation/index.js';
export declare const FPS = 60;
export declare const FRAME_COUNT = 180;
export declare const LOOP_DURATION_MS: number;
/** Bottom centre of the big pumpkin: it stays planted. */
export declare const PUMPKIN_PIVOT: readonly [224, 229];
/** Middle of the cap's lower rim. */
export declare const CAP_PIVOT: readonly [100, 118];
/** Where the tail enters the cap. */
export declare const TAIL_PIVOT: readonly [54, 77];
/** Leaf bases (start of the central vein), hidden behind the pumpkin. */
export declare const LEAF1_PIVOT: readonly [22, 25];
export declare const LEAF2_PIVOT: readonly [13, 17];
export declare function createTimeline(sources: {
    pumpkin: string;
    plant: string;
}): Timeline;
