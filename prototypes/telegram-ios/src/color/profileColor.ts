/**
 * Profile colour helpers for the Your Color screen.
 *
 * The swatches come from the user's palette SVG (Icons_Container.svg). The
 * preview background and the "online" text are not the swatch colours
 * themselves: on the reference the purple swatch #A16CDE shows a #8E6CC2
 * background and #C19BF8 status text. Measured in OKLCH that is
 *   background: L − 0.0347, C × 0.769, h − 2.6
 *   status:     L + 0.1233, C × 0.794, h − 1.3
 * and the same rule is applied to every other swatch.
 */

export interface Swatch {
  /** Index in the palette, row by row (0–7 single colours, 8–15 two-colour). */
  index: number;
  /** One colour, or [top-left, bottom-right] for the diagonal two-colour swatches. */
  colors: string[];
  /** Centre and radius in the SVG's own coordinates. */
  cx: number;
  cy: number;
  r: number;
}

/** Reads the swatches out of the palette SVG markup (the file itself is not changed). */
export function parsePalette(markup: string): Swatch[] {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const svg = doc.documentElement;
  const swatches: Swatch[] = [];
  svg.querySelectorAll('circle').forEach((c) => {
    swatches.push({
      index: swatches.length,
      colors: [c.getAttribute('fill') ?? '#000'],
      cx: Number(c.getAttribute('cx')),
      cy: Number(c.getAttribute('cy')),
      r: Number(c.getAttribute('r')),
    });
  });
  // Two-colour swatches: pairs of half-circle paths (first = top-left half).
  const paths = Array.from(svg.querySelectorAll('path'));
  const first = swatches[0];
  for (let i = 0; i + 1 < paths.length; i += 2) {
    const column = i / 2;
    const above = swatches[column] ?? first;
    swatches.push({
      index: swatches.length,
      colors: [paths[i].getAttribute('fill') ?? '#000', paths[i + 1].getAttribute('fill') ?? '#000'],
      cx: above.cx,
      // Second row: same columns, centre from the bounds of both halves (y 41–74 → 57.5).
      cy: rowCentre(`${paths[i].getAttribute('d') ?? ''} ${paths[i + 1].getAttribute('d') ?? ''}`, above.cy + 41),
      r: above.r,
    });
  }
  return swatches;
}

function rowCentre(d: string, fallback: number): number {
  const ys = Array.from(d.matchAll(/[\d.]+[ ,]([\d.]+)/g)).map((m) => Number(m[1]));
  if (!ys.length) return fallback;
  return (Math.min(...ys) + Math.max(...ys)) / 2;
}

// ── OKLCH conversion (sRGB ↔ OKLab), enough for the colour rules above ──

type Oklch = [number, number, number];

const toLinear = (c: number): number => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number): number => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function hexToOklch(hex: string): Oklch {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => toLinear(v / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), (Math.atan2(B, A) * 180) / Math.PI];
}

export function oklchToHex([L, C, h]: Oklch): string {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const rgb = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return `#${rgb
    .map((v) => Math.round(Math.min(1, Math.max(0, toGamma(v))) * 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

const shift = (hex: string, dL: number, kC: number, dH: number): string => {
  const [L, C, h] = hexToOklch(hex);
  return oklchToHex([L + dL, C * kC, h + dH]);
};

/**
 * Preview backgrounds measured on the user's references, used as they are:
 * the first (blue) swatch #0087FD → #5B8EBB (blue profile reference, edge
 * colour; the avatar glow lightens the centre as there).
 */
const MEASURED_PREVIEW: Readonly<Record<string, string>> = { '#0087FD': '#5B8EBB' };

/** Preview background for a swatch colour (purple #A16CDE → #8E6CC2, as on the reference). */
export const previewColor = (hex: string): string => MEASURED_PREVIEW[hex.toUpperCase()] ?? shift(hex, -0.0347, 0.769, -2.6);
/** "online" text colour on that background (purple → #C19BF8). */
export const statusColor = (hex: string): string => shift(hex, 0.1233, 0.794, -1.3);

/** CSS background of the preview: one colour, or the two colours top → bottom. */
export function previewBackground(swatch: Swatch): string {
  const [a, b] = swatch.colors.map(previewColor);
  return b ? `linear-gradient(to bottom, ${a}, ${b})` : a;
}

/**
 * Figma "plus darker" of a colour over a background: max(0, bg + c − 1) per
 * channel. Used as the ready-made leaf colour where the browser has no
 * plus-darker blend (Safari blends #CCCCCC itself).
 */
export function plusDarker(background: string, color = '#cccccc'): string {
  const ch = (hex: string, i: number): number => parseInt(hex.replace('#', '').slice(i * 2, i * 2 + 2), 16);
  const out = [0, 1, 2].map((i) => Math.max(0, ch(background, i) + ch(color, i) - 255));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('');
}
