/**
 * Orbit maths for the five ghosts.
 *
 * Every ghost's pose is a function of ONE number: its angle on the orbit.
 * The motion plan moves every ghost by exactly one place (72°)
 * counter-clockwise per 3-second loop; because all five ghosts are the same
 * drawing and their pose depends only on the angle, the picture at the end
 * of a loop is exactly the picture at its start (ghost i stands where ghost
 * i−1 stood), so the loop repeats with no jump.
 */
import { ORBIT } from './layout';

export interface GhostPose {
  /** centre of the ghost */
  x: number;
  y: number;
  /** degrees */
  rotate: number;
  scale: number;
  /** orbit angle, degrees */
  theta: number;
}

export const STEP_DEG = 360 / ORBIT.count; // 72°

/**
 * Pose of ghost `index` at loop progress `phase` (0 … 1).
 * Counter-clockwise on screen = the angle DEcreases (SVG y axis points down).
 */
export function ghostPose(index: number, phase = 0): GhostPose {
  const theta = ORBIT.theta0 + index * STEP_DEG - phase * STEP_DEG;
  const t = (theta * Math.PI) / 180;
  return {
    x: ORBIT.cx + ORBIT.r * Math.cos(t),
    y: ORBIT.cy + ORBIT.r * Math.sin(t),
    // approved pose: along the orbit, head leading, tail trailing
    rotate: theta + ORBIT.tangentOffset,
    scale: ORBIT.ghostScale,
    theta,
  };
}
