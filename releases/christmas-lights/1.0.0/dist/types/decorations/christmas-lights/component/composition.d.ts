import type { AssetSources } from '../assets/index.js';
export interface CompositionOptions {
    /** Prefix for all ids so several copies can live on one page. */
    idPrefix?: string;
    /** Loop progress 0…1 to draw. */
    progress?: number;
}
/** Every changing attribute of the drawing at one moment: part name → attribute → value. */
export type Frame = Record<string, Record<string, string>>;
export declare function garlandFrame(progress?: number): Frame;
export declare function buildChristmasLightsSvg(sources: AssetSources, { idPrefix, progress }?: CompositionOptions): string;
