/**
 * Back part of the vine (arch behind the rim). It joins the front `plant`
 * with a flat cut, so it must NOT breathe with the pumpkin body —
 * otherwise a gap would open at the joint.
 */
export declare const STEM_GRADIENTS: readonly ["paint0_linear_20_2258", "paint1_linear_20_2258"];
/** Eye shapes: socket (lighter rim) + dark eye, left and right. */
export declare const EYE_GRADIENTS: {
    readonly 'eye-left-socket': "paint11_linear_20_2258";
    readonly 'eye-left': "paint12_radial_20_2258";
    readonly 'eye-right-socket': "paint13_linear_20_2258";
    readonly 'eye-right': "paint14_radial_20_2258";
};
export type EyePart = keyof typeof EYE_GRADIENTS;
/** Which gradient (original id) an element is painted with, if any. */
export declare function paintOf(element: string): string | undefined;
/** Original `d` of the path painted with the given gradient. */
export declare function pathByGradient(svgSource: string, gradientId: string): string;
