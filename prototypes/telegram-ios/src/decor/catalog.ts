/**
 * Avatar decorations available in the prototype.
 *
 * The approved releases are used AS IS: the prototype imports their built
 * modules (releases/<id>/1.0.0/dist/index.js) read-only; esbuild bundles them
 * into the page. Nothing in src/decorations or releases is changed.
 *
 * All three share the same 512 × 512 canvas with the photo circle at
 * (256, 256), radius 218 (AVATAR_AREA) — the photo takes 85.16 % of the
 * decoration. Each release draws its parts in place on that canvas (Cat Ears:
 * both ears above the top of the photo, symmetric about x = 256), so on the
 * avatar every decoration is placed the same way: canvas centre on the photo
 * centre, canvas size = photo × 512 / 436.
 *
 * `ink` is the measured visible extent of the WHOLE animation (all 180
 * frames), canvas units: it must contain every rendered pixel (strokes, fur,
 * blur) and stay within the drawing's geometry (SVG bounding box ∪ pixels). It decides the size and centring of
 * the small preview. Ghost Orbit flies out of the canvas (−17.7…529.7 ×
 * −25.7…537.7); Cat Ears only use the top: 8.1…503.9 × 13.7…240.
 * Checked by tests/decorations.test.mjs.
 */
import {
  mountGhostOrbit,
  GHOST_ORBIT_META,
  AVATAR_AREA as GHOST_AVATAR_AREA,
  CANVAS_SIZE as GHOST_CANVAS,
  LOOP_DURATION_MS as GHOST_LOOP,
} from '../../../../releases/ghost-orbit/1.0.0/dist/index.js';
import {
  mountHalloweenPumpkin,
  HALLOWEEN_PUMPKIN_META,
  AVATAR_AREA as PUMPKIN_AVATAR_AREA,
  CANVAS_SIZE as PUMPKIN_CANVAS,
  LOOP_DURATION_MS as PUMPKIN_LOOP,
} from '../../../../releases/halloween-pumpkin/1.0.0/dist/index.js';
import {
  mountCatEars,
  CAT_EARS_META,
  AVATAR_AREA as CAT_EARS_AVATAR_AREA,
  CANVAS_SIZE as CAT_EARS_CANVAS,
  LOOP_DURATION_MS as CAT_EARS_LOOP,
} from '../../../../releases/cat-ears/1.1.0/dist/index.js';
import {
  mountPaperPlaneOrbit,
  PAPER_PLANE_ORBIT_META,
  AVATAR_AREA as PLANE_AVATAR_AREA,
  CANVAS_SIZE as PLANE_CANVAS,
  LOOP_DURATION_MS as PLANE_LOOP,
} from '../../../../releases/paper-plane-orbit/1.0.0/dist/index.js';
import {
  mountChristmasLights,
  CHRISTMAS_LIGHTS_META,
  AVATAR_AREA as LIGHTS_AVATAR_AREA,
  CANVAS_SIZE as LIGHTS_CANVAS,
  LOOP_DURATION_MS as LIGHTS_LOOP,
} from '../../../../releases/christmas-lights/1.0.0/dist/index.js';

/** What the carousel needs from a mounted decoration (every release provides it). */
export interface DecorationInstance {
  readonly element: SVGSVGElement;
  setSize(size: number | string): void;
  seek(frame: number): void;
  readonly frame: number;
  play(): void;
  pause(): void;
  destroy(): void;
}

/**
 * One position of the carousel. The carousel only reads these fields; it has
 * no code for any particular decoration.
 */
export interface DecorationEntry {
  /** Unique id (also used as data-decoration). */
  id: string;
  name: string;
  /** 'none' = no decoration (nothing is drawn, on the avatar or at the sides). */
  kind: 'none' | 'svg';
  version?: string;
  /** Canvas side, canvas units (all releases: 512). */
  canvas: number;
  /** Photo circle on the canvas: the avatar photo is fitted onto it. */
  avatarArea: { cx: number; cy: number; r: number };
  /** Visible extent of the whole loop: [x0, y0, x1, y1] in canvas units. */
  ink: [number, number, number, number];
  loopMs?: number;
  /**
   * Share of the carousel's side slot this entry fills (default 1 = the whole
   * slot). The slot size itself belongs to the carousel, not to entries.
   */
  previewFill?: number;
  /** Optional extra placement on the avatar (default: none). */
  avatarScale?: number;
  avatarOffset?: { x: number; y: number };
  mount(container: Element, size: number | string): DecorationInstance;
}

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * "None": a real carousel position that draws nothing — no ring, no
 * placeholder; its place shows only the card behind it. Selecting and
 * applying it leaves the avatar without a decoration.
 */
