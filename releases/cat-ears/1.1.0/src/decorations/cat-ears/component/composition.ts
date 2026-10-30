/**
 * Builds the Cat Ears SVG from the original vector (draft 1.1.0).
 *
 * The ear is the original ear.svg, element by element, drawn twice: as is for
 * the right ear and mirrored around x = 256 for the left ear.
 *
 *   <g data-layer="ear-left" transform="mirror"><g transform="place">  ear elements (left)  </g></g>
 *   <g data-layer="ear-right"><g transform="place">                    ear elements (right) </g></g>
 *
 * Each frame every point of every element of an ear — outline, light fill,
 * pink inner part, fur, gradients — is bent by the SAME bend (bendPoint): the
 * base stays put, the upper part and the tip turn around the middle of the
 * base, the more the higher — the gentle sway of the whole ear (middle and
 * upper part) plus the livelier bend of the tip. So the pink inner part moves together with the
 * outline and the ear keeps its drawn shape. In the mirrored copy a positive
 * bend also moves the tip outwards, so both ears use "positive = outwards".
 * No avatar, placeholder or background is drawn: the SVG is transparent.
 */
import { parseSvg, prefixIds, topLevelElements } from '../../../shared/svg';
import type { AssetSources } from '../assets';
import { ASSET_SOURCES } from '../assets';
import { CANVAS_SIZE, EAR_PIVOT, EAR_TIP, RIGHT_EAR } from './layout';
import { leftEarAngle, MOTION, rightEarAngle, swayAngle } from './motion';

export interface CompositionOptions {
  /** Prefix for all ids so several copies can live on one page. */
  idPrefix?: string;
  /** Loop progress 0…1 to draw. */
  progress?: number;
}

/** Every changing attribute of the drawing at one moment: part name → attribute → value. */
export type Frame = Record<string, Record<string, string>>;

type Pt = readonly [number, number];
const r3 = (n: number) => Math.round(n * 1000) / 1000;
const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;

const EAR = parseSvg(ASSET_SOURCES.ear);
const ELEMENTS = topLevelElements(EAR.body);
/** path data of each element as a template (numbers replaced) and its points */
const PATHS = ELEMENTS.map((e) => {
  const d = e.match(/\sd="([^"]+)"/)?.[1] ?? '';
  return { template: d.replace(NUM, '#'), numbers: (d.match(NUM) ?? []).map(Number) };
});
const GRADIENTS = [...EAR.defs.matchAll(/<linearGradient\b[^>]*\sid="([^"]+)"[^>]*>/g)].map((m) => {
  const a = (n: string) => Number(m[0].match(new RegExp(`\\s${n}="([^"]+)"`))![1]);
  return { id: m[1], from: [a('x1'), a('y1')] as Pt, to: [a('x2'), a('y2')] as Pt };
});

const AXIS: Pt = [EAR_TIP[0] - EAR_PIVOT[0], EAR_TIP[1] - EAR_PIVOT[1]];
const AXIS_LEN2 = AXIS[0] * AXIS[0] + AXIS[1] * AXIS[1];

/** How much of the tip's bend a point gets: 0 on the base, growing towards the tip. */
export function bendShare(p: Pt): number {
  const h = ((p[0] - EAR_PIVOT[0]) * AXIS[0] + (p[1] - EAR_PIVOT[1]) * AXIS[1]) / AXIS_LEN2;
  const { from, to, power } = MOTION.bend;
  const k = Math.min(1, Math.max(0, (h - from) / (to - from)));
  return k ** power;
}

/** How much of the whole-ear sway a point gets: 0 on the base, partly in the middle, fully in the upper part. */
export function swayShare(p: Pt): number {
  const h = ((p[0] - EAR_PIVOT[0]) * AXIS[0] + (p[1] - EAR_PIVOT[1]) * AXIS[1]) / AXIS_LEN2;
  const { from, to } = MOTION.sway;
  const k = Math.min(1, Math.max(0, (h - from) / (to - from)));
  return k * k * (3 - 2 * k);
}

/**
 * A point of ear.svg bent by `degrees` at the tip and swayed by `sway` (both turned around the
 * middle of the base; the base itself never moves).
 */
