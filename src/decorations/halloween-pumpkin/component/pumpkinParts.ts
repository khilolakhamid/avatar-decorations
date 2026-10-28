/**
 * Named parts inside the original `pumpkin` vector.
 *
 * The file is one flat group of paths. Parts are recognised by the
 * gradient each path uses (unique names from the designer's file), not by
 * their position in the file.
 */
import { getAttr } from '../../../shared/svg';

/**
 * Back part of the vine (arch behind the rim). It joins the front `plant`
 * with a flat cut, so it must NOT breathe with the pumpkin body —
 * otherwise a gap would open at the joint.
 */
export const STEM_GRADIENTS = ['paint0_linear_20_2258', 'paint1_linear_20_2258'] as const;

/** Eye shapes: socket (lighter rim) + dark eye, left and right. */
export const EYE_GRADIENTS = {
  'eye-left-socket': 'paint11_linear_20_2258',
  'eye-left': 'paint12_radial_20_2258',
  'eye-right-socket': 'paint13_linear_20_2258',
  'eye-right': 'paint14_radial_20_2258',
} as const;

export type EyePart = keyof typeof EYE_GRADIENTS;

/** Which gradient (original id) an element is painted with, if any. */
export function paintOf(element: string): string | undefined {
  const fill = getAttr(element, 'fill') ?? '';
  const stroke = getAttr(element, 'stroke') ?? '';
  return (fill + stroke).match(/url\(#([^)]+)\)/)?.[1];
}

/** Original `d` of the path painted with the given gradient. */
export function pathByGradient(svgSource: string, gradientId: string): string {
  const re = /<path\b[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(svgSource))) {
    if (m[0].includes(`url(#${gradientId})`)) {
      const d = getAttr(m[0], 'd');
      if (d) return d;
    }
  }
  throw new Error(`pumpkin: no path painted with ${gradientId}`);
}
