/**
 * Christmas Lights — everything that moves, computed from ONE number: the
 * loop progress p (0 … 1, 3 s).
 *
 *   state 1 (drawing 1) → soft change → state 2 (drawing 2) → soft change → state 1
 *
 *   • state: each bulb turns from its angle in drawing 1 to its angle in
 *     drawing 2 and back; the bulbs follow each other with a small delay,
 *     left to right (a ripple along the garland);
 *   • light: a bulb lit in one drawing and dim in the other fades its glow
 *     and inner highlight between the two drawings' looks, a little after it
 *     starts to turn;
 *   • sway: every bulb sways very gently around the end of its hanger, each
 *     with its own delay;
 *   • light: bulbs look as in the drawings; a lit bulb's halo breathes
 *     gently with the common light rhythm;
 *   • sparkles: the bright glints of the lit bulbs come up together as their
 *     bulbs light, shimmer gently (brightness and a touch of size, around
 *     their own centre, never turning or moving) and fade as the bulbs go out;
 *   • breath: the wire follows the tiny difference between the two drawings.
 *
 * Every curve is periodic, so frame 180 = frame 0.
 */
/** distance of p from c around the loop, in −0.5 … 0.5 */
export declare const loopOffset: (p: number, c: number) => number;
export declare const MOTION: {
    /**
     * state: a continuous wave — drawing 1 at p = 0, drawing 2 at p = 0.5, back to drawing 1 at p = 1.
     * No holds: the garland is always moving, slowing down only for the instant it changes direction,
     * and its speed at the end of the loop equals its speed at the start (seamless repeat).
     */
    readonly state: {
        readonly shape: "cosine";
    };
    /** delay of each bulb's change, left to right (share of the loop) */
    readonly ripple: readonly [-0.03, -0.018, -0.006, 0.006, 0.018, 0.03];
    /** sway around the hanger's end: ±degrees, waves per loop, delay between neighbours (share of the loop) */
    readonly sway: {
        readonly degrees: 1.6;
        readonly waves: 1;
        readonly delay: 0.11;
    };
    /**
     * light: lit and dim bulbs look exactly as in the drawings (owner, 2026-10-30: no extra dimming);
     * a lit bulb's coloured halo breathes gently with the common light rhythm (± pulse).
     */
    readonly look: {
        readonly pulse: 0.12;
    };
    /**
     * sparkles = bright glints of the lit bulbs. All glints of a state live together (no delays): they
     * come up as their bulbs light, shimmer with the common rhythm (waves per loop) — a gentle change of
     * brightness and size around their own centre, never turning or moving — and fade as the bulbs go out.
     * appear: share of "lit" at which they start / are full; shimmer: ± share of brightness and size.
     */
    readonly sparkle: {
        readonly appear: readonly [0.45, 0.95];
        readonly waves: 3;
        readonly brightness: 0.18;
        readonly size: 0.05;
        readonly grow: 0.15;
    };
};
/** 0 = drawing 1, 1 = drawing 2: (1 − cos 2πp) / 2 — smooth everywhere, no pauses, same speed across the loop seam. */
export declare function stateAt(p: number): number;
export interface BulbState {
    /** 0 = as in drawing 1, 1 = as in drawing 2 */
    state: number;
    /** 0 = looks as in drawing 1, 1 = as in drawing 2 (glow, inner highlight) */
    light: number;
    /** sway around the hanger's end, degrees */
    sway: number;
}
export declare function bulbState(p: number, bulb: number): BulbState;
/** Common light rhythm: −1 … 1, smooth, seamless (whole waves per loop). */
export declare function lightPulse(p: number): number;
export interface SparkleState {
    /** size relative to the drawing (always around the star's own centre, never turned) */
    scale: number;
    /** opacity of the star */
    opacity: number;
    /** opacity of its soft white glow */
    glow: number;
}
/**
 * Glints of the drawing `litIn` (all of them together): presence follows that drawing's light
 * (common to all its glints — no individual delays), the shimmer follows the common light rhythm.
 */
export declare function sparkleState(p: number, litIn: 0 | 1): SparkleState;
