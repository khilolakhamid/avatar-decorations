import { el } from '../dom';

/**
 * Round "glass" surface from the Figma file. In the SVG every glass element
 * (QR, Edit, the tab bar) is three stacked fills inside a group with a drop
 * shadow (0 8 40 rgba(0,0,0,0.12)):
 *   1. white at 65 %
 *   2. #DDDDDD, blend mode color-burn
 *   3. #F7F7F7, blend mode darken
 * The layers are reproduced one to one; `isolation: isolate` keeps the
 * blending inside the button, as the SVG group does.
 */
export function glassSurface(): HTMLSpanElement {
  return el('span', { className: 'glass', attrs: { 'aria-hidden': 'true' } }, [
    el('span', { className: 'glass__layer glass__layer--base' }),
    el('span', { className: 'glass__layer glass__layer--burn' }),
    el('span', { className: 'glass__layer glass__layer--darken' }),
  ]);
}

export interface GlassButtonOptions {
  id: string;
  /** Accessible name (also used when the button has only an icon). */
  label: string;
  className?: string;
  /** Visible content: an icon element or text. */
  content: Node;
}

export function GlassButton({ id, label, className = '', content }: GlassButtonOptions): HTMLButtonElement {
  const button = el('button', {
    className: `glass-button ${className}`.trim(),
    attrs: { type: 'button', 'aria-label': label, 'data-action': id },
  });
  button.append(glassSurface(), content);
  return button;
}
