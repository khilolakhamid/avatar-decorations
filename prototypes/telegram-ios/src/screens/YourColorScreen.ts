import { el, icon } from '../dom';
import { Avatar } from '../components/Avatar';
import { GlassButton, glassSurface } from '../components/GlassButton';
import { parsePalette, plusDarker, previewBackground, previewColor, statusColor, type Swatch } from '../color/profileColor';
import { LeafPattern } from '../components/LeafPattern';
import { SparkleEffect, type SparkleHandle } from '../components/SparkleEffect';
import { PROFILE } from './settings.data';
import { DecorationCarousel, type CarouselHandle } from '../components/DecorationCarousel';
import { DECORATIONS } from '../decor/catalog';
import { profileStyle } from '../state/profileStyle';
import { profileColor, DEFAULT_SWATCH } from '../state/profileColor';
import paletteSvg from '../assets/your-color/Icons_Container.svg';
import chevronIcon from '../assets/icons/chevron.svg';
import starIcon from '../assets/icons/icon-star.svg';
import mapleIcon from '../assets/your-color/Maple.svg';

/**
 * Telegram iOS → Settings → Edit → Your Color (state "Profile" only).
 *
 *   .screen--your-color
 *   ├── .screen__scroll
 *   │   ├── card: purple preview (avatar, worn decoration, next decoration on the right,
 *   │   │         name ★, online) + palette + "Add Icons To Profile"
 *   │   ├── footnote (Change ›)
 *   │   └── card: Reset Profile Color
 *   ├── top blur (same as the other screens)
 *   └── bar: back button, Profile | Name segmented control
 *
 * Geometry is measured on the reference screenshot (393 × 852) and placed like
 * the other screens (reference y − 2, buttons at the safe-area top). The "Use a
 * gift" section of the reference is intentionally left out.
 *
 * Palette: the user's Icons_Container.svg is shown unchanged; a transparent
 * button lies over each circle. Selection: the stored profile colour
 * (state/profileColor.ts), by default the blue circle, 1st in the first row. Emits `prototype:action` { type: 'button', id: 'color-back' | … }.
 */
const BACK_ICON = `<svg width="11" height="19" viewBox="0 0 11 19" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M9.6 1.4 1.6 9.5l8 8.1"/></svg>`;
const LINK_CHEVRON = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l5 5-5 5"/></svg>`;

/**
 * Side slot of the decoration carousel, pt: every decoration's whole
 * animation fits this square at the sides (was 100; −22 % on request).
 */
export const PREVIEW_SLOT_SIZE = 78;

/** Default colour: blue, the first swatch of the first row (state/profileColor.ts). */
export { DEFAULT_SWATCH } from '../state/profileColor';

export interface YourColorHandle {
  element: HTMLElement;
  selected(): number;
  select(index: number): void;
  decorations: CarouselHandle;
  sparkles: SparkleHandle;
}

