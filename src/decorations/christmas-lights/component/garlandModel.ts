/**
 * Christmas Lights — the two original drawings, matched element by element.
 *
 * Both files have the same structure (the test checks it): 4 wire elements,
 * then 6 bulbs, each drawn as
 *   glow · bulb · inner highlight · (mask) rim · socket · (mask) socket rim · socket highlight
 * and, for a lit bulb, its sparkle: a soft white glow and the white star.
 * Lit in drawing 1: blue, pink, red. Lit in drawing 2: purple, green, yellow.
 *
 * Measured from the files (nothing is redrawn):
 *   • drawing 2 is drawing 1 moved by ALIGN (the files were exported with
 *     different frames): every point of the wire and of the six hangers
 *     matches after this shift (the wire's loop differs by < 0.3 units —
 *     the wire's tiny "breath");
 *   • every part of every bulb in drawing 2 is exactly the same shape as in
 *     drawing 1, turned by some angle around some point (best-fit rigid turn,
 *     error < 0.01 units) — so a bulb can be drawn once and turned from its
 *     angle in drawing 1 to its angle in drawing 2, staying a single bulb.
 */
import { parseSvg, topLevelElements } from '../../../shared/svg';
import { ASSET_SOURCES } from '../assets';

export type Pt = readonly [number, number];

const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;
export const numbers = (s: string): number[] => (s.match(NUM) ?? []).map(Number);
export const pointsOf = (d: string): Pt[] => {
  const n = numbers(d);
  const out: Pt[] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
};
export const dOf = (element: string): string => element.match(/\sd="([^"]+)"/)?.[1] ?? '';

export interface Drawing {
  elements: string[];
  defs: string;
}
const drawing = (source: string): Drawing => {
  const { body, defs } = parseSvg(source);
  return { elements: topLevelElements(body), defs };
};
export const DRAWINGS: readonly [Drawing, Drawing] = [drawing(ASSET_SOURCES.lights_1), drawing(ASSET_SOURCES.lights_2)];

/** Number of wire elements at the start of each file. */
export const WIRE_ELEMENTS = 4;

/** Parts of one bulb, in the files' drawing order. */
export const BULB_PARTS = ['glow', 'bulb', 'highlight', 'rimMask', 'rim', 'socket', 'socketMask', 'socketRim', 'socketHighlight'] as const;
export type BulbPart = (typeof BULB_PARTS)[number];

export interface BulbInFile {
  /** index of each part's element in the file */
  parts: Record<BulbPart, number>;
  /** sparkle (soft glow, star) element indexes, if the bulb is lit in this file */
  sparkle: { glow: number; star: number } | null;
}

function bulbsOf(d: Drawing): BulbInFile[] {
  const out: BulbInFile[] = [];
  let i = WIRE_ELEMENTS;
  while (i < d.elements.length) {
    const parts = {} as Record<BulbPart, number>;
    BULB_PARTS.forEach((p, k) => (parts[p] = i + k));
    i += BULB_PARTS.length;
    let sparkle: BulbInFile['sparkle'] = null;
    if (i < d.elements.length && /^<g\b[^>]*>\s*<circle\b/.test(d.elements[i])) {
      sparkle = { glow: i, star: i + 1 };
      i += 2;
    }
    out.push({ parts, sparkle });
  }
  return out;
}
export const BULBS_IN_FILES: readonly [BulbInFile[], BulbInFile[]] = [bulbsOf(DRAWINGS[0]), bulbsOf(DRAWINGS[1])];
export const BULB_COUNT = BULBS_IN_FILES[0].length;
export const BULB_NAMES = ['purple', 'blue', 'green', 'pink', 'yellow', 'red'] as const;

/** Hangers: the short straight pieces of the wire element that lead to each bulb (left to right). */
const subpaths = (d: string) => d.split(/(?=M)/).map((s) => s.trim()).filter(Boolean);
const HANGERS_1 = subpaths(dOf(DRAWINGS[0].elements[0])).filter((s) => /^M[^CZ]*L[^CZ]*$/i.test(s)).map(pointsOf);
const HANGERS_2 = subpaths(dOf(DRAWINGS[1].elements[0])).filter((s) => /^M[^CZ]*L[^CZ]*$/i.test(s)).map(pointsOf);

/** Shift that puts drawing 2 onto drawing 1 (mean shift of all hanger points). */
export const ALIGN: Pt = (() => {
  let x = 0;
  let y = 0;
  let n = 0;
  HANGERS_1.forEach((h, k) =>
    h.forEach((p, j) => {
      x += HANGERS_2[k][j][0] - p[0];
      y += HANGERS_2[k][j][1] - p[1];
      n++;
    }),
  );
  return [x / n, y / n];
})();
export const toFirst = (p: Pt): Pt => [p[0] - ALIGN[0], p[1] - ALIGN[1]];

/** Lower end of each bulb's hanger (where the socket hangs): the point the bulb sways around. */
export const HANG_POINTS: readonly Pt[] = HANGERS_1.map((h) => {
  // the end nearer the bulb's socket
  const sock = pointsOf(dOf(DRAWINGS[0].elements[BULBS_IN_FILES[0][HANGERS_1.indexOf(h)].parts.socket]));
  const c = sock.reduce((a, p) => [a[0] + p[0] / sock.length, a[1] + p[1] / sock.length], [0, 0]);
  const [a, b] = h;
  return Math.hypot(a[0] - c[0], a[1] - c[1]) < Math.hypot(b[0] - c[0], b[1] - c[1]) ? a : b;
});

