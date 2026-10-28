/**
 * Original vector files of the Ghost Orbit decoration (designer's files,
 * never edited by hand). Their text is embedded byte for byte by
 * scripts/embed-assets.mjs, so no bundler setting for `.svg` is needed.
 */
import { face, ghost } from './sources.generated';

/** Keys use the exact vector names from the brief. */
export type AssetKey = 'ghost' | 'face';
export type AssetSources = Record<AssetKey, string>;

export const ASSET_SOURCES: AssetSources = { ghost, face };

/** What each original vector is (names as in the brief). */
export const ASSET_ROLES: Record<AssetKey, string> = {
  ghost: 'translucent glowing ghost body (head top-right, wavy tail fading out bottom-left)',
  face: 'eyes and mouth of the ghost (3 paths: mouth, left eye, right eye)',
};