export function bendPoint(p: Pt, degrees: number, sway = 0): Pt {
  const a = ((degrees * bendShare(p) + sway * swayShare(p)) * Math.PI) / 180;
  if (a === 0) return p;
  const [x, y] = [p[0] - EAR_PIVOT[0], p[1] - EAR_PIVOT[1]];
  return [EAR_PIVOT[0] + x * Math.cos(a) - y * Math.sin(a), EAR_PIVOT[1] + x * Math.sin(a) + y * Math.cos(a)];
}

export const EAR_SIDES = ['left', 'right'] as const;
export type EarSide = (typeof EAR_SIDES)[number];

/** Tip bend of both ears at loop progress 0…1, degrees (positive = outwards). */
export function earBends(progress = 0): Record<EarSide, number> {
  return { left: leftEarAngle(progress), right: rightEarAngle(progress) };
}

/** Sway of both whole ears at loop progress 0…1, degrees (positive = outwards). */
export function earSways(progress = 0): Record<EarSide, number> {
  return { left: swayAngle(progress, 'left'), right: swayAngle(progress, 'right') };
}

/** All changing attributes (path points and gradient ends of both ears) at loop progress 0…1. */
export function earFrame(progress = 0): Frame {
  const frame: Frame = {};
  const bends = earBends(progress);
  const sways = earSways(progress);
  for (const side of EAR_SIDES) {
    const deg = bends[side];
    const sway = sways[side];
    PATHS.forEach((path, i) => {
      if (!path.numbers.length) return;
      const out: number[] = [];
      for (let k = 0; k + 1 < path.numbers.length; k += 2) out.push(...bendPoint([path.numbers[k], path.numbers[k + 1]], deg, sway));
      let j = 0;
      frame[`${side}-e${i}`] = { d: path.template.replace(/#/g, () => String(r3(out[j++]))) };
    });
    GRADIENTS.forEach((g, k) => {
      const [x1, y1] = bendPoint(g.from, deg, sway);
      const [x2, y2] = bendPoint(g.to, deg, sway);
      frame[`${side}-g${k}`] = { x1: String(r3(x1)), y1: String(r3(y1)), x2: String(r3(x2)), y2: String(r3(y2)) };
    });
  }
  return frame;
}

export function buildCatEarsSvg(sources: AssetSources, { idPrefix = 'ce-', progress = 0 }: CompositionOptions = {}): string {
  const f = earFrame(progress);
  const attrs = (part: string) =>
    `data-part="${part}" ` +
    Object.entries(f[part])
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
  const ear = parseSvg(sources.ear);
  const elements = topLevelElements(ear.body);
  const defs: string[] = [];
  const place = `translate(${RIGHT_EAR.x} ${RIGHT_EAR.y}) scale(${RIGHT_EAR.scale})`;
  const one = (side: EarSide) => {
    const ns = `${idPrefix}${side}-`;
    // gradients of this ear: the file's own, their ends following the bend
    let d = prefixIds(ear.defs, ns);
    GRADIENTS.forEach((g, k) => {
      d = d.replace(new RegExp(`<linearGradient\\b[^>]*\\sid="${ns}${g.id}"[^>]*>`), (tag) =>
        tag.replace(/\s(x1|y1|x2|y2)="[^"]*"/g, '').replace(/^<linearGradient\b/, `<linearGradient ${attrs(`${side}-g${k}`)}`),
      );
    });
    defs.push(d);
    // fill="none" mirrors the original file's root
    const body = elements
      .map((e, i) => (f[`${side}-e${i}`] ? prefixIds(e, ns).replace(/\sd="[^"]*"/, '').replace(/^<path\b/, `<path ${attrs(`${side}-e${i}`)}`) : prefixIds(e, ns)))
      .join('');
    return `<g transform="${place}" fill="none">${body}</g>`;
  };
  const left = one('left');
  const right = one('right');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" ` +
    `fill="none" overflow="visible" data-decoration="cat-ears">` +
    `<defs>${defs.join('')}</defs>` +
    `<g data-layer="ear-left" transform="translate(${CANVAS_SIZE} 0) scale(-1 1)">${left}</g>` +
    `<g data-layer="ear-right">${right}</g>` +
    `</svg>`
  );
}
