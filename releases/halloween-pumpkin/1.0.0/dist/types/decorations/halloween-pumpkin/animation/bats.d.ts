/**
 * Two bats built from the same `bat_head`, `left_wing`, `right_wing`.
 *
 * Each bat:
 *   • fades in on the right side, flies a short way up-left, ends near its
 *     place from the reference illustration and fades out;
 *   • flaps both wings around their attachment points (hidden under the
 *     body); the body bobs gently with every wing beat;
 *   • while invisible it returns to its start, so the loop has no jump.
 *
 * The two bats differ in timing, start height, path length, flap speed and
 * flap phase, so they never move in lockstep.
 */
import { type PartAnimation } from '../../../shared/animation/index.js';
/** Wing roots in each wing's own file coordinates (centre of the overlap with the body). */
export declare const LEFT_WING_ROOT: readonly [39, 19];
export declare const RIGHT_WING_ROOT: readonly [12, 31.4];
export interface BatFlight {
    /** fade in: start → fully visible */
    appear: [number, number];
    /** fade out: start → gone */
    vanish: [number, number];
    /** start offset from the final place, composition pixels (x right, y down) */
    from: [number, number];
    /** where the flight ends relative to the final place (keeps moving while fading) */
    to: [number, number];
    /** frames per wing beat — must divide 180 */
    flapPeriod: number;
    flapPhase: number;
    /** wing swing, degrees */
    flapAngle: number;
    /** body bob with each beat, px */
    bob: number;
}
export declare const BAT_FLIGHTS: [BatFlight, BatFlight];
export declare function batAnimation(index: 1 | 2, flight: BatFlight, 
/** rotation of this bat's layer in the composition (degrees) */
layerRotation: number, frames: number): Record<string, PartAnimation>;
