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
export declare const MOTION: {
    /** body sway (tilt) around the body's centre, ±degrees; 6 waves → 2.5 s */
    readonly sway: {
        readonly amplitude: 4;
        readonly waves: 6;
        readonly offset: 0;
    };
    /**
     * Body shape only (the face is not affected), around the head so the
     * head stays steady and the lower body / tail does the moving:
     *   • tail swish — the body is skewed sideways around the head, the
     *     tail tips travel ~±10 units; same rhythm as the sway but lagging
     *     behind it (follow-through), plus a little the opposite way of the
     *     look so body and face read as one character;
     *   • stretch — the body lengthens / shortens downwards with the breath.
     */
    readonly shape: {
        readonly swish: 6;
        readonly lag: 75;
        readonly lookSwish: 3;
        readonly stretchX: -0.02;
        readonly stretchY: 0.045;
    };
    /** breathing: scale of the body (x, y) around its centre; 8 waves → 1.875 s */
    readonly breath: {
        readonly x: 0.02;
        readonly y: 0.035;
        readonly waves: 8;
        readonly offset: 40;
    };
    /**
     * Looking around: centre → left (hold) → centre (hold) → right (hold) → …
     * 4 waves → one look-around every 3.75 s; each turn takes ~0.37 s.
     * A turned head is faked on the flat drawing: the face slides towards
     * the look, gets narrower, tilts a little; the eyes slide a bit further
     * and the far eye narrows more than the near one.
     */
    readonly look: {
        readonly waves: 4;
        readonly offset: 0.15;
        /**
         * Each half of a look-around (left, then right) = turn + hold + turn
         * back + hold in the centre; shares of the half, sum = 1.
         * At 3.75 s per look-around: turn ≈ 0.5 s, hold ≈ 0.45 s.
         */
        readonly turn: 0.26;
        readonly hold: 0.24;
        /** face slide, ghost.svg units (head is ~66 wide) */
        readonly shift: 6;
        /** extra slide of the eyes on top of the face slide */
        readonly eyeShift: 2;
        /** extra slide of the mouth (less than the eyes: it is lower on the head) */
        readonly mouthShift: 1;
        /** face narrows to 1 − squash */
        readonly squash: 0.1;
        /** far eye narrows to 1 − farEye, near eye to 1 − nearEye */
        readonly farEye: 0.24;
        readonly nearEye: 0.05;
        /** face tilt towards the look, degrees */
        readonly tilt: 2.5;
        /** the head leans towards the look: whole body turns around the tail by ±lean° (no distortion) */
        readonly lean: 2;
    };
    /**
     * "А-а-а": the mouth opens a little and closes again, its own rhythm
     * (3 waves → every 5 s), so it mixes with the look-around without
     * repeating it. Eyes stretch slightly with it.
     */
    readonly mouth: {
        readonly waves: 3;
        readonly offset: 0.55;
        readonly open: 0.32;
        readonly x: 0.04;
        readonly y: 0.18;
        readonly eyes: 0.08;
    };
};
/** Pivots in the vectors' own units. */
export declare const PIVOTS: {
    /** centre of mass of ghost.svg — sway and breathing turn around it */
    readonly body: readonly [68.1, 56.8];
    /** middle of the head (glow centre) — the body shape bends and stretches around it */
    readonly head: readonly [76.6, 42];
    /** bottom of the body, between the tail waves — the head leans around it */
    readonly lean: readonly [58, 118];
    /** the face turns around the middle of the head (glow centre, in face.svg units) */
    readonly face: readonly [26.1, 21];
    /** top of the mouth: it opens downwards */
    readonly mouth: readonly [24.5, 30.5];
    /** bottom centre of each eye: eyes stretch upwards and narrow around it */
    readonly eyeLeft: readonly [14.5, 29];
    readonly eyeRight: readonly [41, 28.5];
};
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
export declare function ghostMotion(theta: number): GhostMotion;
