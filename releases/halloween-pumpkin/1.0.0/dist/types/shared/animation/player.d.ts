import { type Timeline } from './timeline.js';
export declare class TimelinePlayer {
    readonly timeline: Timeline;
    private parts;
    private morphs;
    private frame;
    private lastNow;
    private playing;
    /** Playback speed multiplier (1 = real time). */
    speed: number;
    private readonly tick;
    constructor(root: Element, timeline: Timeline);
    get isPlaying(): boolean;
    get currentFrame(): number;
    play(): void;
    pause(): void;
    /** Jumps to a frame (keeps playing if it was playing). */
    seek(frame: number): void;
    destroy(): void;
    /** Writes the state of one frame into the SVG. */
    render(frame: number): void;
}
