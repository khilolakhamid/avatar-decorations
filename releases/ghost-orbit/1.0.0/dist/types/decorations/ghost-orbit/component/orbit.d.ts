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
export declare const STEP_DEG: number;
/**
 * Pose of ghost `index` at loop progress `phase` (0 … 1).
 * Counter-clockwise on screen = the angle DEcreases (SVG y axis points down).
 */
export declare function ghostPose(index: number, phase?: number): GhostPose;
