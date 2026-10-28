/**
 * Halloween Pumpkin — keyframes. One loop = 3 s = 180 frames at 60 fps.
 *
 *   frame        0 ──── 66 ── 78 ─ 82 ──── 102 ──────────────── 180
 *   pumpkin      rest → inhale peak (1.1 s) ─── slow exhale ──── rest
 *   blink                 66–78 close · 78–82 hold · 82–102 open
 *   mini pumpkin rest ───────────── peak at 90 (1.5 s) ───────── rest
 *   leaf_1       sway ±3.5°, 2 swings per loop
 *   leaf_2       sway ±3°,   2 swings, 0.25 s behind leaf_1
 *   tail         sway ±6°,   1 slow swing per loop, follows the cap
 *   plant        tip bends ±3.5°, 1 slow swing per loop
 *
 *   bat 1        fade in 30–54 · flies up-left · fade out 108–132 · 3 beats/s
 *   bat 2        fade in 46–70 · flies up-left · fade out 124–148 · 3.3 beats/s
 *
 * Every track ends on the value it starts with, so the loop has no jump.
 */
import {
  EASE,
  morphKeys,
  waveKeys,
  waveValueKeys,
  type Key,
  type PathData,
  type Timeline,
} from '../../../shared/animation';
import { EYE_GRADIENTS, pathByGradient } from '../component/pumpkinParts';
import { LAYOUT } from '../component/layout';
import { BAT_FLIGHTS, batAnimation } from './bats';
import { closeEye } from './eyes';
import { bendPlant, PLANT_PARTS, plantPaths } from './plant';

export const FPS = 60;
export const FRAME_COUNT = 180;
export const LOOP_DURATION_MS = (FRAME_COUNT / FPS) * 1000;

/* ---------- pivots (each in its own vector's coordinates) ---------- */

/** Bottom centre of the big pumpkin: it stays planted. */
export const PUMPKIN_PIVOT = [224, 229] as const;
/** Middle of the cap's lower rim. */
export const CAP_PIVOT = [100, 118] as const;
/** Where the tail enters the cap. */
export const TAIL_PIVOT = [54, 77] as const;
/** Leaf bases (start of the central vein), hidden behind the pumpkin. */
export const LEAF1_PIVOT = [22, 25] as const;
export const LEAF2_PIVOT = [13, 17] as const;

/* ---------- amplitudes ---------- */

/** Pumpkin breathing at the peak: +2.6 % height, +1.6 % width. */
const BREATH = { scaleY: 1.026, scaleX: 1.016 };
/** Cap breathing at the peak: +4 % height, +2.4 % width. */
const CAP_BREATH = 0.04;

const BLINK = { closeStart: 66, closed: 78, openStart: 82, open: 102 };

/* ---------- helpers ---------- */

function breath(peakFrame: number, peak: number): Key<number>[] {
  return [
    { f: 0, v: 1, ease: [0.4, 0, 0.6, 1] }, // inhale
    { f: peakFrame, v: peak, ease: [0.45, 0, 0.55, 1] }, // long relaxed exhale
    { f: FRAME_COUNT, v: 1 },
  ];
}

function blink(open: PathData, closed: PathData): Key<PathData>[] {
  return [
    { f: 0, v: open, ease: EASE.linear },
    { f: BLINK.closeStart, v: open, ease: EASE.inFast },
    { f: BLINK.closed, v: closed, ease: EASE.linear },
    { f: BLINK.openStart, v: closed, ease: EASE.outSoft },
    { f: BLINK.open, v: open, ease: EASE.linear },
    { f: FRAME_COUNT, v: open },
  ];
}

const loop = { frames: FRAME_COUNT };

/* ---------- timeline ---------- */

export function createTimeline(sources: { pumpkin: string; plant: string }): Timeline {
  const morphs: Timeline['morphs'] = {};

  // eyes
  const d = (part: keyof typeof EYE_GRADIENTS) => pathByGradient(sources.pumpkin, EYE_GRADIENTS[part]);
  for (const side of ['left', 'right'] as const) {
    const socketD = d(`eye-${side}-socket`);
    const darkD = d(`eye-${side}`);
    const [socketClosed, darkClosed] = closeEye(socketD, darkD);
    const [socketOpen, darkOpen] = morphKeys([{ f: 0, v: socketD }, { f: 0, v: darkD }]).map((k) => k.v);
    morphs[`eye-${side}-socket`] = blink(socketOpen, socketClosed);
    morphs[`eye-${side}`] = blink(darkOpen, darkClosed);
  }

  // plant tip
  const plantSpec = { ...loop, period: 180, phase: 30 };
  plantPaths(sources.plant).forEach((path, i) => {
    morphs[PLANT_PARTS[i]] = waveValueKeys(plantSpec, (s) => bendPlant(path, 3.5 * s));
  });

  // cap breathing: rest at frame 0, peak at frame 90
  const capScale = waveKeys({ ...loop, period: 180, phase: 45 }, CAP_BREATH / 2, 1 + CAP_BREATH / 2);
  const capScaleX = waveKeys({ ...loop, period: 180, phase: 45 }, (CAP_BREATH * 0.6) / 2, 1 + (CAP_BREATH * 0.6) / 2);

  return {
    fps: FPS,
    frames: FRAME_COUNT,
    parts: {
      pumpkin: {
        pivot: PUMPKIN_PIVOT,
        scaleY: breath(66, BREATH.scaleY),
        // width follows a little later — reads as soft, not mechanical
        scaleX: breath(78, BREATH.scaleX),
      },
      miniPumpkin: { pivot: CAP_PIVOT, scaleY: capScale, scaleX: capScaleX },
      tail: { pivot: TAIL_PIVOT, rotate: waveKeys({ ...loop, period: 180, phase: 20 }, 6) },
      leaf_1: { pivot: LEAF1_PIVOT, rotate: waveKeys({ ...loop, period: 90, phase: 0 }, 3.5) },
      leaf_2: { pivot: LEAF2_PIVOT, rotate: waveKeys({ ...loop, period: 90, phase: 15 }, 3) },
      ...batAnimation(1, BAT_FLIGHTS[0], LAYOUT.bats[0].rotate ?? 0, FRAME_COUNT),
      ...batAnimation(2, BAT_FLIGHTS[1], LAYOUT.bats[1].rotate ?? 0, FRAME_COUNT),
    },
    morphs,
  };
}
