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
import { EASE, bezierEase, sampledKeys, waveKeys, type Key, type PartAnimation } from '../../../shared/animation';

/** Wing roots in each wing's own file coordinates (centre of the overlap with the body). */
export const LEFT_WING_ROOT = [39, 19] as const;
export const RIGHT_WING_ROOT = [12, 31.4] as const;

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

export const BAT_FLIGHTS: [BatFlight, BatFlight] = [
  {
    appear: [30, 54],
    vanish: [108, 132],
    from: [14, 44],
    to: [-4, -12],
    flapPeriod: 20,
    flapPhase: 0,
    flapAngle: 16,
    bob: 1.8,
  },
  {
    appear: [46, 70],
    vanish: [124, 148],
    from: [8, 38],
    to: [-3, -10],
    flapPeriod: 18,
    flapPhase: 7,
    flapAngle: 14,
    bob: 1.5,
  },
];

const FLIGHT_EASE = [0.3, 0.05, 0.55, 1] as const; // starts briskly, glides out

export function batAnimation(
  index: 1 | 2,
  flight: BatFlight,
  /** rotation of this bat's layer in the composition (degrees) */
  layerRotation: number,
  frames: number,
): Record<string, PartAnimation> {
  const start = flight.appear[0];
  const end = flight.vanish[1];
  const w = (2 * Math.PI) / flight.flapPeriod;

  // flight offset in composition space, with bob
  const along = (f: number) => bezierEase(FLIGHT_EASE, Math.min(1, Math.max(0, (f - start) / (end - start))));
  const gx = (f: number) => flight.from[0] + (flight.to[0] - flight.from[0]) * along(f);
  const gy = (f: number) =>
    flight.from[1] + (flight.to[1] - flight.from[1]) * along(f) + flight.bob * Math.cos(w * (f - flight.flapPhase));

  // the bat group sits inside its (possibly rotated) layer: convert to layer axes
  const r = (-layerRotation * Math.PI) / 180;
  const lx = (f: number) => gx(f) * Math.cos(r) - gy(f) * Math.sin(r);
  const ly = (f: number) => gx(f) * Math.sin(r) + gy(f) * Math.cos(r);

  // Visible part: sampled every 5 frames. Invisible part (opacity 0):
  // wait at the end, glide back to the start, wait — so frame 180 = frame 0.
  const returnStart = end + 6;
  const returnEnd = frames - 6;
  const track = (fn: (f: number) => number): Key<number>[] => {
    const flightKeys = sampledKeys(fn, start, end, 5);
    flightKeys[flightKeys.length - 1].ease = EASE.linear; // hold after landing
    return [
      { f: 0, v: fn(start), ease: EASE.linear },
      ...flightKeys,
      { f: returnStart, v: fn(end), ease: EASE.inOut },
      { f: returnEnd, v: fn(start), ease: EASE.linear },
      { f: frames, v: fn(start) },
    ];
  };

  const flap = (sign: 1 | -1) =>
    waveKeys({ frames, period: flight.flapPeriod, phase: flight.flapPhase }, sign * flight.flapAngle);

  return {
    [`bat-${index}`]: {
      x: track(lx),
      y: track(ly),
      opacity: [
        { f: 0, v: 0, ease: EASE.linear },
        { f: flight.appear[0], v: 0, ease: EASE.out },
        { f: flight.appear[1], v: 1, ease: EASE.linear },
        { f: flight.vanish[0], v: 1, ease: EASE.in },
        { f: flight.vanish[1], v: 0, ease: EASE.linear },
        { f: frames, v: 0 },
      ],
    },
    // left wing tip goes up with a positive angle, right wing with a negative one
    [`bat-${index}-left_wing`]: { pivot: LEFT_WING_ROOT, rotate: flap(1) },
    [`bat-${index}-right_wing`]: { pivot: RIGHT_WING_ROOT, rotate: flap(-1) },
  };
}
