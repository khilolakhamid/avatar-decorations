import { DECORATIONS, decorationSizeFor, type DecorationInstance } from './catalog';
import { profileStyle } from '../state/profileStyle';
import type { AvatarHandle } from '../components/Avatar';

/**
 * Shows the APPLIED decoration (profileStyle) on an avatar — used by the
 * Settings header. Same catalogue entry and mount() as the carousel, same
 * placement (the decoration's photo circle on the photo), so it looks exactly
 * like the centre of the Your Color carousel. 'none' mounts nothing.
 *
 * Re-mounts when another decoration is applied. While `screen` is covered by
 * another screen (Navigator marks it .is-covered) the animation is paused.
 */
export function AppliedDecoration(avatar: AvatarHandle, screen: HTMLElement): { destroy(): void } {
  const layer = avatar.decorationLayer;
  let instance: DecorationInstance | null = null;

  function show(id: string): void {
    instance?.destroy();
    instance = null;
    layer.replaceChildren();
    layer.dataset.decoration = id;
    const entry = DECORATIONS.find((d) => d.id === id);
    if (!entry || entry.kind === 'none') {
      avatar.element.style.removeProperty('--avatar-decoration-size');
      return;
    }
    const size = decorationSizeFor(entry, avatar.size);
    avatar.element.style.setProperty('--avatar-decoration-size', `${size.toFixed(3)}px`);
    instance = entry.mount(layer, '100%');
    // Photo circle centre → photo centre (all current releases: canvas centre).
    const k = size / entry.canvas;
    const off = entry.avatarOffset ?? { x: 0, y: 0 };
    const dx = -(entry.avatarArea.cx - entry.canvas / 2 + off.x) * k;
    const dy = -(entry.avatarArea.cy - entry.canvas / 2 + off.y) * k;
    if (dx || dy) instance.element.style.translate = `${dx}px ${dy}px`;
    instance.element.style.overflow = 'visible';
    syncPlaying();
  }

  function syncPlaying(): void {
    if (!instance) return;
    if (screen.classList.contains('is-covered')) instance.pause();
    else instance.play();
  }

  const unsubscribe = profileStyle.subscribe(show);
  const observer = new MutationObserver(syncPlaying);
  observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
  show(profileStyle.decoration);

  return {
    destroy() {
      unsubscribe();
      observer.disconnect();
      instance?.destroy();
      instance = null;
      layer.replaceChildren();
    },
  };
}
