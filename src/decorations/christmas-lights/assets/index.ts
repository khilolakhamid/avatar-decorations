/**
 * Original vector files of the Christmas Lights decoration (owner's files
 * 1.svg and 2.svg, never edited by hand). Their text is embedded byte for
 * byte by scripts/embed-assets.mjs.
 *
 * Two states of ONE garland: the same wire and six bulbs; between the states
 * the bulbs hang at slightly different angles and the other half of them is lit.
 */
import { lights1, lights2 } from './sources.generated';

export type AssetKey = 'lights_1' | 'lights_2';
export type AssetSources = Record<AssetKey, string>;

export const ASSET_SOURCES: AssetSources = {
  lights_1: lights1,
  lights_2: lights2,
};

/** What each original vector is. */
export const ASSET_ROLES: Record<AssetKey, string> = {
  lights_1: 'state 1 — blue, pink and red bulbs lit (with sparkles), purple, green and yellow dim',
  lights_2: 'state 2 — purple, green and yellow bulbs lit (with sparkles), blue, pink and red dim',
};
