/**
 * Builds the Paper Plane Orbit SVG: ONE plane, from the owner's drawings 1, 2 and 3.
 *
 *   <g data-layer="plane">
 *     <g data-part="plane" transform="position · turn · size" opacity="…">
 *       <g data-part="orig-0">  drawing 1, the original file as it is
 *       <g data-part="orig-1">  drawing 2, the original file as it is
 *       <g data-part="orig-2">  drawing 3, the original file as it is
 *       <g data-part="first">   the turn 1 ↔ 2: the files' own elements, point by point (firstTurn.ts)
 *       <g data-part="morph">   the turn 2 ↔ 3: corners from the two files (planeModel.ts)
 *
 * While the plane holds a view only that original drawing is visible; during
 * a turn only the turning shape. The 1 ↔ 2 turn starts and ends exactly as
 * the original drawings, so it simply takes their place; for the 2 ↔ 3 turn,
 * in its first and last few frames the turning shape fades in / out on top
 * of the original, where the two coincide — so there is always ONE plane on screen and never two
 * different drawings overlapping. Drawing 3 → drawing 1 (the start of the next
 * loop) happens while the plane is invisible. The same frame function gives
 * every attribute for the static markup and for the live animation. No
 * avatar, placeholder or background is drawn.
 */
import { parseSvg, prefixIds, topLevelElements, unwrapGroup } from '../../../shared/svg';
import type { AssetSources } from '../assets';
import { FIRST, FIRST_CENTRE, FIRST_TURN_HIGHLIGHTS, FIRST_TURN_POINTS, firstTurnHighlightMap, firstTurnPoint, keelArea, SECOND, turnPoint } from './firstTurn';
import { CANVAS_SIZE } from './layout';
import { planeState, type PlaneState } from './motion';
import {
  lerpColour,
  lerpPt,
  triangleMap,
  VIEWS,
  viewCentre,
  type CornerName,
  type Pt,
  type ViewIndex,
  type ViewModel,
} from './planeModel';

export interface CompositionOptions {
  /** Prefix for all ids so several copies can live on one page. */
  idPrefix?: string;
  /** Loop progress 0…1 to draw. */
  progress?: number;
}

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const ease01 = (x: number) => {
  const k = Math.min(1, Math.max(0, x));
  return k * k * (3 - 2 * k);
};
const pts = (list: Pt[]) => list.map(([x, y]) => `${r3(x)},${r3(y)}`).join(' ');

/** The three original files, in view order. */
const FILES = ['paper_plane_1', 'paper_plane_2', 'paper_plane_3'] as const;
/** Centre of each original drawing (the plane turns around it). */
const CENTRES: readonly Pt[] = [FIRST_CENTRE, viewCentre(VIEWS[0]), viewCentre(VIEWS[1])];

type GradKey = 'face' | 'outlineA' | 'outlineB' | 'keelA' | 'keelB';
const GRADIENTS: Record<GradKey, keyof ViewModel> = {
  face: 'faceGradient',
  outlineA: 'outlineAGradient',
  outlineB: 'outlineBGradient',
  keelA: 'keelAGradient',
  keelB: 'keelBGradient',
};

/** Every changing attribute of the drawing at one moment: part name → attribute → value. */
export type Frame = Record<string, Record<string, string>>;

/** Highlight slots of the 2 ↔ 3 turn: one per (view, highlight) of drawings 2 and 3. */
export const HIGHLIGHT_SLOTS = VIEWS.flatMap((v, k) => v.highlights.map((h, hi) => ({ view: (k + 1) as ViewIndex, hi, wing: h.wing })));

/** Straight-line elements of the 1 ↔ 2 turn (index in the files). */
const FIRST_LINES = Object.keys(FIRST_TURN_POINTS).map(Number);

/** The dark keel and the dark keel line (index in the files): kept on the tail side of the lower wing during the turn. */
const KEEL_ELEMENTS = [1, 3];
const KEEL_LINE = 3;

/** How long (share of a turn) the turning shape takes to appear over / disappear into the original. */
const SWITCH = 0.1;

export function planeFrame(progress = 0): Frame {
  return planeFrameFromState(planeState(progress));
}

