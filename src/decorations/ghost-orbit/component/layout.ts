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

export const CANVAS_SIZE = 512;

/** Where the user's photo goes (not drawn by the decoration). */
export const AVATAR_AREA = { cx: 256, cy: 256, r: 218 } as const;

/**
 * Anchor (pivot) of each vector, in its own file's units. The ghost's
 * position on the orbit is the position of its anchor.
 *
 * ghost.svg (118 × 134) replaced the first version on 2026-10-28. Its
 * anchor was chosen so that, together with ORBIT.tangentOffset, each new
 * ghost flies in the same direction as the first version and its face
 * lands on the same spot of the orbit (only the body changed).
 */
export const ANCHORS = {
  ghost: [44.6, 82.8], // ghost.svg 118 × 134
  face: [24.5, 32], // face.svg 49 × 64 (centre)
} as const;

/** `face` inside the `ghost` frame (top-left of face.svg in ghost.svg units). */
export const FACE_IN_GHOST = { x: 50.5, y: 21 } as const;

/**
 * Orbit of the five ghosts.
 *   x = cx + r · cos θ,  y = cy + r · sin θ   (SVG: y grows downwards,
 *   so a growing θ turns clockwise on screen, a shrinking θ counter-clockwise)
 *   θ_i = theta0 + i · 72°
 */
export const ORBIT = {
  cx: 256,
  cy: 256,
  r: 188.4,
  /** angle of ghost #0 (near the top), degrees */
  theta0: -81.4,
  count: 5,
  /** ghost scale (vectors otherwise at 1) */
  ghostScale: 0.96,
  /**
   * Ghost rotation relative to the orbit angle (approved variant A:
   * tangent pose, head leading counter-clockwise, tail trailing).
   * −49° for the first ghost.svg; the new ghost.svg is drawn already
   * tilted 35.5° more steeply (head up-right), so −49° + 35.5° = −13.5°
   * keeps the same flying direction.
   */
  tangentOffset: -13.5,
} as const;

/** Drawing order, back to front. */
export const LAYER_ORDER = ['ghosts'] as const;
