export type Pt = readonly [number, number];
export declare const numbers: (s: string) => number[];
export declare const pointsOf: (d: string) => Pt[];
export declare const dOf: (element: string) => string;
export interface Drawing {
    elements: string[];
    defs: string;
}
export declare const DRAWINGS: readonly [Drawing, Drawing];
/** Number of wire elements at the start of each file. */
export declare const WIRE_ELEMENTS = 4;
/** Parts of one bulb, in the files' drawing order. */
export declare const BULB_PARTS: readonly ["glow", "bulb", "highlight", "rimMask", "rim", "socket", "socketMask", "socketRim", "socketHighlight"];
export type BulbPart = (typeof BULB_PARTS)[number];
export interface BulbInFile {
    /** index of each part's element in the file */
    parts: Record<BulbPart, number>;
    /** sparkle (soft glow, star) element indexes, if the bulb is lit in this file */
    sparkle: {
        glow: number;
        star: number;
    } | null;
}
export declare const BULBS_IN_FILES: readonly [BulbInFile[], BulbInFile[]];
export declare const BULB_COUNT: number;
export declare const BULB_NAMES: readonly ["purple", "blue", "green", "pink", "yellow", "red"];
/** Shift that puts drawing 2 onto drawing 1 (mean shift of all hanger points). */
export declare const ALIGN: Pt;
export declare const toFirst: (p: Pt) => Pt;
/** Lower end of each bulb's hanger (where the socket hangs): the point the bulb sways around. */
export declare const HANG_POINTS: readonly Pt[];
export interface Turn {
    /** angle (radians) from drawing 1 to drawing 2 */
    angle: number;
    /** point it turns around (drawing 1 coordinates) */
    centre: Pt;
    /** largest point error of the rigid fit */
    error: number;
}
/** Best rigid turn taking point list a onto point list b. */
export declare function rigidTurn(a: readonly Pt[], b: readonly Pt[]): Turn;
/** The turn of each drawn part of each bulb (from the part's own points; glow, highlight and sparkle follow the bulb). */
export declare const BULB_TURNS: readonly Record<BulbPart, Turn>[];
/** Opacity of the inner highlight in each file (lit bulbs: 1, dim bulbs: 0.6). */
export declare const highlightOpacity: (file: 0 | 1, bulb: number) => number;
/** Which file shows the bulb lit (has its sparkle). */
export declare const LIT_IN: readonly (0 | 1)[];
/** Centre of a sparkle = centre of its soft white glow circle (the star is drawn around it). */
export declare function sparkleCentre(file: 0 | 1, bulb: number): Pt;
/**
 * Wire elements as templates (numbers replaced) + their numbers in drawing 1 and (aligned) drawing 2.
 * The wire itself, its colours and its shading (elements 0–2) are the same curves in both drawings
 * (points differ by ≤ 4 units at the loop — the breath), so their points move. The white glints
 * (element 3) are drawn at DIFFERENT places along the wire in the two drawings, so they are not moved
 * along the wire: drawing 1's glints fade out while drawing 2's fade in (WIRE_FADE).
 */
export declare const WIRE_FADE: number[];
export declare const WIRE_MORPH: {
    template: string;
    same: boolean;
    n1: number[];
    n2: number[];
}[];
