/** Keys use the exact vector names from the brief. */
export type AssetKey = 'ghost' | 'face';
export type AssetSources = Record<AssetKey, string>;
export declare const ASSET_SOURCES: AssetSources;
/** What each original vector is (names as in the brief). */
export declare const ASSET_ROLES: Record<AssetKey, string>;
