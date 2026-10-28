/**
 * Cubic-bezier easing — the same model Lottie/TGS uses for keyframe
 * interpolation (out-tangent of one key + in-tangent of the next), so a
 * timeline written here maps 1:1 to a TGS export.
 */
export type Bezier = readonly [x1: number, y1: number, x2: number, y2: number];

export const EASE = {
  linear: [0, 0, 1, 1],
  /** soft start and soft stop — default for organic motion */
  inOut: [0.42, 0, 0.58, 1],
  /** gentler sine-like in-out */
  sine: [0.37, 0, 0.63, 1],
  in: [0.42, 0, 1, 1],
  out: [0, 0, 0.58, 1],
  /** fast start, long soft landing (eyelid opening) */
  outSoft: [0.2, 0.7, 0.4, 1],
  /** accelerating close (eyelid closing) */
  inFast: [0.55, 0, 0.85, 0.4],
} as const satisfies Record<string, Bezier>;

/** Maps linear progress p∈[0,1] to eased progress. */
export function bezierEase(b: Bezier, p: number): number {
  const [x1, y1, x2, y2] = b;
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  if (x1 === y1 && x2 === y2) return p;
  // solve x(t) = p (Newton, then bisection fallback)
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const x = (t: number) => ((ax * t + bx) * t + cx) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  let t = p;
  for (let i = 0; i < 8; i++) {
    const err = x(t) - p;
    if (Math.abs(err) < 1e-6) break;
    const d = dx(t);
    if (Math.abs(d) < 1e-6) break;
    t -= err / d;
  }
  if (t < 0 || t > 1 || Math.abs(x(t) - p) > 1e-4) {
    let lo = 0, hi = 1;
    t = p;
    for (let i = 0; i < 30; i++) {
      if (x(t) < p) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
  }
  return ((ay * t + by) * t + cy) * t;
}