function mountNone(container: Element, size: number | string): DecorationInstance {
  const svg = document.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
  svg.setAttribute('viewBox', '0 0 512 512');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.display = 'block';
  const setSize = (v: number | string): void => {
    const css = typeof v === 'number' ? `${v}px` : v;
    svg.style.width = svg.style.height = css;
  };
  setSize(size);
  container.append(svg);
  return { element: svg, setSize, seek: () => {}, frame: 0, play: () => {}, pause: () => {}, destroy: () => svg.remove() };
}

const PHOTO_CIRCLE = { cx: 256, cy: 256, r: 218 };

/**
 * The catalogue, in carousel order (swipe left = next): None, Paper Plane Orbit,
 * Cat Ears 1.1.0, Christmas Lights, Ghost Orbit, Halloween Pumpkin. To add a decoration:
 * import its approved release build and add one entry here — see README.
 */
export const DECORATIONS: DecorationEntry[] = [
  {
    id: 'none',
    name: 'None',
    kind: 'none',
    canvas: 512,
    avatarArea: PHOTO_CIRCLE,
    // Nothing is drawn for None; these only size its (empty) place in the carousel.
    ink: [36, 36, 476, 476],
    previewFill: 0.5,
    avatarScale: 0.48,
    mount: mountNone,
  },
  {
    id: PAPER_PLANE_ORBIT_META.id,
    name: PAPER_PLANE_ORBIT_META.name,
    kind: 'svg',
    version: PAPER_PLANE_ORBIT_META.version,
    canvas: PLANE_CANVAS,
    avatarArea: PLANE_AVATAR_AREA,
    // Rendered pixels of all 180 frames (+1 unit). The SVG bounding box is not
    // used here: it also counts the plane's hidden views (opacity 0).
    ink: [2, 96, 492, 412],
    loopMs: PLANE_LOOP,
    mount: (container, size) => mountPaperPlaneOrbit(container, { size }),
  },
  {
    id: CAT_EARS_META.id,
    name: CAT_EARS_META.name,
    kind: 'svg',
    version: CAT_EARS_META.version,
    canvas: CAT_EARS_CANVAS,
    avatarArea: CAT_EARS_AVATAR_AREA,
    // v1.1.0: at the widest sway the outer fur leaves the canvas (−7 … 514);
    // rendered pixels of all 180 frames.
    ink: [-7, 11, 514, 238],
    loopMs: CAT_EARS_LOOP,
    mount: (container, size) => mountCatEars(container, { size }),
  },
  {
    id: CHRISTMAS_LIGHTS_META.id,
    name: CHRISTMAS_LIGHTS_META.name,
    kind: 'svg',
    version: CHRISTMAS_LIGHTS_META.version,
    canvas: LIGHTS_CANVAS,
    avatarArea: LIGHTS_AVATAR_AREA,
    // Rendered pixels of all 180 frames (+1 unit): the bulbs' glow reaches
    // beyond both the canvas and the SVG bounding box (3.6…394.5 × −2.6…270.2).
    ink: [-17, -15, 426, 303],
    loopMs: LIGHTS_LOOP,
    mount: (container, size) => mountChristmasLights(container, { size }),
  },
  {
    id: GHOST_ORBIT_META.id,
    name: GHOST_ORBIT_META.name,
    kind: 'svg',
    version: GHOST_ORBIT_META.version,
    canvas: GHOST_CANVAS,
    avatarArea: GHOST_AVATAR_AREA,
    ink: [-17.66, -25.72, 529.66, 537.72],
    loopMs: GHOST_LOOP,
    mount: (container, size) => mountGhostOrbit(container, { size }),
  },
  {
    id: HALLOWEEN_PUMPKIN_META.id,
    name: HALLOWEEN_PUMPKIN_META.name,
    kind: 'svg',
    version: HALLOWEEN_PUMPKIN_META.version,
    canvas: PUMPKIN_CANVAS,
    avatarArea: PUMPKIN_AVATAR_AREA,
    ink: [8, 0, 516.72, 516],
    loopMs: PUMPKIN_LOOP,
    mount: (container, size) => mountHalloweenPumpkin(container, { size }),
  },
];

/** Decoration size that puts its photo circle exactly on a photo of `photoDiameter`. */
export function decorationSizeFor(entry: DecorationEntry, photoDiameter: number): number {
  return ((photoDiameter * entry.canvas) / (2 * entry.avatarArea.r)) * (entry.avatarScale ?? 1);
}
