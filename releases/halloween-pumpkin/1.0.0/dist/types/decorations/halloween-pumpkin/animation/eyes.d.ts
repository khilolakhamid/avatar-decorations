/**
 * Closed-eye shapes, derived from the ORIGINAL open eyes.
 *
 * Approved variant: the eye closes up toward its brow line.
 * Each dark eye has a straight top edge — the angry "brow". A blink squeezes
 * the eye perpendicular to that line toward it: the brow itself does not
 * move, so the angry slant is kept at every moment, and a narrow slit stays
 * under the brow. Socket and dark eye get the SAME squeeze, so they stay
 * fitted to each other. The squeeze is a linear map, so curves keep their
 * type and point count — a valid TGS shape morph. Opening returns to the
 * untouched original paths.
 */
import { type PathData } from '../../../shared/animation/index.js';
/** Returns the closed versions of [socket, darkEye] for one eye. */
export declare function closeEye(socketD: string, darkD: string, openness?: number): [PathData, PathData];
