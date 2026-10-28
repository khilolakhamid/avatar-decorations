/**
 * Builds the Ghost Orbit SVG from the original vectors.
 *
 * One ghost = `ghost` (body) + `face` placed in the body's frame. The body
 * and the three face parts are defined ONCE in <defs> and reused by all
 * five ghosts; each ghost only has its own transforms.
 *
 *   <g data-layer="ghosts">
 *     <g data-part="ghost-0" transform="orbit pose">          ← position on the orbit
 *       <g data-part="body-0" transform="sway + breathing">
 *         <g data-part="shape-0" transform="tail swish + stretch"><use body/></g>
 *         <g transform="face in ghost">
 *           <g data-part="face-0" transform="look: slide, narrow, tilt">
 *             <g data-part="mouth-0" transform="slide + А-а-а"><use mouth/></g>
 *             <g data-part="eye-left-0">…  <g data-part="eye-right-0">…
 *
 * No avatar, placeholder or background is drawn: the SVG is transparent.
 */
import { parseSvg, placementTransform, prefixIds, topLevelElements, unwrapGroup } from '../../../shared/svg';
import type { AssetSources } from '../assets';
import { ANCHORS, CANVAS_SIZE, FACE_IN_GHOST, ORBIT } from './layout';
import { ghostMotion, MOTION, PIVOTS, type GhostMotion } from './motion';
import { ghostPose } from './orbit';

export interface CompositionOptions {
  /** Prefix for all ids so several copies can live on one page. */
  idPrefix?: string;
  /** Loop progress 0…1 to draw. */
  phase?: number;
}

/** Animated parts of one ghost, in drawing order of the markup. */
export const GHOST_PARTS = ['ghost', 'body', 'shape', 'face', 'mouth', 'eye-left', 'eye-right'] as const;
export type GhostPart = (typeof GHOST_PARTS)[number];

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const about = ([px, py]: readonly number[], inner: string) =>
  `translate(${r3(px)} ${r3(py)}) ${inner} translate(${r3(-px)} ${r3(-py)})`;

/** All transforms of ghost `index` at loop progress `phase`. */
export function ghostTransforms(index: number, phase = 0): Record<GhostPart, string> {
  const pose = ghostPose(index, phase);
  const [ax, ay] = ANCHORS.ghost;
  return {
    ghost: `${placementTransform({ x: pose.x, y: pose.y, rotate: pose.rotate, scale: pose.scale })} translate(${-ax} ${-ay})`,
    ...ghostLocalTransforms(ghostMotion(pose.theta)),
  };
}

/** Transforms inside one ghost (body, face, mouth, eyes) for a given motion state. */
export function ghostLocalTransforms(m: GhostMotion): Omit<Record<GhostPart, string>, 'ghost'> {
  const L = m.look;
  const M = m.mouth;
  const k = MOTION.look;
  const a = Math.abs(L);
  // looking left: the left eye turns away (far eye, narrows more); right: the other way round
  const leftNarrow = 1 - a * (L < 0 ? k.farEye : k.nearEye);
  const rightNarrow = 1 - a * (L > 0 ? k.farEye : k.nearEye);
  const eyeY = 1 + MOTION.mouth.eyes * M;
  return {
    body:
      about(PIVOTS.lean, `rotate(${r3(L * k.lean)})`) +
      ' ' +
      about(PIVOTS.body, `rotate(${r3(m.sway)}) scale(${r3(m.breathX)} ${r3(m.breathY)})`),
    shape: about(
      PIVOTS.head,
      `skewX(${r3(m.swish)}) scale(${r3(1 + MOTION.shape.stretchX * m.breath)} ${r3(1 + MOTION.shape.stretchY * m.breath)})`,
    ),
    face: about(PIVOTS.face, `translate(${r3(L * k.shift)} 0) rotate(${r3(L * k.tilt)}) scale(${r3(1 - k.squash * a)} 1)`),
    mouth: about(
      PIVOTS.mouth,
      `translate(${r3(L * k.mouthShift)} 0) scale(${r3(1 + MOTION.mouth.x * M)} ${r3(1 + MOTION.mouth.y * M)})`,
    ),
    'eye-left': about(PIVOTS.eyeLeft, `translate(${r3(L * k.eyeShift)} 0) scale(${r3(leftNarrow)} ${r3(eyeY)})`),
    'eye-right': about(PIVOTS.eyeRight, `translate(${r3(L * k.eyeShift)} 0) scale(${r3(rightNarrow)} ${r3(eyeY)})`),
  };
}

export function buildGhostOrbitSvg(
  sources: AssetSources,
  { idPrefix = 'go-', phase = 0 }: CompositionOptions = {},
): string {
  const defs: string[] = [];

  // body: the whole original ghost.svg (fill="none" mirrors the file's root)
  const body = parseSvg(sources.ghost);
  if (body.defs) defs.push(prefixIds(body.defs, `${idPrefix}ghost-`));
  defs.push(`<g id="${idPrefix}ghost" fill="none">${prefixIds(body.body, `${idPrefix}ghost-`)}</g>`);

  // face: its three original paths (mouth, left eye, right eye), each reusable
  // on its own so it can move. The file's only wrapper is a clip to its own
  // canvas, which hides nothing at rest and would cut the open mouth.
  const face = parseSvg(sources.face);
  const [mouthPath, eyeLeftPath, eyeRightPath] = topLevelElements(unwrapGroup(face.body.trim()).children.join(''));
  const facePart = { mouth: mouthPath, 'eye-left': eyeLeftPath, 'eye-right': eyeRightPath } as const;
  for (const [k, el] of Object.entries(facePart)) defs.push(`<g id="${idPrefix}face-${k}">${el}</g>`);

  const ghosts: string[] = [];
  for (let i = 0; i < ORBIT.count; i++) {
    const t = ghostTransforms(i, phase);
    const part = (k: 'mouth' | 'eye-left' | 'eye-right') =>
      `<g data-part="${k}-${i}" transform="${t[k]}"><use href="#${idPrefix}face-${k}"/></g>`;
    ghosts.push(
      `<g data-part="ghost-${i}" transform="${t.ghost}">` +
        `<g data-part="body-${i}" transform="${t.body}">` +
        `<g data-part="shape-${i}" transform="${t.shape}"><use href="#${idPrefix}ghost"/></g>` +
        `<g transform="translate(${r3(FACE_IN_GHOST.x)} ${r3(FACE_IN_GHOST.y)})">` +
        `<g data-part="face-${i}" transform="${t.face}">${part('mouth')}${part('eye-left')}${part('eye-right')}</g>` +
        `</g></g></g>`,
    );
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" ` +
    `fill="none" overflow="visible" data-decoration="ghost-orbit">` +
    `<defs>${defs.join('')}</defs>` +
    `<g data-layer="ghosts">${ghosts.join('')}</g>` +
    `</svg>`
  );
}
