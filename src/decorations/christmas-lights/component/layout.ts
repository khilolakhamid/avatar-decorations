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

export const CANVAS_SIZE = 512;

/** Where the user's photo goes (not drawn by the decoration). */
export const AVATAR_AREA = { cx: 256, cy: 256, r: 218 } as const;

/** Drawing 1 → composition: translate (scale 1). */
export const PLACEMENT = { x: -1.47, y: -27.31, scale: 1 } as const;

/** Drawing order, back to front. */
export const LAYER_ORDER = ['wire', 'bulbs (left to right, each: glow, bulb, socket, sparkle)'] as const;
