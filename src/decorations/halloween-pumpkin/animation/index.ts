/**
 * Animation of the Halloween Pumpkin decoration.
 *
 * Version 1.0.0 (approved for the web): pumpkin breathing, blink, leaves,
 * cap, tail, plant and two bats. Keyframes live in ./timeline.ts.
 *
 * Only TGS-compatible operations are used (see shared/animation).
 */
import { TimelinePlayer, validateTimeline } from '../../../shared/animation';
import { ASSET_SOURCES } from '../assets';
import { createTimeline } from './timeline';

export { FPS, FRAME_COUNT, LOOP_DURATION_MS } from './timeline';

export interface AnimationController {
  play(): void;
  pause(): void;
  readonly isPlaying: boolean;
  /** Current frame, 0 … 179.99 */
  readonly frame: number;
  seek(frame: number): void;
  /** Playback speed (1 = real time). */
  speed: number;
  destroy(): void;
}

export function createAnimationController(
  svg: SVGSVGElement,
  autoplay: boolean,
): AnimationController {
  const timeline = createTimeline(ASSET_SOURCES);
  const problems = validateTimeline(timeline);
  if (problems.length) throw new Error(`Halloween Pumpkin timeline: ${problems.join('; ')}`);
  const player = new TimelinePlayer(svg, timeline);
  if (autoplay) player.play();
  return {
    play: () => player.play(),
    pause: () => player.pause(),
    get isPlaying() {
      return player.isPlaying;
    },
    get frame() {
      return player.currentFrame;
    },
    seek: (f) => player.seek(f),
    get speed() {
      return player.speed;
    },
    set speed(v: number) {
      player.speed = v;
    },
    destroy: () => player.destroy(),
  };
}
