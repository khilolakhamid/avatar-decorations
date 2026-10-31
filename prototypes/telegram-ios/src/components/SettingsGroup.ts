import { el, icon } from '../dom';
import chevronIcon from '../assets/icons/chevron.svg';

/**
 * Settings card (white, radius 26, rows of 52) and its rows.
 *
 * Two kinds of row icons exist in the Figma file:
 *  - "plain": a blue outline icon, label starts at x 90;
 *  - "tile":  a white glyph on a 30 × 30 coloured tile, label starts at x 78.
 * Icon offsets are the exact Figma coordinates relative to the row (plain)
 * or to the tile (glyph).
 */
/**
 * Optional display fit for an icon whose file cannot be edited: the SVG is
 * shown through a tighter viewBox (its visible ink) at a given size, which
 * scales the drawing uniformly. The file itself stays untouched.
 */
export interface IconFit {
  viewBox: string;
  width: number;
  height: number;
}

export type RowIcon =
  | { kind: 'plain'; svg: string; x: number; y: number; fit?: IconFit }
  | {
      kind: 'tile';
      /** White glyph; may be left out while a glyph is still pending (empty tile). */
      svg?: string;
      color: string;
      x: number;
      y: number;
      /** Full tile background instead of colour + the Figma highlight/shade overlays. */
      background?: string;
      /** Display fit (viewBox cut to the drawing + size) for a glyph file that is used unchanged. */
      fit?: IconFit;
    };

export interface SettingsRowData {
  id: string;
  title: string;
  icon: RowIcon;
  /** Grey value shown before the chevron (e.g. number of devices). */
  value?: string;
  /** Custom element in the value position (e.g. colour circles), instead of text. */
  valueNode?: Node;
  /** Show the disclosure chevron. */
  chevron?: boolean;
}

export interface SettingsGroupData {
  id: string;
  rows: SettingsRowData[];
}

function px(value: number): string {
  return `${value}px`;
}

export function SettingsRow(row: SettingsRowData, index: number): HTMLButtonElement {
  const button = el('button', {
    className: `settings-row settings-row--${row.icon.kind}${row.chevron ? '' : ' settings-row--no-chevron'}`,
    attrs: { type: 'button', 'data-row': row.id },
  });

  if (index > 0) button.append(el('span', { className: 'settings-row__separator', attrs: { 'aria-hidden': 'true' } }));

  if (row.icon.kind === 'plain') {
    const glyph = icon(row.icon.svg, 'settings-row__icon');
    const svg = glyph.querySelector('svg');
    if (row.icon.fit && svg) {
      svg.setAttribute('viewBox', row.icon.fit.viewBox);
      svg.setAttribute('width', String(row.icon.fit.width));
      svg.setAttribute('height', String(row.icon.fit.height));
    }
    glyph.style.left = px(row.icon.x);
    glyph.style.top = px(row.icon.y);
    button.append(glyph);
  } else {
    const tile = el('span', { className: 'settings-row__tile', attrs: { 'aria-hidden': 'true' } });
    if (row.icon.svg) {
      const glyph = icon(row.icon.svg, 'settings-row__glyph');
      const svg = glyph.querySelector('svg');
      if (row.icon.fit && svg) {
        svg.setAttribute('viewBox', row.icon.fit.viewBox);
        svg.setAttribute('width', String(row.icon.fit.width));
        svg.setAttribute('height', String(row.icon.fit.height));
      }
      glyph.style.left = px(row.icon.x);
      glyph.style.top = px(row.icon.y);
      tile.append(glyph);
    } else {
      tile.dataset.glyph = 'pending';
    }
    tile.style.setProperty('--tile-color', row.icon.color);
    if (row.icon.background) tile.style.background = row.icon.background;
    button.append(tile);
  }

  button.append(el('span', { className: 'settings-row__title', text: row.title }));
  if (row.value) button.append(el('span', { className: 'settings-row__value', text: row.value }));
  if (row.valueNode) button.append(el('span', { className: 'settings-row__value settings-row__value--node' }, [row.valueNode]));
  if (row.chevron) button.append(icon(chevronIcon, 'settings-row__chevron'));
  return button;
}

export function SettingsGroup(group: SettingsGroupData): HTMLElement {
  const section = el('section', { className: 'settings-group', attrs: { 'data-group': group.id } });
  group.rows.forEach((row, index) => section.append(SettingsRow(row, index)));
  return section;
}
