import { el } from '../dom';
import leavesPattern from '../assets/patterns/header-leaves.svg';
import { EXTRA_LEAVES, leafOpacity } from '../layout/headerLeaves';

/**
 * The profile leaf pattern — ONE component, used by the Settings header and
 * by the Your Color preview card.
 *
 * The Figma leaves (header-leaves.svg, 402 × 268 box) laid out as in the
 * reference screenshot (see layout/headerLeaves.ts): no hard ellipse clip,
 * plus two copies of existing leaves. Each leaf gets its own paleness
 * (--leaf-base) once the pattern is on screen (prepare()).
 *
 * The box is placed by its owner so that PATTERN_AVATAR_CENTER lands on the
 * avatar centre; the composition then sits around the avatar the same way
 * on every screen.
 */
export const PATTERN_SIZE = { width: 402, height: 268 } as const;
/** Avatar centre in the pattern box (Figma frame). */
export const PATTERN_AVATAR_CENTER = { x: 201, y: 142 } as const;

export interface LeafInfo {
  leaf: SVGGraphicsElement;
  /** Leaf centre in the pattern box. */
  cx: number;
  cy: number;
}

export interface LeafPatternHandle {
  element: HTMLElement;
  /** Measures the leaves and sets their paleness; null until the pattern is laid out. */
  prepare(): LeafInfo[] | null;
}

export function LeafPattern(className: string): LeafPatternHandle {
  const element = el('div', { className, html: leavesPattern, attrs: { 'aria-hidden': 'true' } });
  const group = element.querySelector('svg > g');
  if (group) {
    group.removeAttribute('clip-path');
    const leaves = Array.from(group.children) as SVGElement[];
    for (const extra of EXTRA_LEAVES) {
      const copy = leaves[extra.copyOf]?.cloneNode(true) as SVGElement | undefined;
      if (!copy) continue;
      // CSS `translate` stacks with any `transform` (Settings' collapse animation).
      copy.style.setProperty('translate', `${extra.dx}px ${extra.dy}px`);
      copy.dataset.offsetX = String(extra.dx);
      copy.dataset.offsetY = String(extra.dy);
      group.append(copy);
    }
  }

  let ready: LeafInfo[] | null = null;
  function prepare(): LeafInfo[] | null {
    if (ready) return ready;
    if (!element.isConnected || !group) return null;
    const out: LeafInfo[] = [];
    for (const leaf of Array.from(group.children) as SVGGraphicsElement[]) {
      const box = leaf.getBBox();
      if (!box.width) return null;
      const cx = box.x + box.width / 2 + Number(leaf.dataset.offsetX ?? 0);
      const cy = box.y + box.height / 2 + Number(leaf.dataset.offsetY ?? 0);
      leaf.classList.add('pattern-leaf');
      leaf.style.setProperty('--leaf-base', leafOpacity(cx, cy).toFixed(3));
      out.push({ leaf, cx, cy });
    }
    ready = out;
    return ready;
  }

  return { element, prepare };
}
