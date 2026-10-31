import { hexToOklch, oklchToHex, parsePalette, plusDarker } from './profileColor';
import { profileColor } from '../state/profileColor';
import paletteSvg from '../assets/your-color/Icons_Container.svg';

/**
 * Profile colour → the colours of the screens that show it:
 *   • Settings header background (+ the leaf colour where the browser has no
 *     plus-darker blend) and the rim of its glass buttons;
 *   • the two circles of the "Your Color" row on Edit Profile.
 * (The Your Color card itself uses previewColor(), see profileColor.ts.)
 *
 * Measured on the user's references and used as they are:
 *   purple #A16CDE — header #9C68CE (Figma), rim #E5C1FF/#D5AAF3/#C697E5,
 *                    circles #8D5FD4/#996ED8 (Edit Profile screenshot);
 *   blue   #0087FD — header #5B8EBB, rim #A4D8FB/#94C5EF/#70A2CB (blue profile
 *                    reference).
 * Any other colour gets the same relation to its swatch as purple has
 * (OKLCH lightness / chroma / hue offsets), so every swatch works.
 */
type Oklch = [number, number, number];
const PURPLE = '#A16CDE';
const PURPLE_HEADER = '#9C68CE';
const PURPLE_RIM = ['#E5C1FF', '#D5AAF3', '#C697E5'];
const PURPLE_CIRCLES = ['#8D5FD4', '#996ED8'];

const HEADER: Record<string, string> = { [PURPLE]: PURPLE_HEADER, '#0087FD': '#5B8EBB' };
const RIM: Record<string, string[]> = { [PURPLE]: PURPLE_RIM, '#0087FD': ['#A4D8FB', '#94C5EF', '#70A2CB'] };
const CIRCLES: Record<string, string[]> = { [PURPLE]: PURPLE_CIRCLES };

/** Applies to `hex` the OKLCH change that turns `from` into `to`. */
function like(hex: string, from: string, to: string): string {
  const [L, C, h] = hexToOklch(hex);
  const [L0, C0, h0] = hexToOklch(from);
  const [L1, C1, h1] = hexToOklch(to);
  const k = C0 > 1e-4 ? C1 / C0 : 1;
  const out: Oklch = [Math.min(1, Math.max(0, L + (L1 - L0))), C * k, h + (h1 - h0)];
  return oklchToHex(out);
}

export interface ProfileTheme {
  header: string;
  rim: string[];
  circles: string[];
}

export function profileTheme(color: string): ProfileTheme {
  const c = color.toUpperCase();
  const header = HEADER[c] ?? like(c, PURPLE, PURPLE_HEADER);
  return {
    header,
    rim: RIM[c] ?? PURPLE_RIM.map((r) => like(header, PURPLE_HEADER, r)),
    circles: CIRCLES[c] ?? PURPLE_CIRCLES.map((r) => like(c, PURPLE, r)),
  };
}

const swatches = parsePalette(paletteSvg);
const supportsPlusDarker = typeof CSS !== 'undefined' && CSS.supports?.('mix-blend-mode', 'plus-darker');

/** Writes the theme of the selected colour as CSS variables on <html>. */
export function applyProfileTheme(index = profileColor.swatch): ProfileTheme {
  const swatch = swatches[index] ?? swatches[0];
  const t = profileTheme(swatch.colors[0]);
  const root = document.documentElement.style;
  // Two-colour swatches: header top → bottom like the Your Color card.
  const second = swatch.colors[1] ? profileTheme(swatch.colors[1]).header : null;
  root.setProperty('--profile-header', second ? `linear-gradient(to bottom, ${t.header}, ${second})` : t.header);
  root.setProperty('--profile-header-solid', t.header);
  if (!supportsPlusDarker) root.setProperty('--color-pattern', plusDarker(t.header));
  t.rim.forEach((c, i) => root.setProperty(`--glass-rim-${i + 1}`, c));
  root.setProperty('--color-circle-a', t.circles[0]);
  root.setProperty('--color-circle-b', t.circles[1]);
  return t;
}

/** Keeps the theme in step with the selected colour. */
export function bindProfileTheme(): void {
  applyProfileTheme();
  profileColor.subscribe((i) => applyProfileTheme(i));
}
