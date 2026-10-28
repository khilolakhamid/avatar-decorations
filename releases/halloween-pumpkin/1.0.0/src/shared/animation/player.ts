/**
 * Plays a Timeline on an SVG element tree by writing attributes each
 * frame. One shared requestAnimationFrame loop drives every player on the
 * page, so many decorations cost one callback per frame.
 */
import { serializePath, type PathData } from './path';
import {
  DEFAULTS,
  lerpNumber,
  lerpPath,
  sample,
  TRANSFORM_PROPS,
  type PartAnimation,
  type Timeline,
} from './timeline';

/* ---------- shared ticker ---------- */

type Tick = (now: number) => void;
const subscribers = new Set<Tick>();
let rafId = 0;

function loop(now: number) {
  subscribers.forEach((fn) => fn(now));
  rafId = subscribers.size ? requestAnimationFrame(loop) : 0;
}
function subscribe(fn: Tick) {
  subscribers.add(fn);
  if (!rafId) rafId = requestAnimationFrame(loop);
}
function unsubscribe(fn: Tick) {
  subscribers.delete(fn);
}

/* ---------- player ---------- */

interface CompiledPart {
  el: SVGElement;
  anim: PartAnimation;
}
interface CompiledMorph {
  el: SVGPathElement;
  keys: Timeline['morphs'][string];
}

export class TimelinePlayer {
  private parts: CompiledPart[] = [];
  private morphs: CompiledMorph[] = [];
  private frame = 0;
  private lastNow: number | null = null;
  private playing = false;
  /** Playback speed multiplier (1 = real time). */
  speed = 1;
  private readonly tick: Tick = (now) => {
    if (this.lastNow !== null) {
      const dt = (now - this.lastNow) / 1000;
      this.frame = (this.frame + dt * this.timeline.fps * this.speed) % this.timeline.frames;
    }
    this.lastNow = now;
    this.render(this.frame);
  };

  constructor(root: Element, readonly timeline: Timeline) {
    const find = (name: string) => root.querySelector<SVGElement>(`[data-part="${CSS.escape(name)}"]`);
    for (const [name, anim] of Object.entries(timeline.parts)) {
      const el = find(name);
      if (!el) throw new Error(`TimelinePlayer: no element with data-part="${name}"`);
      this.parts.push({ el, anim });
    }
    for (const [name, keys] of Object.entries(timeline.morphs)) {
      const el = find(name);
      if (!(el instanceof SVGPathElement)) throw new Error(`TimelinePlayer: data-part="${name}" is not a <path>`);
      this.morphs.push({ el, keys });
    }
    this.render(0);
  }

  get isPlaying() {
    return this.playing;
  }
  get currentFrame() {
    return this.frame;
  }

  play() {
    if (this.playing) return;
    this.playing = true;
    this.lastNow = null;
    subscribe(this.tick);
  }

  pause() {
    this.playing = false;
    unsubscribe(this.tick);
  }

  /** Jumps to a frame (keeps playing if it was playing). */
  seek(frame: number) {
    const n = this.timeline.frames;
    this.frame = ((frame % n) + n) % n;
    this.lastNow = null;
    this.render(this.frame);
  }

  destroy() {
    this.pause();
  }

  /** Writes the state of one frame into the SVG. */
  render(frame: number) {
    for (const { el, anim } of this.parts) {
      const v = { ...DEFAULTS };
      for (const prop of TRANSFORM_PROPS) {
        const keys = anim[prop];
        if (keys) v[prop] = sample(keys, frame, lerpNumber);
      }
      const [px, py] = anim.pivot ?? [0, 0];
      // same order as a Lottie layer: position, rotation, scale, minus anchor
      el.setAttribute(
        'transform',
        `translate(${r(px + v.x)} ${r(py + v.y)}) rotate(${r(v.rotate)}) scale(${r(v.scaleX, 5)} ${r(v.scaleY, 5)}) translate(${r(-px)} ${r(-py)})`,
      );
      if (anim.opacity) el.setAttribute('opacity', String(r(v.opacity, 4)));
    }
    for (const { el, keys } of this.morphs) {
      el.setAttribute('d', serializePath(sample<PathData>(keys, frame, lerpPath), 3));
    }
  }
}

const r = (n: number, digits = 3) => Math.round(n * 10 ** digits) / 10 ** digits;
