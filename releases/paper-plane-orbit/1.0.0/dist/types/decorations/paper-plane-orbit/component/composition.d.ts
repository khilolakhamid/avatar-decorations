import type { AssetSources } from '../assets/index.js';
import { type PlaneState } from './motion.js';
import { type ViewIndex } from './planeModel.js';
export interface CompositionOptions {
    /** Prefix for all ids so several copies can live on one page. */
    idPrefix?: string;
    /** Loop progress 0…1 to draw. */
    progress?: number;
}
/** Every changing attribute of the drawing at one moment: part name → attribute → value. */
export type Frame = Record<string, Record<string, string>>;
/** Highlight slots of the 2 ↔ 3 turn: one per (view, highlight) of drawings 2 and 3. */
export declare const HIGHLIGHT_SLOTS: {
    view: ViewIndex;
    hi: number;
    wing: "A" | "B";
}[];
export declare function planeFrame(progress?: number): Frame;
/** All attributes for a given plane state (used by planeFrame; also handy to show one view alone). */
export declare function planeFrameFromState(s: PlaneState): Frame;
export declare function buildPaperPlaneOrbitSvg(sources: AssetSources, { idPrefix, progress, state }?: CompositionOptions & {
    state?: PlaneState;
}): string;
