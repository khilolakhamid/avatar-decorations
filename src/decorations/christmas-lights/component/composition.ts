/**
 * Builds the Christmas Lights SVG from the owner's two drawings.
 *
 *   <g data-layer="garland" transform="placement">
 *     wire (drawing 1's wire, colours and shading move to drawing 2's — the tiny breath;
 *       the white glints of the two drawings cross-fade)
 *     for each bulb, left to right:
 *       <g data-part="b{k}" transform="sway around the hanger's end">
 *         glow of drawing 1 + glow of drawing 2 (cross-fade: the light goes on / off;
 *           both as drawn; a lit halo breathes with the common light rhythm)
 *         bulb, inner highlight, rim, socket, socket rim, socket highlight — drawing 1's
 *           own elements, each turned from its angle in drawing 1 towards drawing 2
 *         glint of the drawing where the bulb is lit: its soft glow and its star — all
 *           glints of a drawing shimmer together, around their own centre, never turning
 *
 * Every bulb is drawn once (its parts are the same shapes in both drawings,
 * only turned), so a bulb never doubles; at state 1 every shape is where it
 * is in drawing 1, at state 2 where it is in drawing 2 (apart from the gentle
 * sway, the breathing halo of lit bulbs and the shimmering glints). The same frame function gives every attribute for the
 * static markup and for the live animation. No avatar or background is drawn.
 */
import { parseSvg, prefixIds } from '../../../shared/svg';
import type { AssetSources } from '../assets';
import {
  ALIGN,
  BULB_COUNT,
  BULB_TURNS,
  BULBS_IN_FILES,
  DRAWINGS,
  HANG_POINTS,
  highlightOpacity,
  LIT_IN,
  sparkleCentre,
  WIRE_ELEMENTS,
  WIRE_FADE,
  WIRE_MORPH,
  type Turn,
} from './garlandModel';
import { CANVAS_SIZE, PLACEMENT } from './layout';
import { bulbState, lightPulse, MOTION, sparkleState, stateAt } from './motion';

export interface CompositionOptions {
  /** Prefix for all ids so several copies can live on one page. */
  idPrefix?: string;
  /** Loop progress 0…1 to draw. */
  progress?: number;
}

/** Every changing attribute of the drawing at one moment: part name → attribute → value. */
export type Frame = Record<string, Record<string, string>>;

const r3 = (n: number) => Math.round(n * 1000) / 1000;
const DEG = 180 / Math.PI;

/** Transform of a drawing-1 element turned towards drawing 2 by share s. */
const fromFirst = (turn: Turn, s: number) => `rotate(${r3(turn.angle * DEG * s)} ${r3(turn.centre[0])} ${r3(turn.centre[1])})`;
/** Transform of a drawing-2 element (placed onto drawing 1, turned back by 1 − s). */
const fromSecond = (turn: Turn, s: number) =>
  `rotate(${r3(-turn.angle * DEG * (1 - s))} ${r3(turn.centre[0])} ${r3(turn.centre[1])}) translate(${r3(-ALIGN[0])} ${r3(-ALIGN[1])})`;

