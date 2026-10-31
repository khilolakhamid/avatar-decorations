/**
 * Leaf pattern layout, matched to the user's reference screenshot of the
 * purple header (402 × 268, same coordinates as the Figma frame).
 *
 * Measured on the reference:
 * - The 16 leaves of the Figma file are all there, at their Figma positions,
 *   sizes and angle — but NOT cut by the hard ellipse the SVG export uses
 *   (the export lost the soft edge of that mask, so 7 leaves were missing or
 *   cut). The ellipse clip is therefore not applied.
 * - Leaves get paler away from the avatar: their contrast falls from ~77 % of
 *   full at 0.55 of the ellipse radius to ~45 % at the ellipse edge and
 *   ~23 % at 1.2. `opacity(r)` below reproduces that curve.
 * - Two more leaves sit on the far left and right at avatar height. They are
 *   copies of existing leaves from the file (same drawing, size and angle):
 *   left = the medium leaf at (94.3, 144.6), right = the large leaf at (262.4, 180.6).
 *
 * All positions are in the pattern box, which is centred on the screen and
 * moves with the safe area exactly like the avatar, so the composition keeps
 * its place around the avatar on any screen width.
 */

/** Ellipse the fade is measured against (from the Figma mask). */
export const LEAF_FADE_ELLIPSE = { cx: 200.5, cy: 137, rx: 138, ry: 89.5 } as const;

/** Contrast (opacity) by normalised ellipse distance r, measured on the reference. */
const FADE_POINTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0.24, 1],
  [0.555, 0.77],
  [0.75, 0.62],
  [1.0, 0.45],
  [1.2, 0.23],
  [1.45, 0],
];

export function leafOpacity(x: number, y: number): number {
  const e = LEAF_FADE_ELLIPSE;
  const r = Math.hypot((x - e.cx) / e.rx, (y - e.cy) / e.ry);
  for (let i = 1; i < FADE_POINTS.length; i++) {
    const [r1, o1] = FADE_POINTS[i];
    if (r <= r1) {
      const [r0, o0] = FADE_POINTS[i - 1];
      return o0 + ((o1 - o0) * (r - r0)) / (r1 - r0);
    }
  }
  return 0;
}

/** Extra leaves: index of the leaf (in the SVG's order) to copy, and how far to move the copy. */
export const EXTRA_LEAVES: ReadonlyArray<{ copyOf: number; dx: number; dy: number }> = [
  { copyOf: 5, dx: -57.9, dy: -0.6 }, // medium leaf → centre (36.4, 144.0)
  { copyOf: 1, dx: 96.7, dy: -36.0 }, // large leaf  → centre (359.1, 144.6)
];
