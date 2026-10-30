/**
 * Paper Plane Orbit — the turn between drawing 1 and drawing 2.
 *
 * The owner redrew drawing 1 from drawing 2, so both files have the SAME
 * structure: the same 13 elements in the same order (wing faces, keel, grey
 * fold, keel lines, outlines, highlight lines, highlight shapes, white mark),
 * the same colours and the same 7 gradients. The test checks this
 * element by element.
 *
 * So the turn is made element by element, straight from the two files:
 *   • every straight-line element (all except the two soft highlight shapes)
 *     has the same number of points in both files — each point moves from its
 *     place in drawing 1 to its place in drawing 2;
 *   • the gradients' end points move the same way;
 *   • the two soft highlight shapes (curves with different commands in the
 *     two files) are NOT bent into each other: each file's own shape rides on
 *     its wing and they cross-fade.
 * Nothing is redrawn: the grey fold is always the files' own fold element,
 * drawn in the files' own order (face, keel, fold, lines, outlines), so no
 * extra triangles appear.
 *
 * The two drawings are turned by ~65° to each other, so the points don't move
 * in straight lines (that would squeeze the plane in the middle of the turn):
 * the turn part is taken out first (best-fit rotation of drawing 1 onto
 * drawing 2), the shape changes in straight lines, and the rotation is added
 * back gradually.
 */
import { ASSET_SOURCES } from '../assets';
import { parseSvg, topLevelElements, unwrapGroup } from '../../../shared/svg';
import { lerpPt, triangleMap, viewCentre, VIEWS, type Pt } from './planeModel';

export interface FileElement {
  /** the element as it is in the file */
  markup: string;
  /** points of a straight-line path (M/L/Z only), or null for a curve */
  points: Pt[] | null;
  /** whether the path is closed (ends with Z) */
  closed: boolean;
}

export interface FileGradient {
  id: string;
  from: Pt;
  to: Pt;
  stops: { offset: string; colour: string; opacity: string | null }[];
}

const num = /-?\d*\.?\d+(?:e-?\d+)?/gi;

function parsePoints(d: string): { points: Pt[]; closed: boolean } | null {
  if (/[^MLZml\d\s.,eE-]/.test(d)) return null; // curves → not a straight-line path
  const closed = /Z\s*$/i.test(d);
  const nums = (d.match(num) ?? []).map(Number);
  const points: Pt[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) points.push([nums[i], nums[i + 1]]);
  return { points, closed };
}

export function fileElements(source: string): FileElement[] {
  const { body } = parseSvg(source);
  return topLevelElements(unwrapGroup(body.trim()).children.join('')).map((markup) => {
    const d = markup.match(/\sd="([^"]+)"/)?.[1] ?? '';
    const parsed = parsePoints(d);
    return { markup, points: parsed?.points ?? null, closed: parsed?.closed ?? false };
  });
}

export function fileGradients(source: string): FileGradient[] {
  const { defs } = parseSvg(source);
  return [...defs.matchAll(/<linearGradient\b([^>]*)>([\s\S]*?)<\/linearGradient>/g)].map((m) => {
    const a = (n: string) => Number(m[1].match(new RegExp(`\\s${n}="([^"]+)"`))![1]);
    const stops = [...m[2].matchAll(/<stop\b([^>]*)\/?>/g)].map((s) => ({
      offset: s[1].match(/offset="([^"]+)"/)?.[1] ?? '0',
      colour: s[1].match(/stop-color="([^"]+)"/)?.[1] ?? 'black',
      opacity: s[1].match(/stop-opacity="([^"]+)"/)?.[1] ?? null,
    }));
    return { id: m[1].match(/\sid="([^"]+)"/)![1], from: [a('x1'), a('y1')], to: [a('x2'), a('y2')], stops };
  });
}

export const FIRST = { elements: fileElements(ASSET_SOURCES.paper_plane_1), gradients: fileGradients(ASSET_SOURCES.paper_plane_1) };
export const SECOND = { elements: fileElements(ASSET_SOURCES.paper_plane_2), gradients: fileGradients(ASSET_SOURCES.paper_plane_2) };

/**
 * Corners of drawing 1, read from its elements in the same places as in
 * drawing 2: the wing face (element 0: nose, lower tip, …, upper inner
 * corner, upper tip) and the lower wing outline (element 7: its third point
 * is the lower inner corner).
 */
