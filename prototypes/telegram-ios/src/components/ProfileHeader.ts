import { el, icon } from '../dom';
import { Avatar, type AvatarHandle } from './Avatar';
import { GlassButton } from './GlassButton';
import qrIcon from '../assets/icons/icon-qr.svg';
import searchIcon from '../assets/icons/icon-search.svg';
import starIcon from '../assets/icons/icon-star.svg';
import { LeafPattern } from './LeafPattern';

export interface ProfileInfo {
  name: string;
  phone: string;
  photo: string;
  /** Show the star badge after the name (as in the Figma file). */
  starBadge?: boolean;
}

export interface ProfileHeaderHandle {
  element: HTMLElement;
  /**
   * Blur of the collapsed bar. Must be placed in the screen, outside the
   * header: the header contains blended layers, which makes the browser
   * isolate it, and a blur inside it could not see the cards underneath.
   */
  barBlur: HTMLElement;
  avatar: AvatarHandle;
  /** Follows the scroll position of `scroller` and collapses/expands the header. */
  bindCollapse(scroller: HTMLElement): void;
}

/**
 * Collapse timeline, in points of scroll (Figma frame, safe top 62).
 * Everything depends only on the scroll position, so scrolling back plays
 * the same frames in reverse.
 *
 * - The purple area shrinks one-to-one with the scroll, from 268 to 112, so
 *   the cards stay glued 16 pt below it (no jump at any moment).
 * - The name rides with the content for 141 pt (baseline 231 → 90) while it
 *   scales from 28 to 17 pt; it then stays in the bar, centred on the buttons.
 * - Between 96 and 156 the purple fades into the light blurred bar and the
 *   name and status bar turn from white to black.
 *
 * Disappearing elements (modelled on the reference video):
 * - Leaves (0–85): drawn in towards the avatar, shrink, then fade out —
 *   they are gone before the avatar darkens.
 * - Avatar (0–130): rises one-to-one with the content towards the Dynamic
 *   Island and shrinks; from 35 it blurs, from 45 it darkens to black; its
 *   glow fades first. From 70 a black "liquid" bridge joins it to the island,
 *   and at 112.5 it is centred in the island and gets absorbed (≤ island size).
 *   Without the simulated island (on a phone) it fades out instead.
 * - Phone (10–125): rides with the name and fades out gradually, last of all.
 */
export const COLLAPSE = {
  /** Expanded header height minus collapsed bar height (268 − 112). */
  headerDistance: 156,
  /** How far the name travels: expanded baseline − bar baseline (231 − 90). */
  nameDistance: 141,
  /** Bar title size / expanded name size (17 / 28). */
  nameScale: 17 / 28,
  colorStart: 96,
  colorEnd: 156,
  leaves: { end: 85, move: 0.55, scale: 0.4, fadeFrom: 0.3 },
  avatar: {
    /** Avatar centre (y 142) to Dynamic Island centre (y 29.5). */
    rise: 112.5,
    /** Scale when it reaches the island: 104 × 0.34 = 35 pt < island height 37. */
    scaleAtIsland: 0.34,
    scaleEnd: 0.15,
    absorbedAt: 130,
    blur: { from: 35, to: 95, max: 10 },
    darken: { from: 45, to: 100 },
    glowFadeEnd: 60,
    bridge: { from: 70, to: 95, hideFrom: 122, hideTo: 132 },
    /** Phone mode (no simulated island): fade out instead of being absorbed. */
    deviceFade: { from: 60, to: 120 },
  },
  phone: { from: 10, to: 125 },
} as const;

/** Dynamic Island of the preview frame (DeviceFrame / .device__island). */
const ISLAND = { top: 11, width: 126, height: 37 } as const;
/** Avatar centre in the Figma frame (149 + 52, 90 + 52); also its centre in the leaf pattern. */
const AVATAR_CENTER = { x: 201, y: 142, radius: 52 } as const;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
/** 0 before `a`, 1 after `b`, smooth (no sudden start or stop) in between. */
const smooth = (a: number, b: number, x: number): number => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Top part of the screen. Layers, bottom to top:
 *   (.profile-header__bar-blur  light progressive blur of the bar, a sibling below the header)
 *   .profile-header__surface    profile colour, leaf pattern, avatar, phone (shrinks)
 *   .profile-header__name-row   name + star (moves into the bar)
 *   QR, Search, Edit            glass buttons, always visible and tappable
 * The header lies over the scrolling list; only the buttons catch taps, so
 * scrolling with a finger or the mouse wheel over the header still works.
 */
