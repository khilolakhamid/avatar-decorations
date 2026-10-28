/**
 * Bend of the front `plant`: the base (the flat cut that joins the stem
 * inside `pumpkin`) stays fixed, the curled tip swings softly.
 *
 * Every point of the original paths is turned around the joint by its own
 * angle: zero near the joint, growing smoothly toward the tip. Curves keep
 * their type and point count, so the result is a valid TGS shape morph.
 */
import { mapPoints, parsePath, type PathData } from '../../../shared/animation';

/** Centre of the flat cut (plant.svg coordinates, x = 70.43, y 6 … 30.8). */
export const PLANT_JOINT = [70.43, 18.4] as const;

/** Points closer than this to the joint do not move at all. */
const RIGID_RADIUS = 28;
/** At this distance (≈ the curl) the full angle applies. */
const FULL_RADIUS = 145;

const smoothstep = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

export function bendPlant(path: PathData, angleDeg: number): PathData {
  const [cx, cy] = PLANT_JOINT;
  const max = (angleDeg * Math.PI) / 180;
  return mapPoints(path, (x, y) => {
    const dx = x - cx;
    const dy = y - cy;
    const w = smoothstep((Math.hypot(dx, dy) - RIGID_RADIUS) / (FULL_RADIUS - RIGID_RADIUS));
    const a = max * w;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
  });
}

/** The three paths of plant.svg in file order: fill, light highlight, outline. */
export const PLANT_PARTS = ['plant-fill', 'plant-light', 'plant-outline'] as const;

export function plantPaths(plantSvg: string): PathData[] {
  const ds = [...plantSvg.matchAll(/<path\b[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  if (ds.length !== PLANT_PARTS.length) throw new Error(`plant: expected 3 paths, found ${ds.length}`);
  return ds.map(parsePath);
}
