/**
 * Paper Plane Orbit — everything the plane does, computed from ONE number:
 * the loop progress p (0 … 1, 3 s).
 *
 *   appears small far away (drawing 1)  →  approaches, turning into drawing 2, big and close
 *   (leans into the turn)  →  flies away, turning into drawing 3, getting small  →  vanishes
 *
 *   • view: drawing 1 at the start, drawing 2 close to the viewer, drawing 3
 *     flying away; the plane turns smoothly between them; invisible, it goes
 *     back to drawing 1 for the next loop;
 *   • path: a loop around the avatar — in from the left, across the front,
 *     out at the top right, back behind the photo (invisible);
 *   • size: small → big → small (perspective);
 *   • bank: near the viewer the plane leans into the turn;
 *   • wind: gentle wobble of the whole plane;
 *   • opacity: fades in at the start, fades out near the top right.
 *
 * Position and size follow smooth periodic curves through the key moments,
 * the view turns are eased, and the plane is fully transparent at p = 0 and
 * p = 1 (drawing 1 at both), so the loop repeats with no jump.
 */
import type { Pt, ViewIndex } from './planeModel.js';
/** Key moments of the loop: [progress, x, y, size]. Size 1 = the drawing's own size (before MOTION.size). */
export declare const PATH_KEYS: ReadonlyArray<readonly [number, number, number, number]>;
/** View turns: [from progress, to progress, from view, to view] — eased; outside a turn the view holds. */
export declare const VIEW_SEGMENTS: ReadonlyArray<readonly [number, number, ViewIndex, ViewIndex]>;
export declare const MOTION: {
    /** fade in over [0, fadeIn], fade out over [fadeOutStart, fadeOutEnd] */
    readonly fade: {
        readonly fadeIn: 0.15;
        readonly fadeOutStart: 0.74;
        readonly fadeOutEnd: 0.88;
    };
    /** lean into the turn near the viewer: degrees, centre and width of the bump */
    readonly bank: {
        readonly degrees: -7;
        readonly at: 0.46;
        readonly width: 0.14;
    };
    /** wind: wobble of the whole plane ±deg, waves per loop (owner: about 25–30 % calmer than ±2°) */
    readonly wind: {
        readonly wobble: 1.45;
        readonly wobbleWaves: 3;
    };
    /** overall size of the plane: multiplies every size in PATH_KEYS, so the perspective stays the same (owner: +10 %) */
    readonly size: 1.1;
};
export interface PlaneState {
    x: number;
    y: number;
    scale: number;
    /** extra turn of the whole plane (bank + wind), degrees */
    rotate: number;
    opacity: number;
    /** views being blended and how far (0 = viewA, 1 = viewB) */
    viewA: ViewIndex;
    viewB: ViewIndex;
    blend: number;
}
export declare function pathPoint(progress: number): Pt;
export declare function viewBlend(progress: number): {
    viewA: ViewIndex;
    viewB: ViewIndex;
    blend: number;
};
export declare function planeState(progress: number): PlaneState;
