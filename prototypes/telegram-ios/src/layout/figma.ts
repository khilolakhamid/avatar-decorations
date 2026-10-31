/**
 * Geometry taken from the Figma SVG (reference/settings.figma.svg).
 * All values are in points (= CSS px). The Figma frame is 402 × 874
 * (iPhone 16 Pro / 17 Pro). Nothing here is eyeballed: every number was read
 * from the SVG (element coordinates or glyph outlines).
 */
export const FRAME = {
  width: 402,
  height: 874,
  /** iPhone 16 Pro safe areas the Figma frame is drawn for. */
  safeTop: 62,
  safeBottom: 34,
} as const;

export const HEADER = {
  height: 268,
  color: '#9C68CE',
  /** QR button: x 16, y 62, 44 × 44. Icon at (11.008, 10.758) inside it. */
  qrButton: { x: 16, y: 62, width: 44, height: 44, iconX: 11.008, iconY: 10.758 },
  /** Edit button: x 334, y 62, 52 × 44; text baseline 28 below its top. */
  editButton: { x: 334, y: 62, width: 52, height: 44, baseline: 28 },
  /** Avatar circle: x 149, y 90, 104 × 104. */
  avatar: { x: 149, y: 90, size: 104 },
  /** Name: 28 pt bold, baseline at y 231. Star 20 × 20 at x 256.5, y 211. */
  name: { baseline: 231, fontSize: 28, starSize: 20, starGap: 5 },
  /** Phone: 15 pt regular, baseline at y 253. */
  phone: { baseline: 253, fontSize: 15 },
} as const;

export const LIST = {
  /** First card starts at y 284 (16 below the header). */
  top: 284,
  sideInset: 16,
  /** Vertical gap between cards. */
  gap: 24,
  cardRadius: 26,
  rowHeight: 52,
  /** Label baseline is 32 below the row top (17 pt text). */
  labelBaseline: 32,
  /** Label / separator start for rows with a plain blue icon and with a coloured tile. */
  labelXPlain: 90,
  labelXTile: 78,
  /** Separator ends 16 before the card's right edge (x 370 of 386). */
  separatorRightInset: 16,
  /** Coloured tile: x 32 (16 inside the card), y 11 inside the row, 30 × 30, radius 8. */
  tile: { x: 16, y: 11, size: 30, radius: 8 },
  /** Chevron: 6.948 × 11.903, right edge 14.512 before the card edge, top 20.055 in the row. */
  chevron: { right: 14.512, top: 20.055 },
  /** Value text ("3"): right edge of the glyph at x 344.91 → 41.09 before the card edge. */
  valueRight: 40.5,
} as const;

export const TAB_BAR = {
  /** Original bar: x 25, y 787, 282 × 62 (+ a separate 62 × 62 search button at x 315). */
  /** New bar without the search button: full width minus 25 on each side. */
  sideInset: 25,
  height: 62,
  /** Distance from the bar's bottom edge to the screen's bottom edge (874 − 849). */
  bottom: 25,
  radius: 31,
  /** Icons start 12.098 below the bar top; labels sit on a baseline 50 below the top. */
  iconTop: 12.098,
  iconBoxHeight: 24,
  labelBaseline: 50,
  /** Selected-tab highlight: 78 × 56, 3 from the bar's top and bottom. */
  highlight: { width: 78, height: 56, top: 3 },
} as const;

/** Bottom progressive blur behind the tab bar: lowest 102 pt of the screen. */
export const BOTTOM_BLUR = { height: 102, radius: 30 } as const;
