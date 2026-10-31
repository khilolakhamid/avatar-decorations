import { el } from '../dom';

/**
 * iPhone status bar (time, cellular, Wi-Fi, battery).
 *
 * The Figma frame leaves this area empty, so the bar is a standard iOS one
 * added for the preview: white content, vertically centred on the Dynamic
 * Island (y 11–48). It is shown only in the desktop "frame" preview; on a
 * real iPhone the system draws its own status bar.
 */
const CELLULAR = `<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="7.5" width="3" height="4.5" rx="1"/><rect x="5" y="5" width="3" height="7" rx="1"/>
<rect x="10" y="2.5" width="3" height="9.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>`;

const WIFI = `<svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
<path d="M1.4 4.7a9.4 9.4 0 0 1 13.2 0"/><path d="M4 7.4a5.7 5.7 0 0 1 8 0"/>
<circle cx="8" cy="10.4" r="1.25" fill="currentColor" stroke="none"/></svg>`;

const BATTERY = `<svg width="27" height="13" viewBox="0 0 27 13" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="0.5" width="24" height="12" rx="3.8" stroke="currentColor" stroke-opacity="0.35"/>
<rect x="2" y="2" width="21" height="9" rx="2.5" fill="currentColor"/>
<path d="M25.5 4.5c.8.2 1.5.9 1.5 2s-.7 1.8-1.5 2v-4Z" fill="currentColor" fill-opacity="0.4"/></svg>`;

export function StatusBar({ time = '9:41' }: { time?: string } = {}): HTMLElement {
  return el('div', { className: 'status-bar', attrs: { 'data-component': 'status-bar', 'aria-hidden': 'true' } }, [
    el('div', { className: 'status-bar__leading' }, [el('span', { className: 'status-bar__time', text: time })]),
    el('div', { className: 'status-bar__trailing' }, [
      el('span', { className: 'status-bar__icon', html: CELLULAR }),
      el('span', { className: 'status-bar__icon', html: WIFI }),
      el('span', { className: 'status-bar__icon', html: BATTERY }),
    ]),
  ]);
}
