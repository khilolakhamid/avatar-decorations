export { FPS, FRAME_COUNT, LOOP_DURATION_MS } from './timeline.js';
export interface AnimationController {
    play(): void;
    pause(): void;
    readonly isPlaying: boolean;
    /** Current frame, 0 … 179.99 */
    readonly frame: number;
    seek(frame: number): void;
    /** Playback speed (1 = real time). */
    speed: number;
    destroy(): void;
}
export declare function createAnimationController(svg: SVGSVGElement, autoplay: boolean): AnimationController;
