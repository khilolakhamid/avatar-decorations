import type { AssetSources } from '../assets/index.js';
export interface CompositionOptions {
    /** Prefix for all ids so several copies can live on one page. */
    idPrefix?: string;
    /** Loop progress 0…1 to draw. */
    progress?: number;
}
/** Every changing attribute of the drawing at one moment: part name → attribute → value. */
export type Frame = Record<string, Record<string, string>>;
type Pt = readonly [number, number];
/** How much of the tip's bend a point gets: 0 on the base, growing towards the tip. */
export declare function bendShare(p: Pt): number;
/** How much of the whole-ear sway a point gets: 0 on the base, partly in the middle, fully in the upper part. */
export declare function swayShare(p: Pt): number;
/**
 * A point of ear.svg bent by `degrees` at the tip and swayed by `sway` (both turned around the
 * middle of the base; the base itself never moves).
 */
export declare function bendPoint(p: Pt, degrees: number, sway?: number): Pt;
export declare const EAR_SIDES: readonly ["left", "right"];
export type EarSide = (typeof EAR_SIDES)[number];
/** Tip bend of both ears at loop progress 0…1, degrees (positive = outwards). */
export declare function earBends(progress?: number): Record<EarSide, number>;
/** Sway of both whole ears at loop progress 0…1, degrees (positive = outwards). */
export declare function earSways(progress?: number): Record<EarSide, number>;
/** All changing attributes (path points and gradient ends of both ears) at loop progress 0…1. */
export declare function earFrame(progress?: number): Frame;
export declare function buildCatEarsSvg(sources: AssetSources, { idPrefix, progress }?: CompositionOptions): string;
export {};
