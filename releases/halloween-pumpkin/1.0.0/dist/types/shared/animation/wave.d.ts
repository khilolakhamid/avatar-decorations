/**
 * Smooth periodic motion (sways, bobs) expressed as ordinary keyframes.
 *
 * A sine wave is sampled at its quarter points (peaks and zero crossings)
 * plus the loop boundaries. Each segment gets a cubic-bezier ease whose
 * tangents match the sine's slope (cubic Hermite), so the motion is smooth
 * with very few keys — and every key is a normal Lottie/TGS keyframe.
 */
import type { Bezier } from './easing.js';
import type { Key } from './timeline.js';
export interface WaveSpec {
    /** Loop length in frames (the wave must repeat within it). */
    frames: number;
    /** Period in frames — must divide `frames` (e.g. 180, 90, 60). */
    period: number;
    /** Shift in frames: the wave crosses zero going up at `phase`. */
    phase?: number;
}
export interface WaveSample {
    f: number;
    /** sine value −1…1 */
    s: number;
    /** slope of s per frame */
    ds: number;
}
/** Sample points of a unit sine wave over one loop. */
export declare function waveSamples({ frames, period, phase }: WaveSpec): WaveSample[];
/** Bezier ease that reproduces a cubic Hermite segment. */
export declare function hermiteEase(v0: number, v1: number, d0: number, d1: number, duration: number): Bezier;
/** Numeric keys: value = center + amplitude · sin(…). */
export declare function waveKeys(spec: WaveSpec, amplitude: number, center?: number): Key<number>[];
/**
 * Keys that follow any smooth function `fn(frame)` between two frames,
 * sampled every `step` frames, with Hermite eases matching its slope.
 * Use for compound motion (a drift plus a bob) on one property.
 */
export declare function sampledKeys(fn: (f: number) => number, from: number, to: number, step: number): Key<number>[];
/**
 * Keys of any value that depends on the wave (e.g. a deformed shape):
 * `valueAt(s)` builds the value for a sine value s. Easing follows s.
 */
export declare function waveValueKeys<T>(spec: WaveSpec, valueAt: (s: number) => T): Key<T>[];
