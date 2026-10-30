/**
 * Original vector file of the Cat Ears decoration (designer's file, never
 * edited by hand). Its text is embedded byte for byte by
 * scripts/embed-assets.mjs, so no bundler setting for `.svg` is needed.
 */
import { ear } from './sources.generated';

export type AssetKey = 'ear';
export type AssetSources = Record<AssetKey, string>;

export const ASSET_SOURCES: AssetSources = { ear };

/** What the original vector is. */
export const ASSET_ROLES: Record<AssetKey, string> = {
  ear: 'right cat ear: light outer part, pink inner part, lavender outline and fur (the left ear is its mirror image)',
};
