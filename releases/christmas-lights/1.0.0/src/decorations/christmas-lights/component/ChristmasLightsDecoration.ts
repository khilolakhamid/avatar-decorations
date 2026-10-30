/**
 * Christmas Lights decoration for any web page (no framework required).
 * Draws only the garland on a transparent background; the user's photo
 * is placed underneath by the host page (see AVATAR_AREA).
 *
 * Animation: a seamless 3-second loop. Every frame all changing attributes
 * (the turn and sway of each bulb, the glow of each light, the sparkles,
 * the wire) are recomputed from the loop progress (component/composition.ts
 * → garlandFrame), so the drawing at any moment is exactly the static drawing
 * renderChristmasLightsSvg(…, progress) for that moment.
 */
import { uniquePrefix } from '../../../shared/svg';
import { ASSET_SOURCES } from '../assets';
import { buildChristmasLightsSvg, garlandFrame } from './composition';

/** Loop: strictly 3 s = 180 frames at 60 fps. */
export const LOOP_DURATION_MS = 3000;
export const FPS = 60;
export const FRAME_COUNT = 180;

export interface ChristmasLightsOptions {
  /** Width = height. Number = pixels, string = any CSS length. Default '100%'. */
  size?: number | string;
  visible?: boolean;
  autoplay?: boolean;
  className?: string;
  /** Playback speed multiplier (1 = normal). Default 1. */
  speed?: number;
}

export class ChristmasLightsDecoration {
  readonly element: SVGSVGElement;
  private playing = false;
  private destroyed = false;
  private speed: number;
  /** loop progress 0…1 */
  private phase = 0;
  private lastTime: number | null = null;
  private rafId = 0;
  private readonly parts = new Map<string, Element>();

  constructor(container: Element, options: ChristmasLightsOptions = {}) {
    const { size = '100%', visible = true, autoplay = true, className, speed = 1 } = options;
    this.speed = speed;
    const template = document.createElement('template');
    template.innerHTML = buildChristmasLightsSvg(ASSET_SOURCES, { idPrefix: uniquePrefix('cl') });
    this.element = template.content.firstElementChild as SVGSVGElement;
    this.element.setAttribute('role', 'presentation');
    this.element.setAttribute('aria-hidden', 'true');
    this.element.style.display = 'block';
    this.element.style.pointerEvents = 'none';
    this.element.style.background = 'transparent';
    if (className) this.element.setAttribute('class', className);
    this.element.querySelectorAll('[data-part]').forEach((el) => this.parts.set(el.getAttribute('data-part')!, el));
    this.setSize(size);
    this.setVisible(visible);
    container.appendChild(this.element);
    if (autoplay) this.play();
  }

  setSize(size: number | string): void {
    const css = typeof size === 'number' ? `${size}px` : size;
    this.element.style.width = css;
    this.element.style.height = css;
  }
  show(): void {
    this.setVisible(true);
  }
  hide(): void {
    this.setVisible(false);
  }
  setVisible(visible: boolean): void {
    this.element.style.visibility = visible ? 'visible' : 'hidden';
  }
  play(): void {
    if (this.playing || this.destroyed) return;
    this.playing = true;
    this.lastTime = null;
    this.rafId = requestAnimationFrame(this.tick);
  }
  pause(): void {
    this.playing = false;
    cancelAnimationFrame(this.rafId);
  }
  get isPlaying(): boolean {
    return this.playing;
  }
  setSpeed(speed: number): void {
    this.speed = speed;
  }
  /** Shows frame 0…179 of the loop (keeps playing or paused). */
  seek(frame: number): void {
    const p = frame / FRAME_COUNT;
    this.phase = ((p % 1) + 1) % 1;
    this.render();
  }
  /** Current frame 0…179. */
  get frame(): number {
    return Math.floor(this.phase * FRAME_COUNT) % FRAME_COUNT;
  }
  /** Current loop progress 0…1. */
  get progress(): number {
    return this.phase;
  }
  destroy(): void {
    this.pause();
    this.destroyed = true;
    this.element.remove();
  }

  private readonly tick = (now: number): void => {
    if (!this.playing) return;
    if (this.lastTime !== null) {
      this.phase = (this.phase + ((now - this.lastTime) * this.speed) / LOOP_DURATION_MS) % 1;
    }
    this.lastTime = now;
    this.render();
    this.rafId = requestAnimationFrame(this.tick);
  };

  private render(): void {
    const frame = garlandFrame(this.phase);
    for (const [part, attrs] of Object.entries(frame)) {
      const el = this.parts.get(part);
      if (el) for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    }
  }
}

export function mountChristmasLights(container: Element, options?: ChristmasLightsOptions): ChristmasLightsDecoration {
  return new ChristmasLightsDecoration(container, options);
}

/**
 * Static SVG markup (no DOM needed) at loop progress `progress` (0…1).
 * progress 1 draws exactly the same picture as progress 0.
 */
export function renderChristmasLightsSvg(idPrefix = 'cl-', progress = 0): string {
  return buildChristmasLightsSvg(ASSET_SOURCES, { idPrefix, progress });
}