export interface Turn {
  /** angle (radians) from drawing 1 to drawing 2 */
  angle: number;
  /** point it turns around (drawing 1 coordinates) */
  centre: Pt;
  /** largest point error of the rigid fit */
  error: number;
}

/** Best rigid turn taking point list a onto point list b. */
export function rigidTurn(a: readonly Pt[], b: readonly Pt[]): Turn {
  const mean = (l: readonly Pt[]): Pt => [l.reduce((s, p) => s + p[0], 0) / l.length, l.reduce((s, p) => s + p[1], 0) / l.length];
  const ca = mean(a);
  const cb = mean(b);
  let sn = 0;
  let cs = 0;
  a.forEach((p, k) => {
    const [x, y] = [p[0] - ca[0], p[1] - ca[1]];
    const [u, v] = [b[k][0] - cb[0], b[k][1] - cb[1]];
    sn += x * v - y * u;
    cs += x * u + y * v;
  });
  const angle = Math.atan2(sn, cs);
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  let error = 0;
  a.forEach((p, k) => {
    const [x, y] = [p[0] - ca[0], p[1] - ca[1]];
    error = Math.max(error, Math.hypot(c * x - s * y + cb[0] - b[k][0], s * x + c * y + cb[1] - b[k][1]));
  });
  // fixed point of the turn: (I - R) p = cb - R ca
  const bx = cb[0] - (c * ca[0] - s * ca[1]);
  const by = cb[1] - (s * ca[0] + c * ca[1]);
  const [a11, a12, a21, a22] = [1 - c, s, -s, 1 - c];
  const det = a11 * a22 - a12 * a21;
  const centre: Pt = Math.abs(det) < 1e-12 ? ca : [(bx * a22 - a12 * by) / det, (a11 * by - a21 * bx) / det];
  return { angle, centre, error };
}

/** The turn of each drawn part of each bulb (from the part's own points; glow, highlight and sparkle follow the bulb). */
export const BULB_TURNS: readonly Record<BulbPart, Turn>[] = BULBS_IN_FILES[0].map((b1, k) => {
  const b2 = BULBS_IN_FILES[1][k];
  const turnOf = (i1: number, i2: number) =>
    rigidTurn(pointsOf(dOf(DRAWINGS[0].elements[i1])), pointsOf(dOf(DRAWINGS[1].elements[i2])).map(toFirst));
  const bulb = turnOf(b1.parts.bulb, b2.parts.bulb);
  const rim = turnOf(b1.parts.rim, b2.parts.rim);
  const socketRim = turnOf(b1.parts.socketRim, b2.parts.socketRim);
  return {
    glow: bulb,
    bulb,
    highlight: bulb,
    rimMask: rim,
    rim,
    socket: turnOf(b1.parts.socket, b2.parts.socket),
    socketMask: socketRim,
    socketRim,
    socketHighlight: turnOf(b1.parts.socketHighlight, b2.parts.socketHighlight),
  };
});

/** Opacity of the inner highlight in each file (lit bulbs: 1, dim bulbs: 0.6). */
export const highlightOpacity = (file: 0 | 1, bulb: number): number => {
  const el = DRAWINGS[file].elements[BULBS_IN_FILES[file][bulb].parts.highlight];
  return Number(el.match(/^<g\b[^>]*\sopacity="([^"]+)"/)?.[1] ?? 1);
};

/** Which file shows the bulb lit (has its sparkle). */
export const LIT_IN: readonly (0 | 1)[] = BULBS_IN_FILES[0].map((b) => (b.sparkle ? 0 : 1));

/** Centre of a sparkle = centre of its soft white glow circle (the star is drawn around it). */
export function sparkleCentre(file: 0 | 1, bulb: number): Pt {
  const s = BULBS_IN_FILES[file][bulb].sparkle!;
  const el = DRAWINGS[file].elements[s.glow];
  const cx = Number(el.match(/\scx="([^"]+)"/)![1]);
  const cy = Number(el.match(/\scy="([^"]+)"/)![1]);
  return [cx, cy];
}

/**
 * Wire elements as templates (numbers replaced) + their numbers in drawing 1 and (aligned) drawing 2.
 * The wire itself, its colours and its shading (elements 0–2) are the same curves in both drawings
 * (points differ by ≤ 4 units at the loop — the breath), so their points move. The white glints
 * (element 3) are drawn at DIFFERENT places along the wire in the two drawings, so they are not moved
 * along the wire: drawing 1's glints fade out while drawing 2's fade in (WIRE_FADE).
 */
export const WIRE_FADE = [3];
export const WIRE_MORPH = Array.from({ length: WIRE_ELEMENTS }, (_, i) => {
  const d1 = dOf(DRAWINGS[0].elements[i]);
  const d2 = dOf(DRAWINGS[1].elements[i]);
  const template = d1.replace(NUM, '#');
  const n1 = numbers(d1);
  const n2 = numbers(d2).map((v, k) => v - ALIGN[k % 2]);
  return { template, same: template === d2.replace(NUM, '#'), n1, n2 };
});