/** Attributes of the 2 ↔ 3 turn shape: from view a to view b (1 or 2) at t. */
function cornerTurn(frame: Frame, a: 1 | 2, b: 1 | 2, t: number): void {
  const A = VIEWS[a - 1];
  const B = VIEWS[b - 1];
  const cA = viewCentre(A);
  const cB = viewCentre(B);
  const local = (c: Pt, p: Pt): Pt => [p[0] - c[0], p[1] - c[1]];
  const C = {} as Record<CornerName, Pt>;
  for (const k of Object.keys(A.corners) as CornerName[]) C[k] = lerpPt(local(cA, A.corners[k]), local(cB, B.corners[k]), t);
  const width = String(r3(A.outlineWidth + (B.outlineWidth - A.outlineWidth) * t));
  Object.assign(frame, {
    'wing-a': { points: pts([C.AT, C.N, C.AI]) },
    'wing-b': { points: pts([C.BT, C.N, C.BI]) },
    keel: { points: pts([C.K, C.J2, C.J1]) },
    fold: { points: pts([C.J2, C.N, C.AI, C.K]) },
    'keel-line': { points: pts([C.K, C.KS]), 'stroke-width': width, stroke: lerpColour(A.keelLineColour, B.keelLineColour, t) },
    'keel-a': { points: pts([C.AI, C.K]), 'stroke-width': width },
    'keel-b': { points: pts([C.J3, C.K]), 'stroke-width': width },
    'outline-a': { points: pts([C.AT, C.N, C.AI]), 'stroke-width': width },
    'outline-b': { points: pts([C.BT, C.N, C.BI]), 'stroke-width': width },
  });
  for (const g of Object.keys(GRADIENTS) as GradKey[]) {
    const ga = A[GRADIENTS[g]] as ViewModel['faceGradient'];
    const gb = B[GRADIENTS[g]] as ViewModel['faceGradient'];
    const from = lerpPt(local(cA, ga.from), local(cB, gb.from), t);
    const to = lerpPt(local(cA, ga.to), local(cB, gb.to), t);
    frame[`grad-${g}`] = { x1: String(r3(from[0])), y1: String(r3(from[1])), x2: String(r3(to[0])), y2: String(r3(to[1])) };
    frame[`grad-${g}-0`] = { 'stop-color': lerpColour(ga.stops[0], gb.stops[0], t) };
    frame[`grad-${g}-1`] = { 'stop-color': lerpColour(ga.stops[1], gb.stops[1], t) };
  }
  // highlights: each drawing's highlights ride on their wing; weight = how much of that drawing is showing
  const weight = (vi: ViewIndex) => (a === vi ? 1 - t : 0) + (b === vi ? t : 0);
  for (const slot of HIGHLIGHT_SLOTS) {
    const v = VIEWS[slot.view - 1];
    const [tip, inner] = slot.wing === 'A' ? (['AT', 'AI'] as const) : (['BT', 'BI'] as const);
    const m = triangleMap([v.corners[tip], v.corners.N, v.corners[inner]], [C[tip], C.N, C[inner]]);
    frame[`hl-${slot.view}-${slot.hi}`] = { transform: `matrix(${m.map(r3).join(' ')})`, opacity: String(r3(weight(slot.view))) };
  }
}

/** Attributes of the 1 ↔ 2 turn shape at t (0 = drawing 1, 1 = drawing 2). */
function firstTurn(frame: Frame, t: number): void {
  for (const i of FIRST_LINES) {
    const { first: p1, second: p2 } = FIRST_TURN_POINTS[i];
    const now = p1.map((p, k) => firstTurnPoint(p, p2[k], t, i, k));
    const d = now.map(([x, y], k) => `${k ? 'L' : 'M'}${r3(x)} ${r3(y)}`).join('') + (SECOND.elements[i].closed ? 'Z' : '');
    frame[`f-e${i}`] = { d };
  }
  // the dark keel line is hidden under the outlines in drawing 1 and shows in drawing 2:
  // it appears gradually in the second half of the turn (its square end would stick out at the tail)
  frame[`f-e${KEEL_LINE}`].opacity = String(r3(ease01((t - 0.5) / 0.45)));
  // the dark keel stays on the tail side of the lower wing's inner edge (as in both drawings)
  frame['f-clip'] = { d: keelArea(t).map(([x, y], k) => `${k ? 'L' : 'M'}${r3(x)} ${r3(y)}`).join('') + 'Z' };
  SECOND.gradients.forEach((g2, k) => {
    const g1 = FIRST.gradients[k];
    const from = turnPoint(g1.from, g2.from, t);
    const to = turnPoint(g1.to, g2.to, t);
    frame[`f-g${k}`] = { x1: String(r3(from[0])), y1: String(r3(from[1])), x2: String(r3(to[0])), y2: String(r3(to[1])) };
  });
  for (const h of FIRST_TURN_HIGHLIGHTS) {
    for (const from of [1, 2] as const) {
      const m = firstTurnHighlightMap(from, h.wing, t);
      frame[`f-hl-${from}-${h.index}`] = {
        transform: `matrix(${m.map(r3).join(' ')})`,
        opacity: String(r3(from === 1 ? 1 - t : t)),
      };
    }
  }
}