const face1 = FIRST.elements[0].points!;
export const FIRST_CORNERS = {
  N: face1[0],
  BT: face1[1],
  AI: face1[4],
  AT: face1[5],
  BI: FIRST.elements[7].points![2],
} as const;
type WingCorner = keyof typeof FIRST_CORNERS;

const SECOND_CORNERS: Record<WingCorner, Pt> = {
  N: VIEWS[0].corners.N,
  BT: VIEWS[0].corners.BT,
  AI: VIEWS[0].corners.AI,
  AT: VIEWS[0].corners.AT,
  BI: VIEWS[0].corners.BI,
};

const meanOf = (list: Pt[]): Pt => [list.reduce((s, p) => s + p[0], 0) / list.length, list.reduce((s, p) => s + p[1], 0) / list.length];
/** centre of drawing 1 (mean of the same five corners as for the other drawings) */
export const FIRST_CENTRE: Pt = meanOf(Object.values(FIRST_CORNERS));
const SECOND_CENTRE: Pt = viewCentre(VIEWS[0]);

const rot = ([x, y]: Pt, a: number): Pt => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

/** best-fit rotation (radians) of drawing 1 onto drawing 2, from the five corners */
export const FIRST_TURN_ANGLE = (() => {
  let s = 0;
  let c = 0;
  for (const k of Object.keys(FIRST_CORNERS) as WingCorner[]) {
    const [ax, ay] = [FIRST_CORNERS[k][0] - FIRST_CENTRE[0], FIRST_CORNERS[k][1] - FIRST_CENTRE[1]];
    const [bx, by] = [SECOND_CORNERS[k][0] - SECOND_CENTRE[0], SECOND_CORNERS[k][1] - SECOND_CENTRE[1]];
    s += ax * by - ay * bx;
    c += ax * bx + ay * by;
  }
  return Math.atan2(s, c);
})();

/** A point of drawing 1 (p1) and the same point of drawing 2 (p2) at turn progress t, centred. */
export function turnPoint(p1: Pt, p2: Pt, t: number): Pt {
  const a = rot([p1[0] - FIRST_CENTRE[0], p1[1] - FIRST_CENTRE[1]], FIRST_TURN_ANGLE);
  const b: Pt = [p2[0] - SECOND_CENTRE[0], p2[1] - SECOND_CENTRE[1]];
  return rot(lerpPt(a, b, t), -(1 - t) * FIRST_TURN_ANGLE);
}

/**
 * Matching points of the wing-face element (element 0) — checked against the drawings, not just by order.
 *
 * Both files list the face as: nose, lower tip, two corners at the tail, upper inner corner, upper tip.
 * But the two tail corners are not the same places: in drawing 1 they are the tail (where the keel
 * hangs) and the junction of the wings; in drawing 2 they are the keel's right corner and the tail
 * tip. Matched by order, the tail corner would slide to the keel's corner while the keel goes to the
 * tail, and the keel would stick out of the plane in the middle of the turn. So the points are
 * matched by where they are:
 *   drawing 1:  nose, lower tip, [point on the lower edge], tail, junction, upper inner, upper tip
 *   drawing 2:  nose, lower tip, keel's right corner,       tail, tail,     upper inner, upper tip
 * The added point lies on drawing 1's edge and the doubled tail point is the same point, so at both
 * ends the shape is exactly the file's.
 */
function faceMatch(): { first: Pt[]; second: Pt[] } {
  const a = FIRST.elements[0].points!;
  const b = SECOND.elements[0].points!;
  // keel's right corner of drawing 2 lies on the lower wing's inner edge: take the same share of drawing 1's edge
  const bi = VIEWS[0].corners.BI;
  const [dx, dy] = [bi[0] - b[1][0], bi[1] - b[1][1]];
  const share = ((b[2][0] - b[1][0]) * dx + (b[2][1] - b[1][1]) * dy) / (dx * dx + dy * dy);
  const onEdge: Pt = lerpPt(a[1], a[2], share);
  return {
    first: [a[0], a[1], onEdge, a[2], a[3], a[4], a[5], a[6]],
    second: [b[0], b[1], b[2], b[3], b[3], b[4], b[5], b[6]],
  };
}

