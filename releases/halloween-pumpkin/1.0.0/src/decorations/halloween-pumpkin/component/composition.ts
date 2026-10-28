/**
 * Builds the decoration's SVG markup from the original vectors.
 *
 * Structure (every animated part gets two nested groups):
 *   <g data-layer="…" transform="placement">   ← where it sits (static)
 *     <g data-part="…">                        ← what animation will move
 *       original vector content
 *
 * No avatar / placeholder / background is drawn: the SVG is transparent.
 */
import {
  parseSvg,
  prefixIds,
  placementTransform,
  topLevelElements,
  unwrapGroup,
  withAttr,
  type ParsedSvg,
  type Placement,
} from '../../../shared/svg';
import type { AssetKey, AssetSources } from '../assets';
import { PLANT_PARTS } from '../animation/plant';
import { EYE_GRADIENTS, paintOf, STEM_GRADIENTS } from './pumpkinParts';
import { CANVAS_SIZE, LAYOUT, type BatInstance, type HalloweenPumpkinLayout } from './layout';

export interface CompositionOptions {
  /** Prefix for all ids so several copies can live on one page. */
  idPrefix?: string;
  layout?: HalloweenPumpkinLayout;
}

export function buildHalloweenPumpkinSvg(
  sources: AssetSources,
  { idPrefix = 'hp-', layout = LAYOUT }: CompositionOptions = {},
): string {
  const parsed = {} as Record<AssetKey, ParsedSvg>;
  for (const key of Object.keys(sources) as AssetKey[]) {
    // each asset gets its own namespace inside this instance
    const p = parseSvg(sources[key]);
    const ns = `${idPrefix}${key}-`;
    parsed[key] = { ...p, defs: prefixIds(p.defs, ns), body: prefixIds(p.body, ns) };
  }

  const defs: string[] = Object.values(parsed).map((p) => p.defs).filter(Boolean);

  // Bat parts are defined once and reused by both bats via <use>.
  const batPartId = (k: AssetKey) => `${idPrefix}${k}-shape`;
  for (const k of ['batHead', 'leftWing', 'rightWing'] as const) {
    defs.push(`<g id="${batPartId(k)}" fill="none">${parsed[k].body}</g>`);
  }

  const layer = (name: string, part: string, placement: Placement, content: string) =>
    // fill="none" mirrors the original files' root: outline-only paths must stay unfilled
    `<g data-layer="${name}" transform="${placementTransform(placement)}" fill="none">` +
    `<g data-part="${part}">${content}</g></g>`;

  // tail is stored in absolute coordinates; nest it relative to the cap
  const cap = layout.miniPumpkin;
  const tailRelative: Placement = {
    ...layout.tail,
    x: layout.tail.x - cap.x,
    y: layout.tail.y - cap.y,
  };
  if (cap.rotate || (cap.scale ?? 1) !== 1) {
    throw new Error('miniPumpkin placement must be translate-only (tail is nested inside it)');
  }
  const tailMarkup = layer('tail', 'tail', tailRelative, parsed.tail.body);

  const bat = (index: number, instance: BatInstance) => {
    const a = layout.bat;
    const use = (name: string, k: AssetKey, p: Placement) =>
      layer(name, `bat-${index}-${name}`, p, `<use href="#${batPartId(k)}"/>`);
    // wings first: the body overlaps the wing roots
    return layer(
      `bat-${index}`,
      `bat-${index}`,
      instance,
      use('left_wing', 'leftWing', a.leftWing) +
        use('right_wing', 'rightWing', a.rightWing) +
        use('bat_head', 'batHead', a.head),
    );
  };

  // pumpkin: static back stem + breathing body (eyes tagged for morphing).
  // Both halves keep the file's own full-canvas clip group.
  const pumpkinGroup = unwrapGroup(parsed.pumpkin.body);
  const isStem = (el: string) => STEM_GRADIENTS.some((g) => paintOf(el)?.endsWith(g));
  const tagEye = (el: string) => {
    const paint = paintOf(el);
    const eye = Object.entries(EYE_GRADIENTS).find(([, g]) => paint?.endsWith(g));
    return eye ? withAttr(el, 'data-part', eye[0]) : el;
  };
  const stemEls = pumpkinGroup.children.filter(isStem);
  const bodyEls = pumpkinGroup.children.filter((el) => !isStem(el)).map(tagEye);
  if (stemEls.length !== STEM_GRADIENTS.length) throw new Error('pumpkin: back stem paths not found');
  const pumpkinMarkup =
    `<g data-part="pumpkin-stem">${pumpkinGroup.open}${stemEls.join('')}</g></g>` +
    `<g data-part="pumpkin">${pumpkinGroup.open}${bodyEls.join('')}</g></g>`;

  // plant: its three paths (fill, highlight, outline) are bent individually
  const plantEls = topLevelElements(parsed.plant.body);
  if (plantEls.length !== PLANT_PARTS.length) throw new Error('plant: unexpected structure');
  const plantMarkup = plantEls.map((el, i) => withAttr(el, 'data-part', PLANT_PARTS[i])).join('');

  const body = [
    layer('leaf_2', 'leaf_2', layout.leaf2, parsed.leaf2.body),
    layer('leaf_1', 'leaf_1', layout.leaf1, parsed.leaf1.body),
    `<g data-layer="pumpkin" transform="${placementTransform(layout.pumpkin)}" fill="none">${pumpkinMarkup}</g>`,
    layer('plant', 'plant', layout.plant, plantMarkup),
    layer('mini pumpkin', 'miniPumpkin', layout.miniPumpkin, parsed.miniPumpkin.body + tailMarkup),
    bat(1, layout.bats[0]),
    bat(2, layout.bats[1]),
  ].join('\n');

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" ` +
    `fill="none" overflow="visible" data-decoration="halloween-pumpkin">` +
    `<defs>${defs.join('\n')}</defs>\n${body}</svg>`
  );
}
