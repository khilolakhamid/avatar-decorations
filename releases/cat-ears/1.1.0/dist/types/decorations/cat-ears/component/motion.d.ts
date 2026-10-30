/**
 * Cat Ears — how the ears move over one 3-second loop (draft 1.1.0).
 *
 * The ears no longer turn as a whole: each ear BENDS. Its base stays where it
 * is, on the photo; the higher a point of the ear, the more it turns around
 * the middle of the base — so the upper part and the tip flick, like a cat's
 * ear listening to sounds (see composition.ts, bendPoint).
 *
 * On top of that (added later in the 1.1.0 draft) each whole ear sways
 * gently from side to side around its base (swayAngle), the two ears out of
 * phase; the tip's own bend rides on this sway.
 *
 * The bend of each ear's tip follows its own little story over the loop
 * (positive = outwards, away from the other ear): quick flicks with a springy
 * overshoot on the way back, a few quieter moments, once both ears lean to
 * opposite sides at the same time. A very small idle drift keeps the ears
 * alive between the flicks. Every curve is a smooth periodic spline, so the
 * last frame joins the first with no jump and no change of speed.
 */
export declare const MOTION: {
    /** bend of the tip at key value 1, degrees (v1.0.0 turned the whole ear by 3°) */
    readonly tip: 10;
    /** where the bend starts / ends along the ear (0 = middle of the base, 1 = tip) and how it grows */
    readonly bend: {
        readonly from: 0.19;
        readonly to: 1;
        readonly power: 1.6;
    };
    /** key poses of each ear over one loop: [loop share 0…1, share of `tip`] */
    readonly left: ReadonlyArray<readonly [number, number]>;
    readonly right: ReadonlyArray<readonly [number, number]>;
    /** idle drift: ± share of `tip`, waves per loop */
    readonly drift: {
        readonly amount: 0.06;
        readonly waves: 1;
    };
    /**
     * sway of the whole ear (added in the 1.1.0 draft, under the tip bend): the ear leans gently from side
     * to side around its base — the base stays, the middle leans partly, the upper part fully (`from`/`to`
     * along the ear). A slow wave (one per loop) with a little second wave for a natural, uneven rhythm;
     * the right ear runs behind the left one by `rightDelay` of the loop.
     */
    readonly sway: {
        readonly degrees: 3.5;
        readonly from: 0.19;
        readonly to: 0.7;
        readonly second: 0.3;
        readonly rightDelay: 0.22;
    };
};
/** Sway of the whole ear (outwards positive) at loop progress 0…1, degrees; smooth and seamless. */
export declare function swayAngle(progress: number, side: 'left' | 'right'): number;
/** Outward bend of the left ear's tip at loop progress 0…1, degrees. */
export declare function leftEarAngle(progress: number): number;
/** Outward bend of the right ear's tip at loop progress 0…1, degrees. */
export declare function rightEarAngle(progress: number): number;
