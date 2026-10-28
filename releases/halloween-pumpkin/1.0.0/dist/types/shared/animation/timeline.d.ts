/**
 * Keyframe timeline model, shared by all decorations.
 *
 * Deliberately limited to what Telegram TGS (Lottie) supports, so the same
 * data can later be exported:
 *   • group transform around a pivot: move, rotate, scale X/Y, opacity
 *   • shape morph between paths with the same number of points
 * No expressions, no effects, no time remapping.
 */
import { type Bezier } from './easing.js';
import { lerpPath, type PathData } from './path.js';
export interface Key<T> {
    /** Frame number (0 … frames). Fractions allowed. */
    f: number;
    v: T;
    /** Easing of the segment that STARTS at this key. Default: EASE.inOut. */
    ease?: Bezier;
}
export type TransformProp = 'x' | 'y' | 'rotate' | 'scaleX' | 'scaleY' | 'opacity';
export interface PartAnimation {
    /**
     * Pivot (anchor point) in the part's own coordinates — for a part that
     * wraps an original vector, the coordinates of that SVG file.
     */
    pivot?: readonly [number, number];
    x?: Key<number>[];
    y?: Key<number>[];
    /** degrees */
    rotate?: Key<number>[];
    scaleX?: Key<number>[];
    scaleY?: Key<number>[];
    opacity?: Key<number>[];
}
export interface Timeline {
    fps: number;
    /** Loop length in frames (the last frame equals frame 0). */
    frames: number;
    /** Transform animation per `data-part` name. */
    parts: Record<string, PartAnimation>;
    /** Path morphs per `data-part` name (element must be a <path>). */
    morphs: Record<string, Key<PathData>[]>;
}
export declare const TRANSFORM_PROPS: readonly TransformProp[];
export declare const DEFAULTS: Record<TransformProp, number>;
/** Value of a track at a (fractional) frame. */
export declare function sample<T>(keys: Key<T>[], frame: number, lerp: (a: T, b: T, t: number) => T): T;
export declare const lerpNumber: (a: number, b: number, t: number) => number;
export { lerpPath };
/** Builds a morph track from path strings. */
export declare function morphKeys(keys: Key<string | PathData>[]): Key<PathData>[];
/**
 * Checks the rules that keep a loop seamless and export-safe.
 * Returns a list of problems (empty = OK).
 */
export declare function validateTimeline(t: Timeline): string[];
