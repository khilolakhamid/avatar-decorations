/**
 * Cubic-bezier easing — the same model Lottie/TGS uses for keyframe
 * interpolation (out-tangent of one key + in-tangent of the next), so a
 * timeline written here maps 1:1 to a TGS export.
 */
export type Bezier = readonly [x1: number, y1: number, x2: number, y2: number];
export declare const EASE: {
    readonly linear: readonly [0, 0, 1, 1];
    /** soft start and soft stop — default for organic motion */
    readonly inOut: readonly [0.42, 0, 0.58, 1];
    /** gentler sine-like in-out */
    readonly sine: readonly [0.37, 0, 0.63, 1];
    readonly in: readonly [0.42, 0, 1, 1];
    readonly out: readonly [0, 0, 0.58, 1];
    /** fast start, long soft landing (eyelid opening) */
    readonly outSoft: readonly [0.2, 0.7, 0.4, 1];
    /** accelerating close (eyelid closing) */
    readonly inFast: readonly [0.55, 0, 0.85, 0.4];
};
/** Maps linear progress p∈[0,1] to eased progress. */
export declare function bezierEase(b: Bezier, p: number): number;
