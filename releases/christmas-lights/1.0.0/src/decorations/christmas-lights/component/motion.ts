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

const TAU = Math.PI * 2;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ease = (x: number) => {
  const k = clamp01(x);
  return k * k * (3 - 2 * k);
};
/** distance of p from c around the loop, in −0.5 … 0.5 */
export const loopOffset = (p: number, c: number) => ((((p - c) % 1) + 1.5) % 1) - 0.5;

export const MOTION = {
  /**
   * state: a continuous wave — drawing 1 at p = 0, drawing 2 at p = 0.5, back to drawing 1 at p = 1.
   * No holds: the garland is always moving, slowing down only for the instant it changes direction,
   * and its speed at the end of the loop equals its speed at the start (seamless repeat).
   */
  state: { shape: 'cosine' },
  /** delay of each bulb's change, left to right (share of the loop) */
  ripple: [-0.03, -0.018, -0.006, 0.006, 0.018, 0.03],
  /** sway around the hanger's end: ±degrees, waves per loop, delay between neighbours (share of the loop) */
  sway: { degrees: 1.6, waves: 1, delay: 0.11 },
  /**
   * light: lit and dim bulbs look exactly as in the drawings (owner, 2026-10-30: no extra dimming);
   * a lit bulb's coloured halo breathes gently with the common light rhythm (± pulse).
   */
  look: { pulse: 0.12 },
  /**
   * sparkles = bright glints of the lit bulbs. All glints of a state live together (no delays): they
   * come up as their bulbs light, shimmer with the common rhythm (waves per loop) — a gentle change of
   * brightness and size around their own centre, never turning or moving — and fade as the bulbs go out.
   * appear: share of "lit" at which they start / are full; shimmer: ± share of brightness and size.
   */
  sparkle: { appear: [0.45, 0.95], waves: 3, brightness: 0.18, size: 0.05, grow: 0.15 },
} as const;

/** 0 = drawing 1, 1 = drawing 2: (1 − cos 2πp) / 2 — smooth everywhere, no pauses, same speed across the loop seam. */
export function stateAt(p: number): number {
  return (1 - Math.cos(TAU * p)) / 2;
}

export interface BulbState {
  /** 0 = as in drawing 1, 1 = as in drawing 2 */
  state: number;
  /** 0 = looks as in drawing 1, 1 = as in drawing 2 (glow, inner highlight) */
  light: number;
  /** sway around the hanger's end, degrees */
  sway: number;
}

export function bulbState(p: number, bulb: number): BulbState {
  const state = stateAt(p - MOTION.ripple[bulb]);
  // the light follows the turn, changing fastest in its middle (no flat steps)
  const light = state * state * (3 - 2 * state);
  const { degrees, waves, delay } = MOTION.sway;
  return { state, light, sway: degrees * Math.sin(TAU * (waves * p - delay * bulb)) };
}

/** Common light rhythm: −1 … 1, smooth, seamless (whole waves per loop). */
export function lightPulse(p: number): number {
  return Math.sin(TAU * MOTION.sparkle.waves * p);
}

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
export function sparkleState(p: number, litIn: 0 | 1): SparkleState {
  const { appear, brightness, size, grow } = MOTION.sparkle;
  const s = stateAt(p);
  const lit = litIn === 1 ? s : 1 - s;
  const presence = ease((lit - appear[0]) / (appear[1] - appear[0]));
  const pulse = lightPulse(p); // −1 … 1
  const shimmer = 1 - brightness + brightness * (0.5 + 0.5 * pulse); // 1 − brightness … 1
  return {
    scale: (1 - grow + grow * presence) * (1 + size * pulse),
    opacity: presence * shimmer,
    glow: presence * (1 - 2 * brightness + 2 * brightness * (0.5 + 0.5 * pulse)),
  };
}
