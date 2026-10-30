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
    faceGradient: {
        from: Pt;
        to: Pt;
        stops: [string, string];
    };
    outlineAGradient: {
        from: Pt;
        to: Pt;
        stops: [string, string];
    };
    outlineBGradient: {
        from: Pt;
        to: Pt;
        stops: [string, string];
    };
    keelAGradient: {
        from: Pt;
        to: Pt;
        stops: [string, string];
    };
    keelBGradient: {
        from: Pt;
        to: Pt;
        stops: [string, string];
    };
    keelLineColour: string;
    outlineWidth: number;
    /**
     * Highlights of this view, by wing. `index` = position of the element
     * inside the file's clip group (taken from the file as is); `line` = a
     * highlight line drawn with the file's own coordinates and style.
     */
    highlights: ReadonlyArray<{
        wing: 'A' | 'B';
        index?: number;
        line?: {
            from: Pt;
            to: Pt;
            width: number;
            colour: string;
            opacity: number;
        };
    }>;
}
export declare const VIEWS: readonly [ViewModel, ViewModel];
/** Corners used to centre each view (so the plane turns in place). */
export declare const CENTRE_CORNERS: readonly CornerName[];
export declare function viewCentre(v: ViewModel): Pt;
export declare const lerpPt: (a: Pt, b: Pt, t: number) => Pt;
export declare function lerpColour(a: string, b: string, t: number): string;
/** Affine map taking triangle (a0, a1, a2) to triangle (b0, b1, b2), as an SVG matrix. */
export declare function triangleMap(a: readonly [Pt, Pt, Pt], b: readonly [Pt, Pt, Pt]): [number, number, number, number, number, number];
