/** Loop: strictly 3 s = 180 frames at 60 fps. */
export declare const LOOP_DURATION_MS = 3000;
export declare const FPS = 60;
export declare const FRAME_COUNT = 180;
export interface GhostOrbitOptions {
    /** Width = height. Number = pixels, string = any CSS length. Default '100%'. */
    size?: number | string;
    visible?: boolean;
    autoplay?: boolean;
    className?: string;
    /** Playback speed multiplier (1 = normal). Default 1. */
    speed?: number;
}
export declare class GhostOrbitDecoration {
    readonly element: SVGSVGElement;
    private playing;
    private destroyed;
    private speed;
    /** loop progress 0…1 */
    private phase;
    private lastTime;
    private rafId;
    private readonly parts;
    constructor(container: Element, options?: GhostOrbitOptions);
    setSize(size: number | string): void;
    show(): void;
    hide(): void;
    setVisible(visible: boolean): void;
    play(): void;
    pause(): void;
    get isPlaying(): boolean;
    setSpeed(speed: number): void;
    /** Shows frame 0…179 of the loop (keeps playing or paused). */
    seek(frame: number): void;
    /** Current frame 0…179. */
    get frame(): number;
    /** Current loop progress 0…1. */
    get progress(): number;
    destroy(): void;
    private readonly tick;
    private render;
}
export declare function mountGhostOrbit(container: Element, options?: GhostOrbitOptions): GhostOrbitDecoration;
/**
 * Static SVG markup (no DOM needed) at loop progress `phase` (0…1).
 * phase 1 draws exactly the same picture as phase 0.
 */
export declare function renderGhostOrbitSvg(idPrefix?: string, phase?: number): string;
