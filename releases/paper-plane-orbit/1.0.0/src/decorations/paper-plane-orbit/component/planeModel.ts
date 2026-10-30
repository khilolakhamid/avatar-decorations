/**
 * Paper Plane Orbit — corner models of drawings 2 and 3 (for the 2 ↔ 3 turn).
 *
 * The animation uses the original files as they are: while the plane holds a
 * view, the original SVG of that view is shown unchanged. Only while it turns
 * from drawing 2 to drawing 3, the plane is drawn from the corners below (copied
 * from the two files — the component tests check every number against them)
 * and every corner moves in a straight line from its place in one drawing to
 * its place in the other. Nothing is drawn by hand: the parts, colours,
 * gradients and outline widths are the files' own, and the highlights are the
 * files' own elements, carried by their wing and cross-faded.
 *
 * Corner names
 *   N  nose                      AT / AI  tip and inner corner of wing A (upper wing)
 *   BT / BI  tip and inner corner of wing B (lower wing)
 *   K  keel bottom   J1, J2  keel corners   KS  end of the dark keel line   J3  start of the lower keel line
 */

export type Pt = readonly [number, number];
export type CornerName = 'N' | 'AT' | 'AI' | 'BT' | 'BI' | 'K' | 'J1' | 'J2' | 'KS' | 'J3';
/**
 * The three drawings: 0 = drawing 1 (far away, at the start), 1 = drawing 2
 * (close to the viewer), 2 = drawing 3 (flying away). VIEWS below hold the
 * corner models of drawings 2 and 3 (VIEWS[view - 1]), used for the 2 ↔ 3
 * turn; the 1 ↔ 2 turn is made element by element (firstTurn.ts).
 */
export type ViewIndex = 0 | 1 | 2;

export interface ViewModel {
  /** which original file */
  file: 'paper_plane_2' | 'paper_plane_3';
  corners: Record<CornerName, Pt>;
  /** gradient vectors (x1, y1, x2, y2) and stop colours, from the original files */
  faceGradient: { from: Pt; to: Pt; stops: [string, string] };
  outlineAGradient: { from: Pt; to: Pt; stops: [string, string] };
  outlineBGradient: { from: Pt; to: Pt; stops: [string, string] };
  keelAGradient: { from: Pt; to: Pt; stops: [string, string] };
  keelBGradient: { from: Pt; to: Pt; stops: [string, string] };
  keelLineColour: string;
  outlineWidth: number;
  /**
   * Highlights of this view, by wing. `index` = position of the element
   * inside the file's clip group (taken from the file as is); `line` = a
   * highlight line drawn with the file's own coordinates and style.
   */
  highlights: ReadonlyArray<{ wing: 'A' | 'B'; index?: number; line?: { from: Pt; to: Pt; width: number; colour: string; opacity: number } }>;
}

const WHITE_LINE = { colour: 'white', opacity: 0.2 } as const;

