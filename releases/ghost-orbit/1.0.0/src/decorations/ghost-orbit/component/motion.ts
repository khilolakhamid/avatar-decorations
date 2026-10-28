/**
 * Ghost Orbit — motion of each ghost on top of the orbit.
 *
 * Seamless loop rule: every motion is a function of the ghost's ANGLE ON
 * THE ORBIT (θ), never of the clock or of the ghost's number. After one
 * 3-second loop ghost i stands exactly where ghost i−1 stood, so it also
 * breathes, sways, looks and speaks exactly as ghost i−1 did: the end of
 * the loop is the picture of its start.
 *
 * Each motion repeats a whole number of times per 360° of orbit. That
 * number is NOT a multiple of 5, so the five ghosts (72° apart) are never
 * in step. A ghost travels 24° per second (72° per 3 s), so `waves` per
 * 360° gives a period of 15 s / waves.
 */

export const MOTION = {
  /** body sway (tilt) around the body's centre, ±degrees; 6 waves → 2.5 s */
  sway: { amplitude: 4, waves: 6, offset: 0 },
  /**
   * Body shape only (the face is not affected), around the head so the
   * head stays steady and the lower body / tail does the moving:
   *   • tail swish — the body is skewed sideways around the head, the
   *     tail tips travel ~±10 units; same rhythm as the sway but lagging
   *     behind it (follow-through), plus a little the opposite way of the
   *     look so body and face read as one character;
   *   • stretch — the body lengthens / shortens downwards with the breath.
   */
  shape: { swish: 6, lag: 75, lookSwish: 3, stretchX: -0.02, stretchY: 0.045 },
  /** breathing: scale of the body (x, y) around its centre; 8 waves → 1.875 s */
  breath: { x: 0.02, y: 0.035, waves: 8, offset: 40 },
  /**
   * Looking around: centre → left (hold) → centre (hold) → right (hold) → …
   * 4 waves → one look-around every 3.75 s; each turn takes ~0.37 s.
   * A turned head is faked on the flat drawing: the face slides towards
   * the look, gets narrower, tilts a little; the eyes slide a bit further
   * and the far eye narrows more than the near one.
   */
  look: {
    waves: 4,
    offset: 0.15,
    /**
     * Each half of a look-around (left, then right) = turn + hold + turn
     * back + hold in the centre; shares of the half, sum = 1.
     * At 3.75 s per look-around: turn ≈ 0.5 s, hold ≈ 0.45 s.
     */
    turn: 0.26,
    hold: 0.24,
    /** face slide, ghost.svg units (head is ~66 wide) */
    shift: 6,
    /** extra slide of the eyes on top of the face slide */
    eyeShift: 2,
    /** extra slide of the mouth (less than the eyes: it is lower on the head) */
    mouthShift: 1,
    /** face narrows to 1 − squash */
    squash: 0.1,
    /** far eye narrows to 1 − farEye, near eye to 1 − nearEye */
    farEye: 0.24,
    nearEye: 0.05,
    /** face tilt towards the look, degrees */
    tilt: 2.5,
    /** the head leans towards the look: whole body turns around the tail by ±lean° (no distortion) */
    lean: 2,
  },
  /**
   * "А-а-а": the mouth opens a little and closes again, its own rhythm
   * (3 waves → every 5 s), so it mixes with the look-around without
   * repeating it. Eyes stretch slightly with it.
   */
  mouth: { waves: 3, offset: 0.55, open: 0.32, x: 0.04, y: 0.18, eyes: 0.08 },
} as const;

/** Pivots in the vectors' own units. */
export const PIVOTS = {
  /** centre of mass of ghost.svg — sway and breathing turn around it */
  body: [68.1, 56.8],
  /** middle of the head (glow centre) — the body shape bends and stretches around it */
  head: [76.6, 42],
  /** bottom of the body, between the tail waves — the head leans around it */
  lean: [58, 118],
  /** the face turns around the middle of the head (glow centre, in face.svg units) */
  face: [26.1, 21],
  /** top of the mouth: it opens downwards */
  mouth: [24.5, 30.5],
  /** bottom centre of each eye: eyes stretch upwards and narrow around it */
  eyeLeft: [14.5, 29],
  eyeRight: [41, 28.5],
} as const;

export interface GhostMotion {
  sway: number;
  /** sideways bend of the body under the head, degrees of skew */
  swish: number;
  /** breath value −1 … 1 (drives body stretch) */
  breath: number;
  breathX: number;
  breathY: number;
  /** −1 = looks left, 0 = straight, 1 = looks right (in the ghost's own frame) */
  look: number;
  /** 0 = closed … 1 = "А-а-а" */
  mouth: number;
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const wave = (theta: number, waves: number, offset: number) => Math.sin(rad(theta * waves + offset));
const smoothstep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
/** softer start and end than smoothstep (used for the look-around turns) */
const smootherstep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.min(1, t * t * t * (t * (6 * t - 15) + 10)));
/** position 0…1 inside the current repetition; grows as the ghost flies (θ decreases) */
const cycle = (theta: number, waves: number, offset: number) => {
  const u = (-theta * waves) / 360 + offset;
  return u - Math.floor(u);
};

/** centre → left, hold, back, hold, → right, hold, back, hold */
function lookCurve(u: number): number {
  const { turn: t, hold: h } = MOTION.look;
  const side = u < 0.5 ? -1 : 1;
  const v = (u % 0.5) / 0.5; // 0…1 inside this half
  if (v < t) return side * smootherstep(v / t);
  if (v < t + h) return side;
  if (v < 2 * t + h) return side * (1 - smootherstep((v - t - h) / t));
  return 0;
}

function mouthCurve(u: number): number {
  // a soft bump: opens, holds briefly, closes; closed the rest of the time
  const { open } = MOTION.mouth;
  if (u >= open) return 0;
  const v = u / open;
  return smoothstep(Math.min(v / 0.3, 1)) * (1 - smoothstep((v - 0.6) / 0.4));
}

export function ghostMotion(theta: number): GhostMotion {
  const b = wave(theta, MOTION.breath.waves, MOTION.breath.offset);
  const look = lookCurve(cycle(theta, MOTION.look.waves, MOTION.look.offset));
  return {
    sway: MOTION.sway.amplitude * wave(theta, MOTION.sway.waves, MOTION.sway.offset),
    swish:
      MOTION.shape.swish * wave(theta, MOTION.sway.waves, MOTION.sway.offset - MOTION.shape.lag) -
      MOTION.shape.lookSwish * look,
    breath: b,
    breathX: 1 + MOTION.breath.x * b,
    breathY: 1 + MOTION.breath.y * b,
    look,
    mouth: mouthCurve(cycle(theta, MOTION.mouth.waves, MOTION.mouth.offset)),
  };
}
