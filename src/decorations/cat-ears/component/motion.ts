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

export const MOTION = {
  /** bend of the tip at key value 1, degrees (v1.0.0 turned the whole ear by 3°) */
  tip: 10,
  /** where the bend starts / ends along the ear (0 = middle of the base, 1 = tip) and how it grows */
  bend: { from: 0.19, to: 1, power: 1.6 },
  /** key poses of each ear over one loop: [loop share 0…1, share of `tip`] */
  left: [
    [0.0, 0],
    [0.1, 1], // flick out
    [0.185, -0.32], // springs back past the rest…
    [0.24, 0.1], // …and settles
    [0.31, 0],
    [0.5, 0.02],
    [0.6, 0.62], // out again, while the right ear leans in
    [0.69, -0.18],
    [0.76, 0.02],
    [0.85, -0.5], // a short twitch inwards
    [0.93, 0.12],
  ] as ReadonlyArray<readonly [number, number]>,
  right: [
    [0.0, 0.02],
    [0.18, 0],
    [0.28, 0.95], // flick out
    [0.365, -0.3],
    [0.42, 0.1],
    [0.5, 0],
    [0.6, -0.55], // leans in while the left ear leans out
    [0.69, 0.16],
    [0.77, 0],
    [0.86, 0.55], // a small flick out
    [0.94, -0.16],
  ] as ReadonlyArray<readonly [number, number]>,
  /** idle drift: ± share of `tip`, waves per loop */
  drift: { amount: 0.06, waves: 1 },
  /**
   * sway of the whole ear (added in the 1.1.0 draft, under the tip bend): the ear leans gently from side
   * to side around its base — the base stays, the middle leans partly, the upper part fully (`from`/`to`
   * along the ear). A slow wave (one per loop) with a little second wave for a natural, uneven rhythm;
   * the right ear runs behind the left one by `rightDelay` of the loop.
   */
  sway: { degrees: 3.5, from: 0.19, to: 0.7, second: 0.3, rightDelay: 0.22 },
} as const;

/** Periodic Catmull-Rom spline through the keys; t is wrapped into 0…1. */
function periodicSpline(keys: ReadonlyArray<readonly [number, number]>, t: number): number {
  const n = keys.length;
  const u = t - Math.floor(t);
  let i = n - 1;
  for (let k = 0; k < n; k++) if (keys[k][0] <= u) i = k;
  const at = (k: number) => {
    const wrap = Math.floor(k / n);
    const [x, y] = keys[((k % n) + n) % n];
    return [x + wrap, y] as const;
  };
  const [x0, y0] = at(i - 1);
  const [x1, y1] = at(i);
  const [x2, y2] = at(i + 1);
  const [x3, y3] = at(i + 2);
  const s = (u - x1) / (x2 - x1);
  // tangents scaled for uneven key spacing
  const m1 = ((y2 - y0) / (x2 - x0)) * (x2 - x1);
  const m2 = ((y3 - y1) / (x3 - x1)) * (x2 - x1);
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * y1 + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * y2 + (s3 - s2) * m2;
}

const drift = (progress: number, phase: number) =>
  MOTION.drift.amount * Math.sin(2 * Math.PI * (MOTION.drift.waves * (progress - Math.floor(progress)) + phase));

/** Sway of the whole ear (outwards positive) at loop progress 0…1, degrees; smooth and seamless. */
export function swayAngle(progress: number, side: 'left' | 'right'): number {
  const { degrees, second, rightDelay } = MOTION.sway;
  const u = progress - Math.floor(progress) - (side === 'right' ? rightDelay : 0);
  return (degrees * (Math.sin(2 * Math.PI * u) + second * Math.sin(4 * Math.PI * u + 0.8))) / (1 + second * 0.6);
}

/** Outward bend of the left ear's tip at loop progress 0…1, degrees. */
export function leftEarAngle(progress: number): number {
  return MOTION.tip * (periodicSpline(MOTION.left, progress) + drift(progress, 0));
}

/** Outward bend of the right ear's tip at loop progress 0…1, degrees. */
export function rightEarAngle(progress: number): number {
  return MOTION.tip * (periodicSpline(MOTION.right, progress) + drift(progress, 0.37));
}
