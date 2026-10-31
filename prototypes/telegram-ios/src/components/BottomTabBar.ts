import { el, icon } from '../dom';
import { glassSurface } from './GlassButton';

/**
 * Bottom tab bar.
 *
 * Changed on purpose against the Figma file / real Telegram: the separate
 * round search button on the right is removed, and the bar now spans the
 * whole width (25 pt from each screen edge, like the original bar's left
 * edge). The four tabs share the width equally. Icons, labels, the glass
 * surface and the selected-tab highlight are the original ones.
 */
export type TabIcon = { kind: 'image'; src: string; width: number; height: number } | { kind: 'svg'; svg: string };

export interface TabData {
  id: string;
  label: string;
  icon: TabIcon;
}

export function BottomTabBar({ tabs, selected }: { tabs: TabData[]; selected: string }): HTMLElement {
  const list = el('div', { className: 'tab-bar__items', attrs: { role: 'tablist' } });

  for (const tab of tabs) {
    const isSelected = tab.id === selected;
    const iconNode =
      tab.icon.kind === 'image'
        ? el('img', {
            className: 'tab-bar__image',
            attrs: { src: tab.icon.src, alt: '', draggable: 'false', width: String(tab.icon.width), height: String(tab.icon.height) },
          })
        : icon(tab.icon.svg, 'tab-bar__svg');

    const button = el(
      'button',
      {
        className: `tab-bar__tab${isSelected ? ' is-selected' : ''}`,
        attrs: { type: 'button', role: 'tab', 'aria-selected': String(isSelected), 'data-tab': tab.id },
      },
      [
        isSelected ? el('span', { className: 'tab-bar__highlight', attrs: { 'aria-hidden': 'true' } }) : null,
        el('span', { className: 'tab-bar__icon' }, [iconNode]),
        el('span', { className: 'tab-bar__label', text: tab.label }),
      ],
    );
    list.append(button);
  }

  return el('nav', { className: 'tab-bar', attrs: { 'data-component': 'tab-bar', 'aria-label': 'Tabs' } }, [
    glassSurface(),
    list,
  ]);
}
