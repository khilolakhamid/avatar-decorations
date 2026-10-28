/**
 * Path data utilities for shape morphing.
 *
 * A morph interpolates the numbers of two paths that have exactly the same
 * command sequence (same number of points) — this is also the rule for
 * animated shapes in Lottie/TGS.
 */
export interface PathData {
    /** Command letters in order, e.g. ['M','C','C','L','Z']. */
    commands: string[];
    /** All numbers, flattened, in order. */
    values: number[];
}
/** Parses absolute path data (as exported by Figma: M, L, C, H, V, Z).
 * H and V are converted to L, so every point is a full (x, y) pair. */
export declare function parsePath(d: string): PathData;
export declare function serializePath(p: PathData, digits?: number): string;
export declare function sameStructure(a: PathData, b: PathData): boolean;
/** Linear interpolation of two structurally identical paths. */
export declare function lerpPath(a: PathData, b: PathData, t: number): PathData;
/**
 * Applies a function to every (x, y) pair. H/V are not supported here
 * (the source shapes we morph do not use them).
 */
export declare function mapPoints(p: PathData, fn: (x: number, y: number) => [number, number]): PathData;
/** All (x, y) pairs of a path (control points included). */
export declare function points(p: PathData): [number, number][];
