import { el } from '../dom';
import { ProfileHeader, type ProfileHeaderHandle } from '../components/ProfileHeader';
import { SettingsGroup } from '../components/SettingsGroup';
import { BottomTabBar } from '../components/BottomTabBar';
import { PROFILE, SETTINGS_GROUPS, TABS } from './settings.data';
import { AppliedDecoration } from '../decor/AppliedDecoration';

export interface SettingsScreenHandle {
  element: HTMLElement;
  header: ProfileHeaderHandle;
}

/**
 * Telegram iOS → Settings (main profile settings screen).
 *
 *   .screen
 *   ├── .screen__scroll        scrolling content: spacer + cards
 *   ├── header                 pinned profile header that collapses into a bar
 *   ├── .screen__bottom-blur   progressive blur behind the tab bar (Figma: bottom 102 pt)
 *   └── nav.tab-bar            four tabs, Settings selected
 *
 * Taps on rows, buttons and tabs are reported as a bubbling
 * `prototype:action` event ({ type, id }); no navigation is wired yet.
 */
export function SettingsScreen(): SettingsScreenHandle {
  const header = ProfileHeader(PROFILE);
  const list = el('div', { className: 'settings-list' }, SETTINGS_GROUPS.map(SettingsGroup));
  // The header is pinned over the list; a spacer of the same height keeps
  // the cards where they were.
  const spacer = el('div', { className: 'profile-header-spacer', attrs: { 'aria-hidden': 'true' } });
  const content = el('div', { className: 'screen__content' }, [spacer, list]);
  const scroll = el('div', { className: 'screen__scroll' }, [content]);
  header.bindCollapse(scroll);

  const element = el('main', { className: 'screen screen--settings', attrs: { 'data-screen': 'settings' } }, [
    scroll,
    header.barBlur,
    header.element,
    el('div', { className: 'screen__bottom-blur', attrs: { 'aria-hidden': 'true' } }),
    BottomTabBar({ tabs: TABS, selected: 'settings' }),
  ]);

  element.addEventListener('click', (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-row], [data-tab], [data-action]');
    if (!target) return;
    const detail = target.dataset.row
      ? { type: 'row', id: target.dataset.row }
      : target.dataset.tab
        ? { type: 'tab', id: target.dataset.tab }
        : { type: 'button', id: target.dataset.action };
    element.dispatchEvent(new CustomEvent('prototype:action', { detail, bubbles: true }));
  });

  // The applied avatar decoration (Apply Style on Your Color), over the leaves.
  AppliedDecoration(header.avatar, element);

  return { element, header };
}
