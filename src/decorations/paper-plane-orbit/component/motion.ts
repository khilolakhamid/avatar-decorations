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
import type { Pt, ViewIndex } from './planeModel';

/** Key moments of the loop: [progress, x, y, size]. Size 1 = the drawing's own size (before MOTION.size). */
export const PATH_KEYS: ReadonlyArray<readonly [number, number, number, number]> = [
  [0.0, 52, 200, 0.36], // appears far away, left (drawing 1)
  [0.15, 72, 262, 0.45], // approaching (drawing 1)
  [0.46, 262, 298, 1.15], // close to the viewer, in front of the avatar (drawing 2)
  [0.74, 436, 182, 0.5], // flying away, top right (drawing 3)
  [0.86, 456, 132, 0.38], // far away, vanishing
  [0.94, 300, 70, 0.36], // behind the photo, invisible, on its way back
];

/** View turns: [from progress, to progress, from view, to view] — eased; outside a turn the view holds. */
export const VIEW_SEGMENTS: ReadonlyArray<readonly [number, number, ViewIndex, ViewIndex]> = [
  [0.15, 0.42, 0, 1], // drawing 1 → drawing 2 while approaching
  [0.5, 0.74, 1, 2], // drawing 2 → drawing 3 while flying away
  [0.92, 0.93, 2, 0], // back to drawing 1 while invisible behind the photo (ready for the next loop)
];

export const MOTION = {
  /** fade in over [0, fadeIn], fade out over [fadeOutStart, fadeOutEnd] */
  fade: { fadeIn: 0.15, fadeOutStart: 0.74, fadeOutEnd: 0.88 },
  /** lean into the turn near the viewer: degrees, centre and width of the bump */
  bank: { degrees: -7, at: 0.46, width: 0.14 },
  /** wind: wobble of the whole plane ±deg, waves per loop (owner: about 25–30 % calmer than ±2°) */
  wind: { wobble: 1.45, wobbleWaves: 3 },
  /** overall size of the plane: multiplies every size in PATH_KEYS, so the perspective stays the same (owner: +10 %) */
  size: 1.1,
} as const;

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

const TAU = Math.PI * 2;
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** periodic Catmull-Rom through the keys (progress wraps at 1) */
function periodicSpline(keys: ReadonlyArray<readonly number[]>, column: number, t: number): number {
  const n = keys.length;
  const u = t - Math.floor(t);
  let i = n - 1;
  for (let k = 0; k < n; k++) if (keys[k][0] <= u) i = k;
  const at = (k: number) => {
    const wrap = Math.floor(k / n);
    const row = keys[((k % n) + n) % n];
    return [row[0] + wrap, row[column]] as const;
  };
  const [x0, y0] = at(i - 1);
  const [x1, y1] = at(i);
  const [x2, y2] = at(i + 1);
  const [x3, y3] = at(i + 2);
  const s = (u - x1) / (x2 - x1);
  const m1 = ((y2 - y0) / (x2 - x0)) * (x2 - x1);
  const m2 = ((y3 - y1) / (x3 - x1)) * (x2 - x1);
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * y1 + (s3 - 2 * s2 + s) * m1 + (-2 * s3 + 3 * s2) * y2 + (s3 - s2) * m2;
}

export function pathPoint(progress: number): Pt {
  return [periodicSpline(PATH_KEYS, 1, progress), periodicSpline(PATH_KEYS, 2, progress)];
}

export function viewBlend(progress: number): { viewA: ViewIndex; viewB: ViewIndex; blend: number } {
  const p = progress - Math.floor(progress);
  let last: { viewA: ViewIndex; viewB: ViewIndex; blend: number } = { viewA: 0, viewB: 0, blend: 0 };
  for (const [t0, t1, a, b] of VIEW_SEGMENTS) {
    if (p < t0) return last;
    if (p <= t1) return { viewA: a, viewB: b, blend: smoothstep(t0, t1, p) };
    last = { viewA: b, viewB: b, blend: 0 };
  }
  return last;
}

export function planeState(progress: number): PlaneState {
  const p = progress - Math.floor(progress);
  const [x, y] = pathPoint(p);
  const { fade, bank, wind, size } = MOTION;
  // distance to the bank moment, wrapped around the loop so the curve is periodic
  const d = ((p - bank.at + 1.5) % 1) - 0.5;
  const bankBump = Math.exp(-((d / bank.width) ** 2));
  return {
    x,
    y,
    scale: periodicSpline(PATH_KEYS, 3, p) * size,
    rotate: bank.degrees * bankBump + wind.wobble * Math.sin(TAU * wind.wobbleWaves * p + 0.6),
    opacity: smoothstep(0, fade.fadeIn, p) * (1 - smoothstep(fade.fadeOutStart, fade.fadeOutEnd, p)),
    ...viewBlend(p),
  };
}
