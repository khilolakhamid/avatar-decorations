/**
 * Cat Ears — the swing of each ear over one 3-second loop.
 *
 * Each ear only turns a little around the middle of its base: out, back,
 * a little in, back. Positive angle = outwards (the tip moves away from the
 * other ear). The curve is periodic over the loop (smooth periodic spline
 * through the key poses), so the last frame joins the first with no jump.
 * Both ears move at the same time and as exact mirror images of each other
 * (owner's decision 2026-10-30: synchronous, mirror-symmetric swing).
 */
export declare const MOTION: {
    /** largest outward turn, degrees */
    readonly out: 3;
    /** key poses over one loop: [loop share 0…1, share of `out`] */
    readonly keys: ReadonlyArray<readonly [number, number]>;
    /** the right ear's delay behind the left one: none — the ears swing together, mirrored */
    readonly rightDelay: 0;
};
/** Outward turn of the left ear at loop progress 0…1, degrees. */
export declare function leftEarAngle(progress: number): number;
/** Outward turn of the right ear at loop progress 0…1, degrees. */
export declare function rightEarAngle(progress: number): number;
