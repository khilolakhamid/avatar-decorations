/**
 * Smooth periodic motion (sways, bobs) expressed as ordinary keyframes.
 *
 * A sine wave is sampled at its quarter points (peaks and zero crossings)
 * plus the loop boundaries. Each segment gets a cubic-bezier ease whose
 * tangents match the sine's slope (cubic Hermite), so the motion is smooth
 * with very few keys — and every key is a normal Lottie/TGS keyframe.
 */
import type { Bezier } from './easing';
import type { Key } from './timeline';

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
export function waveSamples({ frames, period, phase = 0 }: WaveSpec): WaveSample[] {
  if (frames % period !== 0) throw new Error(`wave: period ${period} does not divide ${frames}`);
  const w = (2 * Math.PI) / period;
  const quarter = period / 4;
  const set = new Set<number>([0, frames]);
  const first = (((phase % quarter) + quarter) % quarter);
  for (let f = first; f < frames; f += quarter) set.add(Math.round(f * 1000) / 1000);
  return [...set]
    .sort((a, b) => a - b)
    .map((f) => ({ f, s: Math.sin(w * (f - phase)), ds: w * Math.cos(w * (f - phase)) }));
}

/** Bezier ease that reproduces a cubic Hermite segment. */
export function hermiteEase(v0: number, v1: number, d0: number, d1: number, duration: number): Bezier {
  const dv = v1 - v0;
  if (Math.abs(dv) < 1e-9) return [1 / 3, 0, 2 / 3, 1];
  return [1 / 3, (d0 * duration) / dv / 3, 2 / 3, 1 - (d1 * duration) / dv / 3];
}

/** Numeric keys: value = center + amplitude · sin(…). */
export function waveKeys(spec: WaveSpec, amplitude: number, center = 0): Key<number>[] {
  const samples = waveSamples(spec);
  return samples.map((p, i) => {
    const next = samples[i + 1];
    const v = center + amplitude * p.s;
    if (!next) return { f: p.f, v };
    return {
      f: p.f,
      v,
      ease: hermiteEase(p.s, next.s, p.ds, next.ds, next.f - p.f),
    };
  });
}

/**
 * Keys that follow any smooth function `fn(frame)` between two frames,
 * sampled every `step` frames, with Hermite eases matching its slope.
 * Use for compound motion (a drift plus a bob) on one property.
 */
export function sampledKeys(fn: (f: number) => number, from: number, to: number, step: number): Key<number>[] {
  const fs: number[] = [];
  for (let f = from; f < to - 1e-9; f += step) fs.push(f);
  fs.push(to);
  const slope = (f: number) => (fn(f + 0.01) - fn(f - 0.01)) / 0.02;
  return fs.map((f, i) => {
    const next = fs[i + 1];
    const v = fn(f);
    return next === undefined
      ? { f, v }
      : { f, v, ease: hermiteEase(v, fn(next), slope(f), slope(next), next - f) };
  });
}

/**
 * Keys of any value that depends on the wave (e.g. a deformed shape):
 * `valueAt(s)` builds the value for a sine value s. Easing follows s.
 */
export function waveValueKeys<T>(spec: WaveSpec, valueAt: (s: number) => T): Key<T>[] {
  const samples = waveSamples(spec);
  return samples.map((p, i) => {
    const next = samples[i + 1];
    return next
      ? { f: p.f, v: valueAt(p.s), ease: hermiteEase(p.s, next.s, p.ds, next.ds, next.f - p.f) }
      : { f: p.f, v: valueAt(p.s) };
  });
}