export function YourColorScreen(): YourColorHandle {
  const swatches = parsePalette(paletteSvg);
  const avatar = Avatar({ src: PROFILE.photo, alt: PROFILE.name });

  const status = el('p', { className: 'color-preview__status', text: 'online' });
  // Background leaves: the same pattern component as the Settings header,
  // placed so its avatar point lands on this avatar (behind everything else).
  const leaves = LeafPattern('color-preview__pattern');
  const preview = el('div', { className: 'color-preview', attrs: { 'data-component': 'color-preview' } }, [
    leaves.element,
    avatar.element,
    el('div', { className: 'color-preview__name-row' }, [
      el('span', { className: 'color-preview__name', text: PROFILE.name }),
      PROFILE.starBadge ? icon(starIcon, 'color-preview__star') : null,
    ]),
    status,
  ]);

  // Avatar decorations: infinite carousel (previous on the left, selected on
  // the avatar, next on the right). Opens on "None": Cat Ears on the left,
  // Ghost Orbit on the right.
  // Sparkles when a real decoration lands on the avatar (by its kind, not its
  // position); None gets none and stops a running burst.
  const sparkles = SparkleEffect(avatar.element);
  const decorations: CarouselHandle = DecorationCarousel({
    items: DECORATIONS,
    host: preview,
    avatarLayer: avatar.decorationLayer,
    avatarElement: avatar.element,
    photoDiameter: avatar.size,
    previewSlotSize: PREVIEW_SLOT_SIZE,
    gutter: 8,
    // Opens on the applied decoration (stable id → catalogue position).
    initial: Math.max(0, DECORATIONS.findIndex((d) => d.id === profileStyle.decoration)),
    // Fires once per finished switch (not per swipe frame).
    onChange: (_index, entry) => {
      if (entry.kind === 'none') sparkles.clear();
      else sparkles.play();
      syncApply();
    },
  });
  preview.append(decorations.element, sparkles.element);

  // Palette: the SVG as-is + one transparent button per circle.
  const palette = el('div', { className: 'color-palette', attrs: { role: 'radiogroup', 'aria-label': 'Profile color' } }, [
    el('div', { className: 'color-palette__art', html: paletteSvg, attrs: { 'aria-hidden': 'true' } }),
  ]);
  const buttons = swatches.map((swatch: Swatch) => {
    const button = el('button', {
      className: 'color-swatch',
      attrs: {
        type: 'button',
        role: 'radio',
        'aria-checked': 'false',
        'aria-label': `Color ${swatch.index + 1}`,
        'data-swatch': String(swatch.index),
      },
    });
    button.style.left = `${swatch.cx - swatch.r}px`;
    button.style.top = `${swatch.cy - swatch.r}px`;
    button.style.width = button.style.height = `${swatch.r * 2}px`;
    palette.append(button);
    return button;
  });

  let current = -1;
  function select(index: number): void {
    const swatch = swatches[index];
    if (!swatch || index === current) return;
    buttons.forEach((b, i) => {
      b.classList.toggle('is-selected', i === index);
      b.setAttribute('aria-checked', String(i === index));
    });
    preview.style.background = previewBackground(swatch);
    preview.style.setProperty('--preview-pattern', plusDarker(previewColor(swatch.colors[0])));
    status.style.color = statusColor(swatch.colors[swatch.colors.length - 1]);
    current = index;
    profileColor.select(index); // the selected colour is app state (kept across screens / reloads)
  }
  palette.addEventListener('click', (event) => {
    const b = (event.target as HTMLElement).closest<HTMLElement>('[data-swatch]');
    if (b) select(Number(b.dataset.swatch));
  });
  select(profileColor.swatch);

  const addIcons = el('button', { className: 'settings-row color-row', attrs: { type: 'button', 'data-row': 'add-icons-to-profile' } }, [
    el('span', { className: 'color-row__separator', attrs: { 'aria-hidden': 'true' } }),
    el('span', { className: 'settings-row__title', text: 'Add Icons To Profile' }),
    // The user's Maple.svg, unchanged; tinted purple in CSS (.color-row__icon).
    icon(mapleIcon, 'color-row__icon'),
    icon(chevronIcon, 'settings-row__chevron'),
  ]);

  const card = el('section', { className: 'settings-group color-card', attrs: { 'data-group': 'your-color' } }, [preview, palette, addIcons]);

  const note = el('p', { className: 'edit-footnote', attrs: { 'data-lines': '2' } }, [
    document.createTextNode('You can change the color of your name and customize'),
    el('br'),
    document.createTextNode('replies to you. '),
    el('button', { className: 'edit-footnote__link', attrs: { type: 'button', 'data-action': 'name-color' } }, [
      document.createTextNode('Change'),
      icon(LINK_CHEVRON, 'edit-footnote__chevron'),
    ]),
  ]);

  const reset = el('section', { className: 'settings-group', attrs: { 'data-group': 'reset-color' } }, [
    el('button', { className: 'edit-action edit-action--accent edit-action--start', attrs: { type: 'button', 'data-action': 'reset-color' } }, [
      el('span', { className: 'edit-action__text', text: 'Reset Profile Color' }),
    ]),
  ]);

  const content = el('div', { className: 'your-color__content' }, [card, note, reset]);
  const scroll = el('div', { className: 'screen__scroll' }, [content]);

  const topBlur = el('div', { className: 'profile-header__bar-blur', attrs: { 'aria-hidden': 'true' } });
  topBlur.style.setProperty('--collapse-color', '0');
  scroll.addEventListener(
    'scroll',
    () => topBlur.style.setProperty('--collapse-color', Math.min(1, Math.max(0, scroll.scrollTop / 40)).toFixed(3)),
    { passive: true },
  );

  // Segmented control: Profile (selected) | Name — only the Profile state exists for now.
  const segmented = el('div', { className: 'segmented', attrs: { role: 'tablist', 'aria-label': 'Color for' } }, [
    glassSurface(),
    el('span', { className: 'segmented__thumb', attrs: { 'aria-hidden': 'true' } }),
    el('button', { className: 'segmented__item is-selected', attrs: { type: 'button', role: 'tab', 'aria-selected': 'true', 'data-action': 'segment-profile' } }, [
      el('span', { className: 'segmented__text', text: 'Profile' }),
    ]),
    el('button', { className: 'segmented__item', attrs: { type: 'button', role: 'tab', 'aria-selected': 'false', 'data-action': 'segment-name' } }, [
      el('span', { className: 'segmented__text', text: 'Name' }),
    ]),
  ]);

  const bar = el('div', { className: 'edit-profile__bar' }, [
    GlassButton({ id: 'color-back', label: 'Back', className: 'your-color__back', content: icon(BACK_ICON, 'glass-button__icon') }),
    segmented,
  ]);

  // Apply Style: shown only while the decoration on the avatar (preview
  // selection) differs from the saved one — compared by stable id, never by
  // carousel position. Colour changes do not show it. Tapping it saves the
  // preview and the app returns to Settings (main.ts, 'apply-style').
  const applyButton = el('button', { className: 'apply-style', attrs: { type: 'button', 'data-action': 'apply-style' } }, [
    el('span', { className: 'apply-style__text', text: 'Apply Style' }),
  ]);
  const applyBar = el('div', { className: 'apply-bar' }, [applyButton]);
  const syncApply = (): void => {
    const changed = decorations.previewId() !== profileStyle.decoration;
    applyBar.classList.toggle('is-visible', changed);
    applyButton.tabIndex = changed ? 0 : -1;
    applyBar.setAttribute('aria-hidden', String(!changed));
  };
  applyButton.addEventListener('click', () => {
    if (decorations.previewId() === profileStyle.decoration) return;
    profileStyle.apply(decorations.previewId());
    syncApply();
  });
  syncApply();

  const element = el('main', { className: 'screen screen--your-color', attrs: { 'data-screen': 'your-color' } }, [scroll, topBlur, bar, applyBar]);

  element.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-row]');
    if (!target) return;
    if (target.dataset.action === 'reset-color') select(DEFAULT_SWATCH);
    const detail = target.dataset.row ? { type: 'row', id: target.dataset.row } : { type: 'button', id: target.dataset.action };
    element.dispatchEvent(new CustomEvent('prototype:action', { detail, bubbles: true }));
  });

  // Leaf paleness is measured once the screen is on screen (as on Settings).
  let tries = 0;
  const prepareLeaves = (): void => {
    if (!leaves.prepare() && ++tries < 120) requestAnimationFrame(prepareLeaves);
  };
  requestAnimationFrame(prepareLeaves);

  // Stop the animations when the screen is closed (Navigator → screen:dispose).
  element.addEventListener(
    'screen:dispose',
    () => {
      sparkles.destroy();
      decorations.destroy();
    },
    { once: true },
  );

  return { element, selected: () => current, select, decorations, sparkles };
}
