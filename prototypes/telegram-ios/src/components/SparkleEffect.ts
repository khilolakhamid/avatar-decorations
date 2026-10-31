import { el } from '../dom';
import starSvg from '../assets/your-color/star.svg';

/**
 * Sparkle burst around the avatar ("a new decoration appeared!").
 *
 * A separate decorative layer of the prototype — nothing is added to the
 * decorations' own SVGs, so it works for any current or future decoration.
 *
 *   play()  — one burst: 6 four-point stars (the user's star.svg, unchanged)
 *             light up one after another (0–1.05 s), each fading in and growing,
 *             shining for a moment with a soft pulse, then shrinking and
 *             fading out; ~2.1 s in all. A new play()
 *             replaces a running burst (no piling up).
 *   clear() — removes a running burst at once (used when None is selected).
 *
 * Stars land on the decoration around and over the photo (0.6–1.12 × its
 * radius) — never as low as the name, status or palette — with a little
 * random jitter so bursts don't look stamped. The layer never
 * catches taps or swipes. With prefers-reduced-motion nothing is shown.
 */
const STARS: ReadonlyArray<{ angle: number; r: number; size: number; delay: number; peak: number }> = [
  // Like the reference: small (6–8 pt), right on the decoration — its top,
  // sides and over its details — a few of them paler.
  { angle: -125, r: 0.95, size: 8, delay: 0, peak: 1 },
  { angle: -40, r: 0.92, size: 6, delay: 180, peak: 0.55 },
  { angle: 25, r: 0.75, size: 7.5, delay: 420, peak: 1 },
  { angle: 150, r: 0.62, size: 7, delay: 650, peak: 1 },
  { angle: 70, r: 0.95, size: 6.5, delay: 840, peak: 0.6 },
  { angle: -82, r: 1.12, size: 5.5, delay: 1050, peak: 0.8 },
];

// One star: fades in and grows ~320 ms, shines ~280 ms (soft pulse), shrinks
// and fades ~520 ms. Stars start one after another (0 / 180 / 420 / 650 / 840 /
// 1050 ms, ±30 ms each run): they overlap, but never all shine at once.
const STAR_MS = 1120;
const JITTER_MS = 60;
export const SPARKLE_TOTAL_MS = Math.max(...STARS.map((s) => s.delay)) + JITTER_MS / 2 + STAR_MS;

export interface SparkleHandle {
  element: HTMLElement;
  play(): void;
  clear(): void;
  /** Number of bursts started so far (for tests). */
  readonly bursts: number;
  destroy(): void;
}

export function SparkleEffect(avatarElement: HTMLElement, random: () => number = Math.random): SparkleHandle {
  const element = el('div', { className: 'sparkle-layer', attrs: { 'aria-hidden': 'true' } });
  let bursts = 0;
  let timer = 0;

  function clear(): void {
    window.clearTimeout(timer);
    element.replaceChildren();
  }

  function play(): void {
    clear();
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    bursts++;
    const cx = avatarElement.offsetLeft + avatarElement.offsetWidth / 2;
    const cy = avatarElement.offsetTop + avatarElement.offsetHeight / 2;
    const R = avatarElement.offsetWidth / 2;
    for (const s of STARS) {
      const angle = ((s.angle + (random() - 0.5) * 14) * Math.PI) / 180;
      const r = R * (s.r + (random() - 0.5) * 0.06);
      const star = el('span', { className: 'sparkle', html: starSvg });
      star.style.left = `${(cx + r * Math.cos(angle)).toFixed(1)}px`;
      star.style.top = `${(cy + r * Math.sin(angle)).toFixed(1)}px`;
      star.style.setProperty('--s', `${s.size}px`);
      const delay = s.delay === 0 ? 0 : Math.round(s.delay + (random() - 0.5) * JITTER_MS);
      star.style.setProperty('--d', `${delay}ms`);
      star.style.setProperty('--t', `${STAR_MS}ms`);
      star.style.setProperty('--o', String(s.peak));
      element.append(star);
    }
    element.dataset.bursts = String(bursts);
    timer = window.setTimeout(() => element.replaceChildren(), SPARKLE_TOTAL_MS + 40);
  }

  return {
    element,
    play,
    clear,
    get bursts() {
      return bursts;
    },
    destroy: clear,
  };
}
