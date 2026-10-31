import { el } from '../dom';

/**
 * Minimal screen stack. The root screen stays mounted underneath (so its
 * scroll position and state survive); pushed screens are laid over it.
 *
 * Transition (both directions): the new screen fades in while rising 12 pt,
 * the screen below fades out — 0.35 s, iOS ease. Reduced-motion users get an
 * instant switch. While a screen is on top, `data-active-screen` on <html>
 * names it (the preview status bar uses it to pick dark text).
 */
const DURATION = 350;

export class Navigator {
  readonly element: HTMLElement;
  private stack: HTMLElement[] = [];

  constructor(root: HTMLElement) {
    this.element = el('div', { className: 'screen-stack' }, [root]);
    root.classList.add('stack-screen');
    this.stack.push(root);
    this.mark();
  }

  get top(): HTMLElement {
    return this.stack[this.stack.length - 1];
  }

  push(screen: HTMLElement): void {
    const below = this.top;
    screen.classList.add('stack-screen', 'is-entering');
    this.element.append(screen);
    this.stack.push(screen);
    this.mark();
    below.classList.add('is-covered');
    // Next frame: start the transition from the "entering" state.
    requestAnimationFrame(() => requestAnimationFrame(() => screen.classList.remove('is-entering')));
    below.setAttribute('inert', '');
  }

  pop(): void {
    if (this.stack.length < 2) return;
    const screen = this.stack.pop() as HTMLElement;
    const below = this.top;
    below.removeAttribute('inert');
    below.classList.remove('is-covered');
    screen.classList.add('is-leaving');
    screen.setAttribute('inert', '');
    this.mark();
    // Let the screen release what it holds (e.g. running animations).
    const done = (): void => {
      screen.dispatchEvent(new CustomEvent('screen:dispose'));
      screen.remove();
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(done, DURATION);
  }

  /**
   * Back to the root screen in one move: screens between are closed at once
   * (released, not shown), the top one leaves with the usual transition.
   */
  popToRoot(): void {
    while (this.stack.length > 2) {
      const middle = this.stack.splice(this.stack.length - 2, 1)[0];
      middle.dispatchEvent(new CustomEvent('screen:dispose'));
      middle.remove();
    }
    this.pop();
  }

  private mark(): void {
    document.documentElement.dataset.activeScreen = this.top.dataset.screen ?? '';
  }
}
