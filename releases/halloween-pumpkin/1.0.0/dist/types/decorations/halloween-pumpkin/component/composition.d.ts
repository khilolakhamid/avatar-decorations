import type { AssetSources } from '../assets/index.js';
import { type HalloweenPumpkinLayout } from './layout.js';
export interface CompositionOptions {
    /** Prefix for all ids so several copies can live on one page. */
    idPrefix?: string;
    layout?: HalloweenPumpkinLayout;
}
export declare function buildHalloweenPumpkinSvg(sources: AssetSources, { idPrefix, layout }?: CompositionOptions): string;
