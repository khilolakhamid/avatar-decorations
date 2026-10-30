/**
 * Cat Ears — static layout (512 × 512 composition space, the same as the
 * other decorations of the library).
 *
 * Measured on the owner's reference (768 × 768 = this canvas at 1.5×):
 *   • avatar circle: centre (256, 256), radius 218 — as in the other
 *     decorations;
 *   • the right ear is ear.svg at its original size (scale 1), not rotated,
 *     its top-left corner at (341, 13) — pixel fit to the reference,
 *     average difference 0.6 of 255;
 *   • the left ear is the exact mirror image of the right one around the
 *     vertical centre line x = 256 (the reference is symmetric to 99.9 %).
 */

export const CANVAS_SIZE = 512;

/** Where the user's photo goes (not drawn by the decoration). */
export const AVATAR_AREA = { cx: 256, cy: 256, r: 218 } as const;

/** Right ear: ear.svg (160 × 226) placed at its original size. */
export const RIGHT_EAR = { x: 341, y: 13, scale: 1 } as const;

/**
 * Pivot of each ear's swing, in ear.svg units: middle of the ear's base,
 * between its lower-left corner (≈ 51, 143) and its lowest point (≈ 133, 215).
 * In the composition it lies at (433, 192) — inside the photo circle, so a
 * swinging ear stays attached to the photo.
 */
export const EAR_PIVOT = [92, 179] as const;

/**
 * Tip of the ear, in ear.svg units (the top point of its outline). The bend of
 * the ear (draft 1.1.0) grows along the line from EAR_PIVOT to EAR_TIP.
 */
export const EAR_TIP = [133, 6.21] as const;

/** Drawing order, back to front. */
export const LAYER_ORDER = ['ear-left', 'ear-right'] as const;
