import { type Pt } from './planeModel.js';
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
    stops: {
        offset: string;
        colour: string;
        opacity: string | null;
    }[];
}
export declare function fileElements(source: string): FileElement[];
export declare function fileGradients(source: string): FileGradient[];
export declare const FIRST: {
    elements: FileElement[];
    gradients: FileGradient[];
};
export declare const SECOND: {
    elements: FileElement[];
    gradients: FileGradient[];
};
export declare const FIRST_CORNERS: {
    readonly N: Pt;
    readonly BT: Pt;
    readonly AI: Pt;
    readonly AT: Pt;
    readonly BI: Pt;
};
/** centre of drawing 1 (mean of the same five corners as for the other drawings) */
export declare const FIRST_CENTRE: Pt;
/** best-fit rotation (radians) of drawing 1 onto drawing 2, from the five corners */
export declare const FIRST_TURN_ANGLE: number;
/** A point of drawing 1 (p1) and the same point of drawing 2 (p2) at turn progress t, centred. */
export declare function turnPoint(p1: Pt, p2: Pt, t: number): Pt;
/** Point lists used for the turn, per straight-line element: the files' own, matched by place (see above). */
export declare const FIRST_TURN_POINTS: Record<number, {
    first: Pt[];
    second: Pt[];
}>;
/** Like turnPoint, but points that end at the tail (or at the keel's corner) travel together (see above). */
export declare function firstTurnPoint(p1: Pt, p2: Pt, t: number, element?: number, index?: number): Pt;
/**
 * Area the dark keel may show in during the turn: the side of the lower wing's inner edge where the
 * tail is (a big polygon bounded by that edge's line). In both drawings the keel lies on that side
 * (or under the outlines), so the ends look exactly like the files; in between the keel never
 * shows through the lower wing.
 */
export declare function keelArea(t: number): Pt[];
/** which wing each soft highlight shape belongs to (element index → wing), same in both files */
export declare const FIRST_TURN_HIGHLIGHTS: ReadonlyArray<{
    index: number;
    wing: 'A' | 'B';
}>;
/** Affine map that carries a highlight of drawing `from` (file coordinates) onto the turning wing. */
export declare function firstTurnHighlightMap(from: 1 | 2, wing: 'A' | 'B', t: number): [number, number, number, number, number, number];
