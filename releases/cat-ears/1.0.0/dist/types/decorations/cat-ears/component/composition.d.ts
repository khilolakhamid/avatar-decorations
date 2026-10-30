import type { AssetSources } from '../assets/index.js';
export interface CompositionOptions {
    /** Prefix for all ids so several copies can live on one page. */
    idPrefix?: string;
    /** Loop progress 0…1 to draw. */
    progress?: number;
}
export declare const EAR_PARTS: readonly ["swing-left", "swing-right"];
export type EarPart = (typeof EAR_PARTS)[number];
/** Swing transforms of both ears at loop progress 0…1. */
export declare function earTransforms(progress?: number): Record<EarPart, string>;
export declare function buildCatEarsSvg(sources: AssetSources, { idPrefix, progress }?: CompositionOptions): string;
