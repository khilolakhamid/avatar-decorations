/**
 * Christmas Lights — layout (512 × 512 composition space, the same as the
 * other decorations).
 *
 *   • avatar circle: centre (256, 256), radius 218 — as in the other
 *     decorations;
 *   • the garland hangs over the top of the avatar exactly as on the owner's
 *     reference (reference/christmas-lights/composition-reference.png). Measured
 *     on the reference (avatar circle fitted to its edge, garland matched by
 *     its dark wire and sockets), drawing 1 sits at its own size (scale 1.000)
 *     moved by PLACEMENT; drawing 2 is drawn in the same place (see
 *     garlandModel.ts, ALIGN).
 *   • parts of the garland (the purple bulb, the red bulb and their glow)
 *     reach outside the avatar, as on the reference.
 */
export declare const CANVAS_SIZE = 512;
/** Where the user's photo goes (not drawn by the decoration). */
export declare const AVATAR_AREA: {
    readonly cx: 256;
    readonly cy: 256;
    readonly r: 218;
};
/** Drawing 1 → composition: translate (scale 1). */
export declare const PLACEMENT: {
    readonly x: -1.47;
    readonly y: -27.31;
    readonly scale: 1;
};
/** Drawing order, back to front. */
export declare const LAYER_ORDER: readonly ["wire", "bulbs (left to right, each: glow, bulb, socket, sparkle)"];
