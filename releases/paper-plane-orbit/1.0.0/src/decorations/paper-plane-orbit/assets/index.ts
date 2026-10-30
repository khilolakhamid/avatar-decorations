/**
 * Original vector files of the Paper Plane Orbit decoration (designer's
 * files Paper_Plane_1.svg, Paper_Plane_2.svg and Paper_Plane_3.svg, never
 * edited by hand). Their text is embedded byte for byte by
 * scripts/embed-assets.mjs.
 *
 * Three views of ONE plane. Paper_Plane_1.svg is the owner's updated version
 * (2026-10-30), redrawn from drawing 2 with the same elements in the same order.
 */
import { paperPlane1, paperPlane2, paperPlane3 } from './sources.generated';

export type AssetKey = 'paper_plane_1' | 'paper_plane_2' | 'paper_plane_3';
export type AssetSources = Record<AssetKey, string>;

export const ASSET_SOURCES: AssetSources = {
  paper_plane_1: paperPlane1,
  paper_plane_2: paperPlane2,
  paper_plane_3: paperPlane3,
};

/** What each original vector is. */
export const ASSET_ROLES: Record<AssetKey, string> = {
  paper_plane_1: 'drawing 1 — the plane at the start, small and far away',
  paper_plane_2: 'drawing 2 — the plane close to the viewer, big, in front of the photo',
  paper_plane_3: 'drawing 3 — the plane flying away, getting small and vanishing',
};
