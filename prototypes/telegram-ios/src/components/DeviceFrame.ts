import { el } from '../dom';
import { FRAME } from '../layout/figma';
import { StatusBar } from './StatusBar';

/**
 * Two ways to show a screen:
 *
 * - "frame"  (desktop browser): an iPhone-sized screen of exactly 402 × 874
 *   with the Figma safe areas (62 top, 34 bottom), a simulated status bar and
 *   Dynamic Island. If the window is too small, the whole phone is scaled
 *   down uniformly — proportions, icons and text never change relative to
 *   each other.
 * - "device" (opened on a phone): the screen fills the viewport and uses the
 *   real safe areas (env(safe-area-inset-*)); the system status bar is used.
 *
 * The mode is chosen automatically and can be forced with ?mode=frame or
 * ?mode=device.
 */
export type DisplayMode = 'frame' | 'device';

export function resolveMode(): DisplayMode {
  const forced = new URLSearchParams(location.search).get('mode');
  if (forced === 'frame' || forced === 'device') return forced;
  const isPhone = matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, screen.width) <= 500;
  return isPhone ? 'device' : 'frame';
}

const BEZEL = 14;

export function DeviceFrame(screenElement: HTMLElement, mode: DisplayMode): HTMLElement {
  document.documentElement.dataset.mode = mode;

  if (mode === 'device') {
    return el('div', { className: 'device-viewport' }, [screenElement]);
  }

  const screen = el('div', { className: 'device__screen' }, [
    screenElement,
    StatusBar(),
    el('div', { className: 'device__island', attrs: { 'aria-hidden': 'true' } }),
  ]);
  const device = el('div', { className: 'device' }, [screen]);
  const stage = el('div', { className: 'device-stage' }, [device]);

  const fit = (): void => {
    const fullWidth = FRAME.width + BEZEL * 2;
    const fullHeight = FRAME.height + BEZEL * 2;
    const scale = Math.min(1, (innerWidth - 32) / fullWidth, (innerHeight - 32) / fullHeight);
    stage.style.setProperty('--frame-scale', String(Math.max(scale, 0.2)));
  };
  fit();
  addEventListener('resize', fit);
  return stage;
}
