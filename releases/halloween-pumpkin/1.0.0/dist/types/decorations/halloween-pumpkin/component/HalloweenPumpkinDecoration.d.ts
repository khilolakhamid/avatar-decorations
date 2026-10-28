export interface HalloweenPumpkinOptions {
    /** Width = height. A number means pixels; a string is any CSS length. Default: '100%'. */
    size?: number | string;
    /** Initially visible. Default: true. */
    visible?: boolean;
    /** Start animating as soon as it is mounted. Default: true. */
    autoplay?: boolean;
    /** Extra class name(s) on the root <svg>. */
    className?: string;
}
export declare class HalloweenPumpkinDecoration {
    /** The root <svg> element (transparent, viewBox 0 0 512 512). */
    readonly element: SVGSVGElement;
    private readonly animation;
    constructor(container: Element, options?: HalloweenPumpkinOptions);
    /** Changes the rendered size. The whole composition scales as one piece. */
    setSize(size: number | string): void;
    show(): void;
    hide(): void;
    setVisible(visible: boolean): void;
    get visible(): boolean;
    play(): void;
    pause(): void;
    get isPlaying(): boolean;
    /** Current frame of the 180-frame loop. */
    get frame(): number;
    /** Shows a specific frame (0–179). Useful for previews and thumbnails. */
    seek(frame: number): void;
    /** Playback speed: 1 = real time, 0.25 = slow motion. */
    setSpeed(speed: number): void;
    /** Stops the animation and removes the element from the page. */
    destroy(): void;
}
/** Convenience: `mountHalloweenPumpkin(el, { size: 128 })`. */
export declare function mountHalloweenPumpkin(container: Element, options?: HalloweenPumpkinOptions): HalloweenPumpkinDecoration;
/**
 * Static SVG markup of the decoration (no DOM needed) — for server-side
 * rendering, saving as a file, or feeding an exporter.
 */
export declare function renderHalloweenPumpkinSvg(idPrefix?: string): string;
