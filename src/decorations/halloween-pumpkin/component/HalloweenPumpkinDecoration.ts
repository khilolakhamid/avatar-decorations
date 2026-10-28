/**
 * Self-contained Halloween Pumpkin decoration for any web page.
 *
 * It draws ONLY the decoration, on a transparent background. The user's
 * photo is the host page's job: place a round image underneath, using
 * `AVATAR_AREA` (centre 256,256 · radius 218 in the 512 canvas, i.e. a
 * circle 85.2 % of the decoration's width, centred).
 *
 * No framework required. Works in plain HTML, React, Vue, etc.
 */
import { uniquePrefix } from '../../../shared/svg';
import { ASSET_SOURCES } from '../assets';
import { createAnimationController, type AnimationController } from '../animation';
import { buildHalloweenPumpkinSvg } from './composition';

export interface HalloweenPumpkinOptions {
  /** Width = height. A number means pixels; a string is any CSS length. Default: '100%'. */
  size?: number | string;
  /** Initially visible. Default: true. */
  visible?: boolean;
  /** Start animating as soon as it is mounted. Default: true. */
  autoplay?: boolean;
  /** Extra class name(s) on the root <svg>. */
  className?: string;
}

export class HalloweenPumpkinDecoration {
  /** The root <svg> element (transparent, viewBox 0 0 512 512). */
  readonly element: SVGSVGElement;
  private readonly animation: AnimationController;

  constructor(container: Element, options: HalloweenPumpkinOptions = {}) {
    const { size = '100%', visible = true, autoplay = true, className } = options;

    const template = document.createElement('template');
    template.innerHTML = renderHalloweenPumpkinSvg(uniquePrefix('hp'));
    this.element = template.content.firstElementChild as SVGSVGElement;

    this.element.setAttribute('role', 'presentation');
    this.element.setAttribute('aria-hidden', 'true');
    this.element.style.display = 'block';
    this.element.style.pointerEvents = 'none'; // never blocks clicks on the avatar
    this.element.style.background = 'transparent';
    if (className) this.element.setAttribute('class', className);

    this.setSize(size);
    this.setVisible(visible);
    container.appendChild(this.element);
    this.animation = createAnimationController(this.element, autoplay);
  }

  /** Changes the rendered size. The whole composition scales as one piece. */
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

  get visible(): boolean {
    return this.element.style.visibility !== 'hidden';
  }

  play(): void {
    this.animation.play();
  }

  pause(): void {
    this.animation.pause();
  }

  get isPlaying(): boolean {
    return this.animation.isPlaying;
  }

  /** Current frame of the 180-frame loop. */
  get frame(): number {
    return this.animation.frame;
  }

  /** Shows a specific frame (0–179). Useful for previews and thumbnails. */
  seek(frame: number): void {
    this.animation.seek(frame);
  }

  /** Playback speed: 1 = real time, 0.25 = slow motion. */
  setSpeed(speed: number): void {
    this.animation.speed = speed;
  }

  /** Stops the animation and removes the element from the page. */
  destroy(): void {
    this.animation.destroy();
    this.element.remove();
  }
}

/** Convenience: `mountHalloweenPumpkin(el, { size: 128 })`. */
export function mountHalloweenPumpkin(
  container: Element,
  options?: HalloweenPumpkinOptions,
): HalloweenPumpkinDecoration {
  return new HalloweenPumpkinDecoration(container, options);
}

/**
 * Static SVG markup of the decoration (no DOM needed) — for server-side
 * rendering, saving as a file, or feeding an exporter.
 */
export function renderHalloweenPumpkinSvg(idPrefix = 'hp-'): string {
  return buildHalloweenPumpkinSvg(ASSET_SOURCES, { idPrefix });
}