/** All attributes for a given plane state (used by planeFrame; also handy to show one view alone). */
export function planeFrameFromState(s: PlaneState): Frame {
  const t = s.blend;
  const turning = s.viewA !== s.viewB && t > 0 && t < 1;
  const held: ViewIndex = t >= 1 ? s.viewB : s.viewA;
  const lo = Math.min(s.viewA, s.viewB);
  const hi = Math.max(s.viewA, s.viewB);
  const adjacent = turning && hi - lo === 1;
  // Turn 1 ↔ 2 is built from the files' own elements, so at its ends it IS the original drawing:
  // it simply takes the original's place, nothing overlaps. Turn 2 ↔ 3 (corner model) fades in over
  // the original at the start and out into the next one at the end, where the two coincide.
  const exactTurn = adjacent && lo === 0;
  const turnOpacity = exactTurn ? 1 : adjacent ? Math.min(ease01(t / SWITCH), ease01((1 - t) / SWITCH)) : 0;
  const showOriginal = (vi: ViewIndex): string => {
    if (!turning) return held === vi ? '1' : '0';
    if (!adjacent) return vi === (t < 0.5 ? s.viewA : s.viewB) ? '1' : '0'; // 3 → 1, while invisible
    if (exactTurn) return '0';
    if (vi === s.viewA && t < SWITCH) return '1';
    if (vi === s.viewB && t > 1 - SWITCH) return '1';
    return '0';
  };
  const firstActive = exactTurn;
  const morphActive = adjacent && lo === 1;

  const frame: Frame = {
    plane: {
      transform: `translate(${r3(s.x)} ${r3(s.y)}) rotate(${r3(s.rotate)}) scale(${r3(s.scale)})`,
      opacity: String(r3(s.opacity)),
    },
    'orig-0': { opacity: showOriginal(0) },
    'orig-1': { opacity: showOriginal(1) },
    'orig-2': { opacity: showOriginal(2) },
    first: { opacity: String(r3(firstActive ? turnOpacity : 0)) },
    morph: { opacity: String(r3(morphActive ? turnOpacity : 0)) },
  };
  // shape of each turn: the real one while it runs, otherwise parked (invisible) at drawing 2
  firstTurn(frame, firstActive ? (s.viewA === 0 ? t : 1 - t) : 1);
  if (morphActive) cornerTurn(frame, s.viewA as 1 | 2, s.viewB as 1 | 2, t);
  else cornerTurn(frame, 1, 1, 0);
  return frame;
}

/** Highlight element of drawing 2 or 3, exactly as in the original file (ids prefixed). */
function highlightMarkup(sources: AssetSources, v: ViewModel, hi: number, ns: string): string {
  const h = v.highlights[hi];
  if (h.line) {
    const { from, to, width, colour, opacity } = h.line;
    return `<path d="M${from[0]} ${from[1]}L${to[0]} ${to[1]}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" stroke="${colour}" stroke-opacity="${opacity}"/>`;
  }
  const body = parseSvg(sources[v.file]).body.trim();
  const children = topLevelElements(unwrapGroup(body).children.join(''));
  return prefixIds(children[h.index!], ns);
}

