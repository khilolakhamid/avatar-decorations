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
export declare function parseSvg(source: string): ParsedSvg;
/**
 * Prefixes every `id` and every reference to it (`url(#…)`, `href="#…"`).
 *
 * Needed because the same decoration can appear several times on one page
 * (e.g. different sizes) — without unique ids the gradients of one copy
 * would silently be taken from another.
 */
export declare function prefixIds(markup: string, prefix: string): string;
/**
 * Splits markup into its top-level elements (each with its children).
 * Handles self-closing tags and nesting; enough for exported SVG files.
 */
export declare function topLevelElements(markup: string): string[];
/** Splits `<g attrs>children</g>` into its opening tag and child elements. */
export declare function unwrapGroup(markup: string): {
    open: string;
    children: string[];
};
/** Adds (or replaces) an attribute on the first tag of an element string. */
export declare function withAttr(element: string, name: string, value: string): string;
/** Reads an attribute from the first tag of an element string. */
export declare function getAttr(element: string, name: string): string | undefined;
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
export declare function placementTransform(p: Placement): string;
/** Returns a short id prefix unique within this page. */
export declare function uniquePrefix(base: string): string;
export declare function round(n: number, digits?: number): number;
