/**
 * Keyframe timeline model, shared by all decorations.
 *
 * Deliberately limited to what Telegram TGS (Lottie) supports, so the same
 * data can later be exported:
 *   • group transform around a pivot: move, rotate, scale X/Y, opacity
 *   • shape morph between paths with the same number of points
 * No expressions, no effects, no time remapping.
 */
import { bezierEase, EASE, type Bezier } from './easing';
import { lerpPath, parsePath, sameStructure, type PathData } from './path';

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

export const TRANSFORM_PROPS: readonly TransformProp[] = ['x', 'y', 'rotate', 'scaleX', 'scaleY', 'opacity'];
export const DEFAULTS: Record<TransformProp, number> = { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1, opacity: 1 };

/** Value of a track at a (fractional) frame. */
export function sample<T>(keys: Key<T>[], frame: number, lerp: (a: T, b: T, t: number) => T): T {
  if (frame <= keys[0].f) return keys[0].v;
  const last = keys[keys.length - 1];
  if (frame >= last.f) return last.v;
  let i = 0;
  while (keys[i + 1].f <= frame) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const p = (frame - a.f) / (b.f - a.f);
  return lerp(a.v, b.v, bezierEase(a.ease ?? EASE.inOut, p));
}

export const lerpNumber = (a: number, b: number, t: number) => a + (b - a) * t;
export { lerpPath };

/** Builds a morph track from path strings. */
export function morphKeys(keys: Key<string | PathData>[]): Key<PathData>[] {
  return keys.map((k) => ({ ...k, v: typeof k.v === 'string' ? parsePath(k.v) : k.v }));
}

/**
 * Checks the rules that keep a loop seamless and export-safe.
 * Returns a list of problems (empty = OK).
 */
export function validateTimeline(t: Timeline): string[] {
  const problems: string[] = [];
  const checkKeys = (name: string, keys: Key<unknown>[], eq: (a: any, b: any) => boolean) => {
    if (keys.length < 2) problems.push(`${name}: needs at least 2 keys`);
    for (let i = 1; i < keys.length; i++) {
      if (keys[i].f <= keys[i - 1].f) problems.push(`${name}: keys not in increasing order at #${i}`);
    }
    if (keys[0].f !== 0) problems.push(`${name}: first key must be at frame 0`);
    if (keys[keys.length - 1].f !== t.frames) problems.push(`${name}: last key must be at frame ${t.frames}`);
    if (!eq(keys[0].v, keys[keys.length - 1].v)) problems.push(`${name}: first and last values differ (loop jump)`);
  };
  for (const [part, anim] of Object.entries(t.parts)) {
    for (const prop of TRANSFORM_PROPS) {
      const keys = anim[prop];
      if (keys) checkKeys(`${part}.${prop}`, keys, (a, b) => Math.abs(a - b) < 1e-9);
    }
  }
  for (const [part, keys] of Object.entries(t.morphs)) {
    checkKeys(`${part}.d`, keys, (a: PathData, b: PathData) =>
      sameStructure(a, b) && a.values.every((v, i) => Math.abs(v - b.values[i]) < 1e-9));
    for (const k of keys) {
      if (!sameStructure(keys[0].v, k.v)) problems.push(`${part}.d: key at frame ${k.f} has a different point count`);
    }
  }
  return problems;
}