export const VIEWS: readonly [ViewModel, ViewModel] = [
  {
    file: 'paper_plane_2',
    corners: {
      N: [170.274, 24.821],
      AT: [9, 8.32031],
      AI: [39.1731, 52.7318],
      BT: [84.8025, 146.264],
      BI: [53, 69.5],
      K: [26.2791, 100.514],
      J1: [60.2731, 89.699],
      J2: [50.6942, 67.6097],
      KS: [60.2732, 89.6977],
      J3: [53, 69.5002],
    },
    faceGradient: { from: [141, 39], to: [56.5, 68], stops: ['#F1F3F5', '#E7ECF1'] },
    outlineAGradient: { from: [17, 40], to: [117.742, -34.885], stops: ['#99A3B0', '#C2C8D1'] },
    outlineBGradient: { from: [64.2142, 83.4913], to: [171.528, 33.3412], stops: ['#99A3B0', '#C2C8D1'] },
    keelAGradient: { from: [37.5, 53], to: [7.45581, 92.7344], stops: ['#9CA5B2', '#9FA8B5'] },
    keelBGradient: { from: [40.1254, 71.0424], to: [4.87681, 92.0343], stops: ['#A1AAB7', '#6E7480'] },
    keelLineColour: '#747D8B',
    outlineWidth: 7,
    highlights: [
      { wing: 'B', line: { from: [94.793, 132.069], to: [150.287, 53.2198], width: 7, ...WHITE_LINE } },
      { wing: 'A', line: { from: [43.3296, 11.832], to: [114.974, 19.1623], width: 7, ...WHITE_LINE } },
      { wing: 'B', index: 10 },
      { wing: 'A', index: 11 },
      { wing: 'A', index: 12 },
    ],
  },
  {
    file: 'paper_plane_3',
    corners: {
      N: [107.62, 58.2413],
      AT: [6.66174, 6],
      AI: [32.761, 47.9451],
      BT: [96.4955, 145.647],
      BI: [45.2335, 67.4941],
      K: [15.5021, 94.4978],
      J1: [56.7336, 87.494],
      J2: [50.3827, 63.3007],
      KS: [56.7335, 85.9941],
      J3: [44.2335, 67.9943],
    },
    faceGradient: { from: [76.7335, 75.4941], to: [107.734, 57.9941], stops: ['#F2F3F7', '#E5EAEE'] },
    outlineAGradient: { from: [104.734, 56.4941], to: [27.3204, 77.97], stops: ['#99A3B0', '#C2C8D1'] },
    outlineBGradient: { from: [106.734, 57.9941], to: [57.563, 94.9443], stops: ['#99A3B0', '#C2C8D1'] },
    keelAGradient: { from: [31.2335, 46.4941], to: [20.0102, 45.1673], stops: ['#BCC3CC', '#9FA8B5'] },
    keelBGradient: { from: [42.2335, 70.9941], to: [13.2335, 96.9941], stops: ['#BFC5CE', '#9CA6B3'] },
    keelLineColour: '#737D8B',
    outlineWidth: 7,
    highlights: [
      { wing: 'B', index: 4 },
      { wing: 'A', index: 5 },
      { wing: 'A', line: { from: [27.1915, 38.9941], to: [12.5692, 15.4941], width: 7, ...WHITE_LINE } },
      { wing: 'B', line: { from: [83.2686, 127.994], to: [56.8356, 86.4941], width: 7, ...WHITE_LINE } },
    ],
  },
];

/** Corners used to centre each view (so the plane turns in place). */
export const CENTRE_CORNERS: readonly CornerName[] = ['N', 'AT', 'AI', 'BT', 'BI'];

export function viewCentre(v: ViewModel): Pt {
  let x = 0;
  let y = 0;
  for (const c of CENTRE_CORNERS) {
    x += v.corners[c][0];
    y += v.corners[c][1];
  }
  return [x / CENTRE_CORNERS.length, y / CENTRE_CORNERS.length];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

export function lerpColour(a: string, b: string, t: number): string {
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const ch = (c: number, s: number) => (c >> s) & 255;
  const mix = (s: number) => Math.round(lerp(ch(ca, s), ch(cb, s), t));
  return `#${((mix(16) << 16) | (mix(8) << 8) | mix(0)).toString(16).padStart(6, '0').toUpperCase()}`;
}

/** Affine map taking triangle (a0, a1, a2) to triangle (b0, b1, b2), as an SVG matrix. */
export function triangleMap(a: readonly [Pt, Pt, Pt], b: readonly [Pt, Pt, Pt]): [number, number, number, number, number, number] {
  const [[x0, y0], [x1, y1], [x2, y2]] = a;
  const [[u0, v0], [u1, v1], [u2, v2]] = b;
  const d = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  const ma = ((u1 - u0) * (y2 - y0) - (u2 - u0) * (y1 - y0)) / d;
  const mc = ((u2 - u0) * (x1 - x0) - (u1 - u0) * (x2 - x0)) / d;
  const mb = ((v1 - v0) * (y2 - y0) - (v2 - v0) * (y1 - y0)) / d;
  const md = ((v2 - v0) * (x1 - x0) - (v1 - v0) * (x2 - x0)) / d;
  return [ma, mb, mc, md, u0 - ma * x0 - mc * y0, v0 - mb * x0 - md * y0];
}
