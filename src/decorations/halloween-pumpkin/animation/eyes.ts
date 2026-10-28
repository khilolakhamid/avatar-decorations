/**
 * Closed-eye shapes, derived from the ORIGINAL open eyes.
 *
 * Approved variant: the eye closes up toward its brow line.
 * Each dark eye has a straight top edge — the angry "brow". A blink squeezes
 * the eye perpendicular to that line toward it: the brow itself does not
 * move, so the angry slant is kept at every moment, and a narrow slit stays
 * under the brow. Socket and dark eye get the SAME squeeze, so they stay
 * fitted to each other. The squeeze is a linear map, so curves keep their
 * type and point count — a valid TGS shape morph. Opening returns to the
 * untouched original paths.
 */
import { mapPoints, parsePath, type PathData } from '../../../shared/animation';

/** How open the eye is at the closed moment (fraction of its height). */
const CLOSED_OPENNESS = 0.13;

interface Line {
  a: [number, number];
  /** unit normal pointing into the eye (downwards) */
  n: [number, number];
}

/** The straight `L` edge of the dark eye is its brow line. */
function browLine(darkEye: PathData): Line {
  let prev: [number, number] = [0, 0];
  let vi = 0;
  for (const cmd of darkEye.commands) {
    const n = cmd === 'C' ? 6 : cmd === 'Z' ? 0 : 2;
    const end: [number, number] = n ? [darkEye.values[vi + n - 2], darkEye.values[vi + n - 1]] : prev;
    if (cmd === 'L') {
      const dx = end[0] - prev[0];
      const dy = end[1] - prev[1];
      const len = Math.hypot(dx, dy);
      let nx = -dy / len;
      let ny = dx / len;
      if (ny < 0) {
        nx = -nx;
        ny = -ny;
      }
      return { a: prev, n: [nx, ny] };
    }
    prev = end;
    vi += n;
  }
  throw new Error('eyes: dark eye has no straight brow edge');
}

/** Returns the closed versions of [socket, darkEye] for one eye. */
export function closeEye(socketD: string, darkD: string, openness = CLOSED_OPENNESS): [PathData, PathData] {
  const socket = parsePath(socketD);
  const dark = parsePath(darkD);
  const { a, n } = browLine(dark);
  const squeeze = (x: number, y: number): [number, number] => {
    const s = (x - a[0]) * n[0] + (y - a[1]) * n[1];
    const moved = s * openness - s;
    return [x + n[0] * moved, y + n[1] * moved];
  };
  return [mapPoints(socket, squeeze), mapPoints(dark, squeeze)];
}
