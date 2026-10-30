/**
 * Builds the Cat Ears SVG from the original vector.
 *
 * The ear is defined ONCE in <defs> and used twice: as is for the right ear
 * and mirrored around x = 256 for the left ear.
 *
 *   <g data-layer="ear-left" transform="mirror">
 *     <g transform="place"><g data-part="swing-left" transform="rotate(a, base)"><use ear/></g></g>
 *   <g data-layer="ear-right">
 *     <g transform="place"><g data-part="swing-right" transform="rotate(a, base)"><use ear/></g></g>
 *
 * In the mirrored copy a positive turn also moves the tip outwards, so both
 * ears use "positive = outwards". No avatar, placeholder or background is
 * drawn: the SVG is transparent.
 */
import { parseSvg, prefixIds } from '../../../shared/svg';
import type { AssetSources } from '../assets';
import { CANVAS_SIZE, EAR_PIVOT, RIGHT_EAR } from './layout';
import { leftEarAngle, rightEarAngle } from './motion';

export interface CompositionOptions {
  /** Prefix for all ids so several copies can live on one page. */
  idPrefix?: string;
  /** Loop progress 0…1 to draw. */
  progress?: number;
}

export const EAR_PARTS = ['swing-left', 'swing-right'] as const;
export type EarPart = (typeof EAR_PARTS)[number];

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** Swing transforms of both ears at loop progress 0…1. */
export function earTransforms(progress = 0): Record<EarPart, string> {
  const [px, py] = EAR_PIVOT;
  return {
    'swing-left': `rotate(${r3(leftEarAngle(progress))} ${px} ${py})`,
    'swing-right': `rotate(${r3(rightEarAngle(progress))} ${px} ${py})`,
  };
}

export function buildCatEarsSvg(sources: AssetSources, { idPrefix = 'ce-', progress = 0 }: CompositionOptions = {}): string {
  const ear = parseSvg(sources.ear);
  const ns = `${idPrefix}ear-`;
  const defs = [
    ear.defs ? prefixIds(ear.defs, ns) : '',
    // fill="none" mirrors the original file's root
    `<g id="${idPrefix}ear" fill="none">${prefixIds(ear.body, ns)}</g>`,
  ].join('');
  const t = earTransforms(progress);
  const place = `translate(${RIGHT_EAR.x} ${RIGHT_EAR.y}) scale(${RIGHT_EAR.scale})`;
  const one = (part: EarPart) =>
    `<g transform="${place}"><g data-part="${part}" transform="${t[part]}"><use href="#${idPrefix}ear"/></g></g>`;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" ` +
    `fill="none" overflow="visible" data-decoration="cat-ears">` +
    `<defs>${defs}</defs>` +
    `<g data-layer="ear-left" transform="translate(${CANVAS_SIZE} 0) scale(-1 1)">${one('swing-left')}</g>` +
    `<g data-layer="ear-right">${one('swing-right')}</g>` +
    `</svg>`
  );
}
