/**
 * Paper Plane Orbit — layout (512 × 512 composition space, the same as the
 * other decorations of the library).
 *
 *   • avatar circle: centre (256, 256), radius 218 — as in the other
 *     decorations (measured on the owner's reference, reference/paper-plane-orbit/);
 *   • the plane's path and sizes are in component/motion.ts (PATH_KEYS): it
 *     comes in small at the left (drawing 1), passes
 *     big in front of the avatar (drawing 2), flies away small at the top
 *     right (drawing 3) and returns invisibly behind the photo.
 */
export declare const CANVAS_SIZE = 512;
/** Where the user's photo goes (not drawn by the decoration). */
export declare const AVATAR_AREA: {
    readonly cx: 256;
    readonly cy: 256;
    readonly r: 218;
};
/** Drawing order, back to front. */
export declare const LAYER_ORDER: readonly ["plane"];
