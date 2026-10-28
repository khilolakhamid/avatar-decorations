/**
 * Ghost Orbit — static layout (512 × 512 composition space).
 *
 * The composition is only the five ghosts on a transparent background
 * (clouds and stars were removed at the owner's request, 2026-10-28).
 *
 *   • the avatar circle is the same as in the other decorations:
 *     centre (256, 256), radius 218;
 *   • ghosts are drawn at 0.96 of their original size;
 *   • `face` sits in the `ghost` frame at FACE_IN_GHOST, same scale, no
 *     rotation: centred on the glowing head, slightly below the glow's
 *     centre.
 *
 * Ghost positions are NOT hand-placed: they are computed from ORBIT
 * (component/orbit.ts), so the five places repeat exactly every 72°.
 */
export declare const CANVAS_SIZE = 512;
/** Where the user's photo goes (not drawn by the decoration). */
export declare const AVATAR_AREA: {
    readonly cx: 256;
    readonly cy: 256;
    readonly r: 218;
};
/**
 * Anchor (pivot) of each vector, in its own file's units. The ghost's
 * position on the orbit is the position of its anchor.
 *
 * ghost.svg (118 × 134) replaced the first version on 2026-10-28. Its
 * anchor was chosen so that, together with ORBIT.tangentOffset, each new
 * ghost flies in the same direction as the first version and its face
 * lands on the same spot of the orbit (only the body changed).
 */
export declare const ANCHORS: {
    readonly ghost: readonly [44.6, 82.8];
    readonly face: readonly [24.5, 32];
};
/** `face` inside the `ghost` frame (top-left of face.svg in ghost.svg units). */
export declare const FACE_IN_GHOST: {
    readonly x: 50.5;
    readonly y: 21;
};
/**
 * Orbit of the five ghosts.
 *   x = cx + r · cos θ,  y = cy + r · sin θ   (SVG: y grows downwards,
 *   so a growing θ turns clockwise on screen, a shrinking θ counter-clockwise)
 *   θ_i = theta0 + i · 72°
 */
export declare const ORBIT: {
    readonly cx: 256;
    readonly cy: 256;
    readonly r: 188.4;
    /** angle of ghost #0 (near the top), degrees */
    readonly theta0: -81.4;
    readonly count: 5;
    /** ghost scale (vectors otherwise at 1) */
    readonly ghostScale: 0.96;
    /**
     * Ghost rotation relative to the orbit angle (approved variant A:
     * tangent pose, head leading counter-clockwise, tail trailing).
     * −49° for the first ghost.svg; the new ghost.svg is drawn already
     * tilted 35.5° more steeply (head up-right), so −49° + 35.5° = −13.5°
     * keeps the same flying direction.
     */
    readonly tangentOffset: -13.5;
};
/** Drawing order, back to front. */
export declare const LAYER_ORDER: readonly ["ghosts"];