export function ProfileHeader(profile: ProfileInfo): ProfileHeaderHandle {
  const avatar = Avatar({ src: profile.photo, alt: profile.name });

  const nameRow = el('div', { className: 'profile-header__name-row' }, [
    el('h1', { className: 'profile-header__name', text: profile.name }),
    profile.starBadge ? icon(starIcon, 'profile-header__star') : null,
  ]);

  const pattern = LeafPattern('profile-header__pattern');
  const surface = el('div', { className: 'profile-header__surface' }, [
    el('div', { className: 'profile-header__color' }),
    pattern.element,
    avatar.element,
    el('p', { className: 'profile-header__phone', text: profile.phone }),
  ]);

  const barBlur = el('div', { className: 'profile-header__bar-blur', attrs: { 'aria-hidden': 'true' } });

  // "Liquid" bridge between the avatar and the Dynamic Island: a black copy
  // of the island and a black disc at the avatar's place, blurred together and
  // cut back to a sharp edge (classic metaball / goo filter). Where they come
  // close, their edges flow into each other. Shown only while the avatar is
  // already dark, and only in the preview frame (where the island is drawn).
  const goo = document.createElementNS(SVG_NS, 'svg');
  goo.setAttribute('class', 'profile-header__goo');
  goo.setAttribute('aria-hidden', 'true');
  goo.innerHTML = `<defs><filter id="profile-goo" filterUnits="userSpaceOnUse" x="0" y="-20" width="100%" height="260">
<feGaussianBlur stdDeviation="7"/>
<feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 20 -10"/></filter></defs>
<g filter="url(#profile-goo)" fill="#000"><rect class="goo-island"/><circle class="goo-avatar"/></g>`;
  const gooIsland = goo.querySelector('.goo-island') as SVGRectElement;
  const gooAvatar = goo.querySelector('.goo-avatar') as SVGCircleElement;

  const element = el('header', { className: 'profile-header', attrs: { 'data-component': 'profile-header' } }, [
    surface,
    goo,
    nameRow,
    GlassButton({
      id: 'qr-code',
      label: 'QR Code',
      className: 'profile-header__qr',
      content: icon(qrIcon, 'glass-button__icon'),
    }),
    GlassButton({
      id: 'search',
      label: 'Search',
      className: 'profile-header__search',
      content: icon(searchIcon, 'glass-button__icon'),
    }),
    GlassButton({
      id: 'edit-profile',
      label: 'Edit',
      className: 'profile-header__edit',
      content: el('span', { className: 'glass-button__text', text: 'Edit' }),
    }),
  ]);

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

  // Each leaf gets the vector from its centre to the avatar centre (pattern
  // coordinates), measured once the pattern is on screen.
  let leavesReady = false;
  function prepareLeaves(): void {
    if (leavesReady || !element.isConnected) return;
    const leaves = pattern.prepare();
    if (!leaves) return;
    for (const { leaf, cx, cy } of leaves) {
      leaf.style.setProperty('--dx', (AVATAR_CENTER.x - cx).toFixed(2));
      leaf.style.setProperty('--dy', (AVATAR_CENTER.y - cy).toFixed(2));
    }
    leavesReady = true;
  }

  function apply(scrollTop: number): void {
    prepareLeaves();
    const s = Math.max(0, scrollTop);
    const name = clamp01(s / COLLAPSE.nameDistance);
    const color = clamp01((s - COLLAPSE.colorStart) / (COLLAPSE.colorEnd - COLLAPSE.colorStart));
    const nameK = 1 - (1 - COLLAPSE.nameScale) * name;
    // Leaves
    const leaf = clamp01(s / COLLAPSE.leaves.end);
    const leafMove = smooth(0, 1, leaf);
    // Avatar
    const A = COLLAPSE.avatar;
    const rise = Math.min(s, A.rise);
    const k =
      s <= A.rise
        ? lerp(1, A.scaleAtIsland, smooth(0, A.rise, s))
        : lerp(A.scaleAtIsland, A.scaleEnd, clamp01((s - A.rise) / (A.absorbedAt - A.rise)));
    const blur = A.blur.max * smooth(A.blur.from, A.blur.to, s);
    const brightness = 1 - smooth(A.darken.from, A.darken.to, s);
    const absorbed = s >= A.absorbedAt ? 0 : 1;
    const bridge = smooth(A.bridge.from, A.bridge.to, s) * (1 - smooth(A.bridge.hideFrom, A.bridge.hideTo, s));

    const vars: Record<string, string> = {
      '--collapse-s': String(Math.min(s, COLLAPSE.headerDistance)),
      '--collapse-shift': String(Math.min(s, 400)),
      '--collapse-name-y': String(Math.min(s, COLLAPSE.nameDistance)),
      '--collapse-name-k': nameK.toFixed(4),
      '--collapse-name-p': name.toFixed(4),
      '--collapse-color': color.toFixed(4),
      '--collapse-leaf-m': (leafMove * COLLAPSE.leaves.move).toFixed(4),
      '--collapse-leaf-k': (1 - (1 - COLLAPSE.leaves.scale) * leafMove).toFixed(4),
      '--collapse-leaf-o': (1 - smooth(COLLAPSE.leaves.fadeFrom, 1, leaf)).toFixed(4),
      '--collapse-avatar-y': rise.toFixed(2),
      '--collapse-avatar-k': k.toFixed(4),
      '--collapse-avatar-blur': blur.toFixed(2),
      '--collapse-avatar-bright': brightness.toFixed(4),
      '--collapse-avatar-o': String(absorbed),
      '--collapse-avatar-o-device': (1 - smooth(A.deviceFade.from, A.deviceFade.to, s)).toFixed(4),
      '--collapse-glow-o': (1 - clamp01(s / A.glowFadeEnd)).toFixed(4),
      '--collapse-bridge-o': bridge.toFixed(4),
      '--collapse-phone-o': (1 - clamp01((s - COLLAPSE.phone.from) / (COLLAPSE.phone.to - COLLAPSE.phone.from))).toFixed(4),
    };

    // Goo shapes follow the island and the avatar (header = screen coordinates).
    if (bridge > 0) {
      const width = element.clientWidth || 402;
      const top = element.querySelector<HTMLElement>('.profile-header__qr')?.offsetTop ?? 62;
      gooIsland.setAttribute('x', String(width / 2 - ISLAND.width / 2));
      gooIsland.setAttribute('y', String(ISLAND.top));
      gooIsland.setAttribute('width', String(ISLAND.width));
      gooIsland.setAttribute('height', String(ISLAND.height));
      gooIsland.setAttribute('rx', String(ISLAND.height / 2));
      gooAvatar.setAttribute('cx', String(width / 2));
      gooAvatar.setAttribute('cy', (top + AVATAR_CENTER.y - 62 - rise).toFixed(2));
      gooAvatar.setAttribute('r', (AVATAR_CENTER.radius * k).toFixed(2));
    }
    for (const [key, value] of Object.entries(vars)) element.style.setProperty(key, value);
    barBlur.style.setProperty('--collapse-color', vars['--collapse-color']);
    // Status bar of the preview frame follows the bar colour.
    document.documentElement.style.setProperty('--header-collapse', color.toFixed(4));
    element.classList.toggle('is-collapsed', color >= 1);
    if (themeColor) themeColor.content = color > 0.5 ? '#F2F2F7' : document.documentElement.style.getPropertyValue('--profile-header-solid') || '#9C68CE';
  }

  function bindCollapse(scroller: HTMLElement): void {
    let frame = 0;
    scroller.addEventListener(
      'scroll',
      () => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          apply(scroller.scrollTop);
        });
      },
      { passive: true },
    );
    apply(scroller.scrollTop);
    // Leaves can be measured only once the screen is in the page.
    requestAnimationFrame(() => apply(scroller.scrollTop));
  }

  return { element, barBlur, avatar, bindCollapse };
}
