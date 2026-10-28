export type AssetKey = 'pumpkin' | 'plant' | 'miniPumpkin' | 'tail' | 'leaf1' | 'leaf2' | 'batHead' | 'leftWing' | 'rightWing';
export type AssetSources = Record<AssetKey, string>;
export declare const ASSET_SOURCES: AssetSources;
/** Code identifier → exact original vector name from the brief. */
export declare const SOURCE_FILE_NAMES: Record<AssetKey, string>;
