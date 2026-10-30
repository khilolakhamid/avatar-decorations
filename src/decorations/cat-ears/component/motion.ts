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

export const MOTION = {
  /** largest outward turn, degrees */
  out: 3,
  /** key poses over one loop: [loop share 0…1, share of `out`] */
  keys: [
    [0, 0],
    [0.3, 1], // out
    [0.58, 0], // back
    [0.8, -0.4], // a little in (≈ −1.2°)
  ] as ReadonlyArray<readonly [number, number]>,
  /** the right ear's delay behind the left one: none — the ears swing together, mirrored */
  rightDelay: 0,
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

/** Outward turn of the left ear at loop progress 0…1, degrees. */
export function leftEarAngle(progress: number): number {
  return MOTION.out * periodicSpline(MOTION.keys, progress);
}

/** Outward turn of the right ear at loop progress 0…1, degrees. */
export function rightEarAngle(progress: number): number {
  return MOTION.out * periodicSpline(MOTION.keys, progress - MOTION.rightDelay);
}
