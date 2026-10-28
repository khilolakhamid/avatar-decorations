/**
 * Bend of the front `plant`: the base (the flat cut that joins the stem
 * inside `pumpkin`) stays fixed, the curled tip swings softly.
 *
 * Every point of the original paths is turned around the joint by its own
 * angle: zero near the joint, growing smoothly toward the tip. Curves keep
 * their type and point count, so the result is a valid TGS shape morph.
 */
import { type PathData } from '../../../shared/animation/index.js';
/** Centre of the flat cut (plant.svg coordinates, x = 70.43, y 6 … 30.8). */
export declare const PLANT_JOINT: readonly [70.43, 18.4];
export declare function bendPlant(path: PathData, angleDeg: number): PathData;
/** The three paths of plant.svg in file order: fill, light highlight, outline. */
export declare const PLANT_PARTS: readonly ["plant-fill", "plant-light", "plant-outline"];
export declare function plantPaths(plantSvg: string): PathData[];