export function garlandFrame(progress = 0): Frame {
  const p = ((progress % 1) + 1) % 1;
  const frame: Frame = {};
  // wire: the tiny breath between the two drawings
  const breath = stateAt(p);
  WIRE_MORPH.forEach((w, i) => {
    if (WIRE_FADE.includes(i)) {
      frame[`wire-${i}-1`] = { opacity: String(r3(1 - breath)) };
      frame[`wire-${i}-2`] = { opacity: String(r3(breath)) };
      return;
    }
    let k = 0;
    frame[`wire-${i}`] = { d: w.template.replace(/#/g, () => String(r3(w.n1[k] + (w.n2[k] - w.n1[k++]) * breath))) };
  });
  for (let b = 0; b < BULB_COUNT; b++) {
    const st = bulbState(p, b);
    const turns = BULB_TURNS[b];
    const [hx, hy] = HANG_POINTS[b];
    frame[`b${b}`] = { transform: `rotate(${r3(st.sway)} ${r3(hx)} ${r3(hy)})` };
    // light: the two drawings' halos cross-fade with the bulb's turn (both as drawn); a lit halo breathes
    // gently with the common light rhythm
    const breathe = 1 - MOTION.look.pulse * (0.5 - 0.5 * lightPulse(p));
    const halo = (file: 0 | 1) => (LIT_IN[b] === file ? breathe : 1);
    frame[`b${b}-glow-1`] = { transform: fromFirst(turns.glow, st.state), opacity: String(r3((1 - st.light) * halo(0))) };
    frame[`b${b}-glow-2`] = { transform: fromSecond(turns.glow, st.state), opacity: String(r3(st.light * halo(1))) };
    const hl = highlightOpacity(0, b) + (highlightOpacity(1, b) - highlightOpacity(0, b)) * st.light;
    frame[`b${b}-highlight`] = { transform: fromFirst(turns.highlight, st.state), opacity: String(r3(hl)) };
    for (const part of ['bulb', 'rim', 'socket', 'socketRim', 'socketHighlight'] as const) {
      frame[`b${b}-${part}`] = { transform: fromFirst(turns[part], st.state) };
    }
    // glint: rides with its bulb (as drawn in the file where the bulb is lit); all glints of a drawing
    // shimmer together, around their own centre, without turning
    const file = LIT_IN[b];
    const sp = sparkleState(p, file);
    const [cx, cy] = sparkleCentre(file, b);
    frame[`b${b}-sparkle`] = { transform: file === 0 ? fromFirst(turns.bulb, st.state) : fromSecond(turns.bulb, st.state) };
    const around = `translate(${r3(cx)} ${r3(cy)}) scale(${r3(Math.max(sp.scale, 0.0001))}) translate(${r3(-cx)} ${r3(-cy)})`;
    frame[`b${b}-sparkle-glow`] = { transform: around, opacity: String(r3(sp.glow)) };
    frame[`b${b}-star`] = { transform: around, opacity: String(r3(sp.opacity)) };
  }
  return frame;
}

export function buildChristmasLightsSvg(sources: AssetSources, { idPrefix = 'cl-', progress = 0 }: CompositionOptions = {}): string {
  const f = garlandFrame(progress);
  const attrs = (part: string) =>
    `data-part="${part}" ` +
    Object.entries(f[part])
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
  const ns = (file: 0 | 1) => `${idPrefix}d${file + 1}-`;
  // the files themselves (sources) are the ones parsed in garlandModel; parse again here only for the defs
  const defs = [prefixIds(parseSvg(sources.lights_1).defs, ns(0)), prefixIds(parseSvg(sources.lights_2).defs, ns(1))];
  const el = (file: 0 | 1, index: number) => prefixIds(DRAWINGS[file].elements[index], ns(file));

  const wire = Array.from({ length: WIRE_ELEMENTS }, (_, i) =>
    WIRE_FADE.includes(i)
      ? `<g ${attrs(`wire-${i}-1`)}>${el(0, i)}</g>` +
        `<g ${attrs(`wire-${i}-2`)}><g transform="translate(${r3(-ALIGN[0])} ${r3(-ALIGN[1])})">${el(1, i)}</g></g>`
      : el(0, i).replace(/\sd="[^"]*"/, '').replace(/^<path\b/, `<path ${attrs(`wire-${i}`)}`),
  ).join('');
  const bulbs: string[] = [];
  for (let b = 0; b < BULB_COUNT; b++) {
    const one = BULBS_IN_FILES[0][b].parts;
    const two = BULBS_IN_FILES[1][b].parts;
    const g = (part: string, inner: string) => `<g ${attrs(`b${b}-${part}`)}>${inner}</g>`;
    const parts: string[] = [
      g('glow-1', el(0, one.glow)),
      g('glow-2', el(1, two.glow)),
      g('bulb', el(0, one.bulb)),
      // the highlight's own opacity (dim 0.6 / lit 1) is set on its wrapper instead
      g('highlight', el(0, one.highlight).replace(/^(<g\b[^>]*?)\sopacity="[^"]*"/, '$1')),
      g('rim', el(0, one.rimMask) + el(0, one.rim)),
      g('socket', el(0, one.socket)),
      g('socketRim', el(0, one.socketMask) + el(0, one.socketRim)),
      g('socketHighlight', el(0, one.socketHighlight)),
    ];
    const file = LIT_IN[b];
    const sparkle = BULBS_IN_FILES[file][b].sparkle!;
    parts.push(g('sparkle', g('sparkle-glow', el(file, sparkle.glow)) + g('star', el(file, sparkle.star))));
    bulbs.push(`<g ${attrs(`b${b}`)}>${parts.join('')}</g>`);
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}" ` +
    `fill="none" overflow="visible" data-decoration="christmas-lights">` +
    `<defs>${defs.join('')}</defs>` +
    `<g data-layer="garland" transform="translate(${PLACEMENT.x} ${PLACEMENT.y}) scale(${PLACEMENT.scale})">` +
    wire +
    bulbs.join('') +
    `</g></svg>`
  );
}
