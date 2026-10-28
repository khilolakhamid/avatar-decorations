/**
 * Original vector files of the Halloween Pumpkin decoration.
 *
 * The files in this folder are the designer's originals and must not be
 * edited by hand. Keys are code-friendly identifiers; `SOURCE_FILE_NAMES`
 * keeps the exact original names (note the space in "mini pumpkin").
 */
// The SVG text is embedded (byte for byte) by scripts/embed-assets.mjs,
// so no bundler setting for `.svg` imports is needed anywhere.
import {
  pumpkin,
  plant,
  miniPumpkin,
  tail,
  leaf1,
  leaf2,
  batHead,
  leftWing,
  rightWing,
} from './sources.generated';

export type AssetKey =
  | 'pumpkin'
  | 'plant'
  | 'miniPumpkin'
  | 'tail'
  | 'leaf1'
  | 'leaf2'
  | 'batHead'
  | 'leftWing'
  | 'rightWing';

export type AssetSources = Record<AssetKey, string>;

export const ASSET_SOURCES: AssetSources = {
  pumpkin,
  plant,
  miniPumpkin,
  tail,
  leaf1,
  leaf2,
  batHead,
  leftWing,
  rightWing,
};

/** Code identifier → exact original vector name from the brief. */
export const SOURCE_FILE_NAMES: Record<AssetKey, string> = {
  pumpkin: 'pumpkin',
  plant: 'plant',
  miniPumpkin: 'mini pumpkin',
  tail: 'tail',
  leaf1: 'leaf_1',
  leaf2: 'leaf_2',
  batHead: 'bat_head',
  leftWing: 'left_wing',
  rightWing: 'right_wing',
};
