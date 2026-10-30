/**
 * Shared SVG helpers for all avatar decorations.
 *
 * Pure string functions (no DOM), so they work in the browser, in Node
 * build scripts and in future exporters alike.
 */

export interface ParsedSvg {
  /** Width of the original canvas (from the `viewBox`). */
  width: number;
  /** Height of the original canvas (from the `viewBox`). */
  height: number;
  /** Inner markup of `<defs>` (gradients, clip paths). */
  defs: string;
  /** Everything inside the root `<svg>` except `<defs>`. */
  body: string;
}

/** Splits an exported SVG file into its definitions and drawable content. */
export function parseSvg(source: string): ParsedSvg {
  const root = source.match(/<svg\b([^>]*)>([\s\S]*)<\/svg>/i);
  if (!root) throw new Error('parseSvg: no <svg> root element found');
  const [, attrs, inner] = root;

  const viewBox = attrs.match(/viewBox="([^"]+)"/);
  let width = 0;
  let height = 0;
  if (viewBox) {
    const parts = viewBox[1].trim().split(/[\s,]+/).map(Number);
    width = parts[2];
    height = parts[3];
  } else {
    width = Number(attrs.match(/\bwidth="([\d.]+)"/)?.[1] ?? 0);
    height = Number(attrs.match(/\bheight="([\d.]+)"/)?.[1] ?? 0);
  }

  const defsBlocks: string[] = [];
  const body = inner
    .replace(/<defs>([\s\S]*?)<\/defs>/gi, (_, d: string) => {
      defsBlocks.push(d);
      return '';
    })
    .trim();

  return { width, height, defs: defsBlocks.join('\n').trim(), body };
}

/**
 * Prefixes every `id` and every reference to it (`url(#…)`, `href="#…"`).
 *
 * Needed because the same decoration can appear several times on one page
 * (e.g. different sizes) — without unique ids the gradients of one copy
 * would silently be taken from another.
 */
export function prefixIds(markup: string, prefix: string): string {
  return markup
    .replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${prefix}${id})`)
    .replace(/\b(xlink:href|href)="#([^"]+)"/g, (_, a, id) => `${a}="#${prefix}${id}"`);
}

/**
 * Splits markup into its top-level elements (each with its children).
 * Handles self-closing tags and nesting; enough for exported SVG files.
 */
export function topLevelElements(markup: string): string[] {
  const out: string[] = [];
  const tag = /<(\/?)([a-zA-Z][\w:-]*)\b[^>]*?(\/?)>/g;
  let depth = 0;
  let start = -1;
  let m: RegExpExecArray | null;
  while ((m = tag.exec(markup))) {
    const [, closing, , selfClosing] = m;
    if (closing) {
      depth--;
      if (depth === 0) out.push(markup.slice(start, tag.lastIndex));
    } else if (selfClosing) {
      if (depth === 0) out.push(m[0]);
    } else {
      if (depth === 0) start = m.index;
      depth++;
    }
  }
  return out;
}

/** Splits `<g attrs>children</g>` into its opening tag and child elements. */
export function unwrapGroup(markup: string): { open: string; children: string[] } {
  const m = markup.trim().match(/^(<g\b[^>]*>)([\s\S]*)<\/g>$/);
  if (!m) throw new Error('unwrapGroup: markup is not a single <g> element');
  return { open: m[1], children: topLevelElements(m[2]) };
}

/** Adds (or replaces) an attribute on the first tag of an element string. */
export function withAttr(element: string, name: string, value: string): string {
  return element.replace(/^<([a-zA-Z][\w:-]*)/, `<$1 ${name}="${value}"`);
}

/** Reads an attribute from the first tag of an element string. */
export function getAttr(element: string, name: string): string | undefined {
  const open = element.match(/^<[^>]*>/)?.[0] ?? '';
  return open.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

/** Placement of one source vector inside the 512 × 512 composition. */
export interface Placement {
  /** Position of the vector's top-left corner (its own 0,0). */
  x: number;
  y: number;
  /** Rotation in degrees around the vector's own 0,0 (default 0). */
  rotate?: number;
  /** Uniform scale (default 1 — original size). */
  scale?: number;
}

export function placementTransform(p: Placement): string {
  const t = [`translate(${round(p.x)} ${round(p.y)})`];
  if (p.rotate) t.push(`rotate(${round(p.rotate)})`);
  if (p.scale !== undefined && p.scale !== 1) t.push(`scale(${round(p.scale)})`);
  return t.join(' ');
}

let counter = 0;
/** Returns a short id prefix unique within this page. */
export function uniquePrefix(base: string): string {
  counter += 1;
  return `${base}-${counter.toString(36)}-`;
}

export function round(n: number, digits = 3): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