/**
 * The lower keel line (element 5) is drawn in opposite directions in the two files: in drawing 1
 * from the wings' junction to the lower wing's inner corner, in drawing 2 from the lower wing's inner
 * corner to the tail. A line looks the same either way, so drawing 1's line is taken from its other
 * end: inner corner → inner corner, junction → tail (with the face and the other keel line).
 */
const REVERSED_IN_FIRST = new Set([5]);

/** Point lists used for the turn, per straight-line element: the files' own, matched by place (see above). */
export const FIRST_TURN_POINTS: Record<number, { first: Pt[]; second: Pt[] }> = Object.fromEntries(
  FIRST.elements.flatMap((e, i) => {
    const b = SECOND.elements[i];
    if (!e.points || !b.points) return [];
    if (i === 0) return [[i, faceMatch()]];
    return [[i, { first: REVERSED_IN_FIRST.has(i) ? [...e.points].reverse() : e.points, second: b.points }]];
  }),
);

/**
 * The tail. In drawing 1 the keel lines meet at the wings' junction, while the dark keel line, the
 * keel's corner and the face's tail corner sit a little lower, at the lower wing's inner corner; in
 * drawing 2 all of them meet at one point, the tail tip. Moved separately, they would form two tails
 * in the middle of the turn (a dark stub sticking out of the plane). So every point that ends at the
 * tail rides with the junction and its own small offset from it shrinks away during the first part of
 * the turn. Both ends stay exactly as in the files.
 */
const TAIL2: Pt = SECOND.elements[0].points![3];
const JUNCTION1: Pt = FIRST.elements[0].points![3];
/**
 * The same holds for the keel's right corner: in drawing 2 the dark keel line ends exactly at the
 * keel's corner (it is the keel's lower edge) and that corner lies on the lower wing's edge; in
 * drawing 1 they are elsewhere. So both ride with the face's point on the lower wing's edge, their
 * offsets shrinking away the same way — the keel stays attached to the wing, no light gaps.
 */
const KEEL_CORNER2: Pt = SECOND.elements[1].points![2];
const MERGE = 0.4;
const near = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.01;

/** Like turnPoint, but points that end at the tail (or at the keel's corner) travel together (see above). */
export function firstTurnPoint(p1: Pt, p2: Pt, t: number, element = -1, index = -1): Pt {
  if (element === 0 && index === FACE_EDGE_INDEX) return faceEdgePoint(t);
  const aligned = (p: Pt) => rot([p[0] - FIRST_CENTRE[0], p[1] - FIRST_CENTRE[1]], FIRST_TURN_ANGLE);
  const e = Math.min(1, t / MERGE);
  const keep = 1 - e * e * (3 - 2 * e);
  if (near(p2, KEEL_CORNER2)) {
    // rides with the face's point on the lower wing's edge (which ends exactly at the keel's corner)
    const base = faceEdgePoint(t);
    const a = aligned(p1);
    const j = aligned(FIRST_TURN_POINTS[0].first[FACE_EDGE_INDEX]);
    const off = rot([(a[0] - j[0]) * keep, (a[1] - j[1]) * keep], -(1 - t) * FIRST_TURN_ANGLE);
    return [base[0] + off[0], base[1] + off[1]];
  }
  if (!near(p2, TAIL2)) return turnPoint(p1, p2, t);
  const a = aligned(p1);
  const j = aligned(JUNCTION1);
  const k: Pt = [p2[0] - SECOND_CENTRE[0], p2[1] - SECOND_CENTRE[1]];
  const base = lerpPt(j, k, t);
  if (element === 0 && index === FACE_TAIL_INDEX) {
    // the face's corner at the lower wing's inner corner: it slides from that corner (moving with it)
    // to the tail, i.e. along the lower keel line, which covers it — the face never peeks out there
    const bi = aligned(FIRST_CORNERS.BI);
    const corner = lerpPt(bi, [VIEWS[0].corners.BI[0] - SECOND_CENTRE[0], VIEWS[0].corners.BI[1] - SECOND_CENTRE[1]], t);
    const p: Pt = [
      corner[0] * keep + base[0] * (1 - keep) + (a[0] - bi[0]) * keep,
      corner[1] * keep + base[1] * (1 - keep) + (a[1] - bi[1]) * keep,
    ];
    return rot(p, -(1 - t) * FIRST_TURN_ANGLE);
  }
  return rot([base[0] + (a[0] - j[0]) * keep, base[1] + (a[1] - j[1]) * keep], -(1 - t) * FIRST_TURN_ANGLE);
}

