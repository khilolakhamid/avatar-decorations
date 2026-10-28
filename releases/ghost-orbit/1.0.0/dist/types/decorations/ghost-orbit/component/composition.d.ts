import type { AssetSources } from '../assets/index.js';
import { type GhostMotion } from './motion.js';
export interface CompositionOptions {
    /** Prefix for all ids so several copies can live on one page. */
    idPrefix?: string;
    /** Loop progress 0…1 to draw. */
    phase?: number;
}
/** Animated parts of one ghost, in drawing order of the markup. */
export declare const GHOST_PARTS: readonly ["ghost", "body", "shape", "face", "mouth", "eye-left", "eye-right"];
export type GhostPart = (typeof GHOST_PARTS)[number];
/** All transforms of ghost `index` at loop progress `phase`. */
export declare function ghostTransforms(index: number, phase?: number): Record<GhostPart, string>;
/** Transforms inside one ghost (body, face, mouth, eyes) for a given motion state. */
export declare function ghostLocalTransforms(m: GhostMotion): Omit<Record<GhostPart, string>, 'ghost'>;
export declare function buildGhostOrbitSvg(sources: AssetSources, { idPrefix, phase }?: CompositionOptions): string;