export function buildPaperPlaneOrbitSvg(
  sources: AssetSources,
  { idPrefix = 'pp-', progress = 0, state }: CompositionOptions & { state?: PlaneState } = {},
): string {
  const f = state ? planeFrameFromState(state) : planeFrame(progress);
  const attrs = (part: string) =>
    `data-part="${part}" ` +
    Object.entries(f[part])
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
  const ns = (vi: number) => `${idPrefix}v${vi}-`;
  const defs: string[] = [];
  const originals: string[] = [];
  FILES.forEach((file, vi) => {
    const parsed = parseSvg(sources[file]);
    defs.push(prefixIds(parsed.defs, ns(vi)));
    // the original drawing as it is, centred (fill="none" mirrors the file's root)
    const [cx, cy] = CENTRES[vi];
    originals.push(
      `<g ${attrs(`orig-${vi}`)}><g transform="translate(${r3(-cx)} ${r3(-cy)})" fill="none">${prefixIds(parsed.body, ns(vi))}</g></g>`,
    );
  });

  // ── turn 1 ↔ 2: drawing 2's own elements, in its own order, with moving points and gradients
  SECOND.gradients.forEach((g, k) => {
    const stops = g.stops
      .map((st) => `<stop offset="${st.offset}" stop-color="${st.colour}"${st.opacity === null ? '' : ` stop-opacity="${st.opacity}"`}/>`)
      .join('');
    defs.push(`<linearGradient id="${idPrefix}f-g${k}" gradientUnits="userSpaceOnUse" ${attrs(`f-g${k}`)}>${stops}</linearGradient>`);
  });
  const gradientRef = (markup: string) =>
    SECOND.gradients.reduce((m, g, k) => m.split(`url(#${g.id})`).join(`url(#${idPrefix}f-g${k})`), markup);
  defs.push(`<clipPath id="${idPrefix}f-clip"><path ${attrs('f-clip')}/></clipPath>`);
  const firstParts = SECOND.elements
    .map((e, i) => {
      const hl = FIRST_TURN_HIGHLIGHTS.find((h) => h.index === i);
      if (hl) {
        // each file's own soft highlight, riding on its wing; drawing 1's under drawing 2's
        return (
          `<g ${attrs(`f-hl-1-${i}`)}>${prefixIds(FIRST.elements[i].markup, ns(0))}</g>` +
          `<g ${attrs(`f-hl-2-${i}`)}>${prefixIds(e.markup, ns(1))}</g>`
        );
      }
      const clip = KEEL_ELEMENTS.includes(i) ? ` clip-path="url(#${idPrefix}f-clip)"` : '';
      return gradientRef(e.markup.replace(/\sd="[^"]*"/, '')).replace(/^<path\b/, `<path ${attrs(`f-e${i}`)}${clip}`);
    })
    .join('');

  // ── turn 2 ↔ 3
  for (const g of Object.keys(GRADIENTS) as GradKey[]) {
    defs.push(
      `<linearGradient id="${idPrefix}${g}" gradientUnits="userSpaceOnUse" ${attrs(`grad-${g}`)}>` +
        `<stop ${attrs(`grad-${g}-0`)}/><stop offset="1" ${attrs(`grad-${g}-1`)}/></linearGradient>`,
    );
  }
  const url = (g: GradKey) => `url(#${idPrefix}${g})`;
  const highlights = HIGHLIGHT_SLOTS.map(
    (slot) => `<g ${attrs(`hl-${slot.view}-${slot.hi}`)}>${highlightMarkup(sources, VIEWS[slot.view - 1], slot.hi, ns(slot.view))}</g>`,
  ).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" ` +
    `fill="none" overflow="visible" data-decoration="paper-plane-orbit">` +
    `<defs>${defs.join('')}</defs>` +
    `<g data-layer="plane"><g ${attrs('plane')}>` +
    originals.join('') +
    `<g ${attrs('first')}>${firstParts}</g>` +
    // the 2 ↔ 3 turning shape, in the files' own drawing order
    `<g ${attrs('morph')}>` +
    `<polygon ${attrs('wing-a')} fill="${url('face')}"/>` +
    `<polygon ${attrs('wing-b')} fill="${url('face')}"/>` +
    `<polygon ${attrs('keel')} fill="#838F9D"/>` +
    `<polygon ${attrs('fold')} fill="#CDD4DE"/>` +
    `<polyline ${attrs('keel-line')} stroke-linejoin="round"/>` +
    `<polyline ${attrs('keel-a')} stroke="${url('keelA')}" stroke-linejoin="round"/>` +
    `<polyline ${attrs('keel-b')} stroke="${url('keelB')}" stroke-linecap="round" stroke-linejoin="round"/>` +
    `<polygon ${attrs('outline-a')} stroke="${url('outlineA')}" stroke-linejoin="round"/>` +
    `<polygon ${attrs('outline-b')} stroke="${url('outlineB')}" stroke-linejoin="round"/>` +
    highlights +
    `</g></g></g></svg>`
  );
}