/**
 * The added point of the face (index 2 in the matched face) moves ALONG the lower wing's inner edge
 * (from the lower tip towards the inner corner), so the wing face never spills past the wing's
 * outline during the turn. In drawing 2 the keel's corner lies about one unit off that edge; this
 * small difference is added gradually so the end is exactly the file's point.
 */
const FACE_EDGE_INDEX = 2;
/** the face's tail corner of drawing 1 (index in the matched face) */
const FACE_TAIL_INDEX = 3;
const EDGE_SHARE = (() => {
  const b = SECOND.elements[0].points!;
  const bi = VIEWS[0].corners.BI;
  const [dx, dy] = [bi[0] - b[1][0], bi[1] - b[1][1]];
  return ((b[2][0] - b[1][0]) * dx + (b[2][1] - b[1][1]) * dy) / (dx * dx + dy * dy);
})();
function faceEdgePoint(t: number): Pt {
  const { first, second } = FIRST_TURN_POINTS[0];
  const tip = turnPoint(first[1], second[1], t);
  // the lower wing's inner corner: drawing 1's face corner there → drawing 2's inner corner
  const inner = turnPoint(first[3], VIEWS[0].corners.BI, t);
  const along = lerpPt(tip, inner, EDGE_SHARE);
  const end = turnPoint(first[FACE_EDGE_INDEX], second[FACE_EDGE_INDEX], 1);
  const tip1 = turnPoint(first[1], second[1], 1);
  const inner1 = turnPoint(first[3], VIEWS[0].corners.BI, 1);
  const along1 = lerpPt(tip1, inner1, EDGE_SHARE);
  return [along[0] + (end[0] - along1[0]) * t, along[1] + (end[1] - along1[1]) * t];
}

/**
 * Area the dark keel may show in during the turn: the side of the lower wing's inner edge where the
 * tail is (a big polygon bounded by that edge's line). In both drawings the keel lies on that side
 * (or under the outlines), so the ends look exactly like the files; in between the keel never
 * shows through the lower wing.
 */
export function keelArea(t: number): Pt[] {
  const { first, second } = FIRST_TURN_POINTS[0];
  const tip = turnPoint(first[1], second[1], t);
  const inner = turnPoint(first[3], VIEWS[0].corners.BI, t);
  const len = Math.hypot(inner[0] - tip[0], inner[1] - tip[1]);
  const d: Pt = [(inner[0] - tip[0]) / len, (inner[1] - tip[1]) / len];
  let n: Pt = [-d[1], d[0]];
  const tail = firstTurnPoint(first[3], second[3], t);
  if ((tail[0] - tip[0]) * n[0] + (tail[1] - tip[1]) * n[1] < 0) n = [-n[0], -n[1]];
  const F = 1000;
  return [
    [tip[0] - d[0] * F, tip[1] - d[1] * F],
    [tip[0] + d[0] * F, tip[1] + d[1] * F],
    [tip[0] + d[0] * F + n[0] * F, tip[1] + d[1] * F + n[1] * F],
    [tip[0] - d[0] * F + n[0] * F, tip[1] - d[1] * F + n[1] * F],
  ];
}

/** which wing each soft highlight shape belongs to (element index → wing), same in both files */
export const FIRST_TURN_HIGHLIGHTS: ReadonlyArray<{ index: number; wing: 'A' | 'B' }> = [
  { index: 10, wing: 'B' },
  { index: 11, wing: 'A' },
];

/** Affine map that carries a highlight of drawing `from` (file coordinates) onto the turning wing. */
export function firstTurnHighlightMap(from: 1 | 2, wing: 'A' | 'B', t: number) {
  const [tip, inner] = wing === 'A' ? (['AT', 'AI'] as const) : (['BT', 'BI'] as const);
  const src = from === 1 ? FIRST_CORNERS : SECOND_CORNERS;
  const now = (k: WingCorner) => turnPoint(FIRST_CORNERS[k], SECOND_CORNERS[k], t);
  return triangleMap([src[tip], src.N, src[inner]], [now(tip), now('N'), now(inner)]);
}
