import { el, icon } from '../dom';
import { GlassButton } from '../components/GlassButton';
import { SettingsGroup, SettingsRow } from '../components/SettingsGroup';
import { BIRTHDAY_ROW, EDIT_PROFILE, profileRows } from './editProfile.data';
import { PROFILE } from './settings.data';

/**
 * Telegram iOS → Settings → Edit (Edit Profile).
 *
 *   .screen--edit-profile
 *   ├── .screen__scroll           everything below scrolls: photo, fields, cards
 *   ├── .profile-header__bar-blur  the same light top blur as the collapsed Settings bar
 *   └── .edit-profile__bar        × (close) and ✓ (done) — always visible
 *
 * Geometry is measured on the reference screenshots (393 × 852 pt) and placed
 * relative to the safe area so the × / ✓ buttons sit exactly where the QR /
 * Edit buttons of Settings are (reference y − 2 in the 402 × 874 frame).
 * Reuses the prototype's cards, rows, glass buttons, colours and type.
 *
 * Emits `prototype:action` with { type: 'button', id: 'edit-close' | 'edit-done' | … }.
 */
const CLOSE_ICON = `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg"><path d="M1.5 1.5l15 15M16.5 1.5l-15 15"/></svg>`;
const DONE_ICON = `<svg width="21" height="18" viewBox="0 0 21 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M1.6 9.6l6 6.4L19.4 1.6"/></svg>`;
const LINK_CHEVRON = `<svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M1 1l5 5-5 5"/></svg>`;

export interface EditProfileHandle {
  element: HTMLElement;
  /** Values typed into the fields (for a future "save"). */
  values(): { firstName: string; lastName: string; bio: string };
}

function footnote(text: string | (string | Node)[], lines = 1): HTMLElement {
  const p = el('p', { className: 'edit-footnote' });
  if (typeof text === 'string') p.textContent = text;
  else p.append(...text);
  p.dataset.lines = String(lines);
  return p;
}

function inputRow(name: string, placeholder: string, value: string): { row: HTMLElement; input: HTMLInputElement } {
  const input = el('input', {
    className: 'edit-field__input',
    attrs: { type: 'text', name, placeholder, 'aria-label': placeholder, autocomplete: 'off', spellcheck: 'false' },
  });
  input.value = value;
  return { row: el('label', { className: 'edit-field' }, [input]), input };
}

function actionCard(id: string, text: string, tone: 'accent' | 'danger'): HTMLElement {
  return el('section', { className: 'settings-group', attrs: { 'data-group': id } }, [
    el('button', { className: `edit-action edit-action--${tone}`, attrs: { type: 'button', 'data-action': id } }, [
      el('span', { className: 'edit-action__text', text }),
    ]),
  ]);
}

export function EditProfileScreen(): EditProfileHandle {
  const first = inputRow('first-name', 'First Name', EDIT_PROFILE.firstName);
  const last = inputRow('last-name', 'Last Name', EDIT_PROFILE.lastName);

  const bio = el('textarea', {
    className: 'edit-field__input edit-field__input--multiline',
    attrs: { name: 'bio', placeholder: 'Bio', 'aria-label': 'Bio', rows: '1', maxlength: '70', spellcheck: 'false' },
  });
  bio.value = EDIT_PROFILE.bio;
  // The bio card grows with its text instead of scrolling inside.
  const fitBio = (): void => {
    bio.style.height = 'auto';
    bio.style.height = `${bio.scrollHeight}px`;
  };
  bio.addEventListener('input', fitBio);

  const hero = el('div', { className: 'edit-profile__hero' }, [
    el('img', {
      className: 'edit-profile__photo',
      attrs: { src: PROFILE.photo, alt: PROFILE.name, width: '100', height: '100', draggable: 'false' },
    }),
    el('button', { className: 'edit-profile__change-photo', attrs: { type: 'button', 'data-action': 'change-photo' } }, [
      el('span', { className: 'edit-profile__change-photo-text', text: 'Change Photo' }),
    ]),
  ]);

  const nameCard = el('section', { className: 'settings-group edit-fields', attrs: { 'data-group': 'name' } }, [
    first.row,
    el('span', { className: 'edit-fields__separator', attrs: { 'aria-hidden': 'true' } }),
    last.row,
  ]);
  const bioCard = el('section', { className: 'settings-group edit-fields', attrs: { 'data-group': 'bio' } }, [
    el('label', { className: 'edit-field edit-field--multiline' }, [bio]),
  ]);

  const birthdayCard = el('section', { className: 'settings-group', attrs: { 'data-group': 'birthday' } }, [SettingsRow(BIRTHDAY_ROW, 0)]);
  const birthdayNote = footnote([
    'Nobody can see your birthday. ',
    el('button', { className: 'edit-footnote__link', attrs: { type: 'button', 'data-action': 'birthday-privacy' } }, [
      document.createTextNode('Change'),
      icon(LINK_CHEVRON, 'edit-footnote__chevron'),
    ]),
  ]);

  const content = el('div', { className: 'edit-profile__content' }, [
    hero,
    nameCard,
    footnote('Enter your name and add an optional profile photo.'),
    bioCard,
    footnote('A few words about you.'),
    birthdayCard,
    birthdayNote,
    SettingsGroup({ id: 'profile-info', rows: profileRows() }),
    actionCard('add-another-account', 'Add Another Account', 'accent'),
    footnote('You can add up to four accounts with different phone numbers.', 2),
    actionCard('log-out', 'Log Out', 'danger'),
  ]);

  // Top blur: invisible at rest (the photo is not blurred, as in the
  // reference), fades in over the first 40 pt of scroll as content passes under.
  const topBlur = el('div', { className: 'profile-header__bar-blur', attrs: { 'aria-hidden': 'true' } });
  topBlur.style.setProperty('--collapse-color', '0');

  const bar = el('div', { className: 'edit-profile__bar' }, [
    GlassButton({ id: 'edit-close', label: 'Close', className: 'edit-profile__close', content: icon(CLOSE_ICON, 'glass-button__icon') }),
    el('button', { className: 'edit-profile__done', attrs: { type: 'button', 'aria-label': 'Done', 'data-action': 'edit-done' } }, [
      icon(DONE_ICON, 'edit-profile__done-icon'),
    ]),
  ]);

  const scroll = el('div', { className: 'screen__scroll' }, [content]);
  scroll.addEventListener(
    'scroll',
    () => topBlur.style.setProperty('--collapse-color', Math.min(1, Math.max(0, scroll.scrollTop / 40)).toFixed(3)),
    { passive: true },
  );

  const element = el('main', { className: 'screen screen--edit-profile', attrs: { 'data-screen': 'edit-profile' } }, [
    scroll,
    topBlur,
    bar,
  ]);

  element.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-action], [data-row]');
    if (!target) return;
    const detail = target.dataset.row ? { type: 'row', id: target.dataset.row } : { type: 'button', id: target.dataset.action };
    element.dispatchEvent(new CustomEvent('prototype:action', { detail, bubbles: true }));
  });

  requestAnimationFrame(fitBio);

  return {
    element,
    values: () => ({ firstName: first.input.value, lastName: last.input.value, bio: bio.value }),
  };
}
