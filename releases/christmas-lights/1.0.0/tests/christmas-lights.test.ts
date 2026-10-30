/**
 * Automatic checks for Christmas Lights 1.0.0 (approved 2026-10-30).
 * Run: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  BULB_TURNS,
  bulbState,
  CHRISTMAS_LIGHTS_META,
  FRAME_COUNT,
  garlandFrame,
  HANG_POINTS,
  LIT_IN,
  LOOP_DURATION_MS,
  MOTION,
  renderChristmasLightsSvg,
  sparkleState,
  stateAt,
} from '../src/decorations/christmas-lights';
import { SOURCE_SHA256 } from '../src/decorations/christmas-lights/assets/sources.generated';
import {
  BULB_PARTS,
  BULBS_IN_FILES,
  dOf,
  DRAWINGS,
  pointsOf,
  WIRE_MORPH,
  type Pt,
} from '../src/decorations/christmas-lights/component/garlandModel';
import { uniquePrefix } from '../src/shared/svg';

const ROOT = process.env.PROJECT_ROOT ?? process.cwd();
const DIR = join(ROOT, 'src/decorations/christmas-lights');
const sha256 = (d: string | Buffer) => createHash('sha256').update(d).digest('hex');

/** SHA-256 of the owner's original vectors 1.svg and 2.svg (received 2026-10-30). */
const ORIGINAL_SVG_SHA256: Record<string, string> = {
  'lights_1.svg': '61cfbda8912cad90544632b518d346e57f0437de346149e819d3315de6997ba9',
  'lights_2.svg': '8a71dd7c16f72e237a602984c8a66e7b04033a3092184b95c141397336707bfa',
};

test('christmas-lights: the two original SVGs are unchanged and embedded byte for byte', () => {
  const files = readdirSync(join(DIR, 'assets')).filter((f) => f.endsWith('.svg')).sort();
  assert.deepEqual(files, Object.keys(ORIGINAL_SVG_SHA256));
  for (const f of files) assert.equal(sha256(readFileSync(join(DIR, 'assets', f))), ORIGINAL_SVG_SHA256[f], f);
  assert.deepEqual(SOURCE_SHA256, ORIGINAL_SVG_SHA256);
});

test('christmas-lights: both drawings have the same structure — wire + 6 bulbs, the other half of them lit', () => {
  assert.equal(DRAWINGS[0].elements.length, DRAWINGS[1].elements.length);
  assert.equal(BULBS_IN_FILES[0].length, 6);
  assert.equal(BULBS_IN_FILES[1].length, 6);
  BULBS_IN_FILES[0].forEach((b, k) => {
    // each bulb has a sparkle in exactly one of the drawings
    assert.ok(!!b.sparkle !== !!BULBS_IN_FILES[1][k].sparkle, `bulb ${k}: lit in one drawing only`);
    for (const part of BULB_PARTS) {
      const kind = (e: string) => e.match(/^<(\w+)/)![1];
      assert.equal(kind(DRAWINGS[0].elements[b.parts[part]]), kind(DRAWINGS[1].elements[BULBS_IN_FILES[1][k].parts[part]]), `bulb ${k} ${part}`);
    }
  });
  assert.deepEqual([...LIT_IN], [1, 0, 1, 0, 1, 0]);
  for (const w of WIRE_MORPH) assert.ok(w.same, 'wire elements: same commands in both drawings');
});

test('christmas-lights: every bulb part of drawing 2 is drawing 1\'s part, only turned (nothing redrawn)', () => {
  BULB_TURNS.forEach((turns, k) => {
    for (const part of BULB_PARTS) assert.ok(turns[part].error < 0.01, `bulb ${k} ${part}: rigid fit error ${turns[part].error}`);
  });
});

test('christmas-lights: no avatar placeholder, photo, background or controls inside the decoration', () => {
  for (const p of [0, 0.25, 0.5, 0.75]) {
    const svg = renderChristmasLightsSvg('t-', p);
    assert.match(svg, /^<svg[^>]*viewBox="0 0 512 512"/);
    assert.doesNotMatch(svg, /<rect\b/i);
    assert.doesNotMatch(svg, /#?d9d9d9/i);
    // the only circles are the sparkles' soft white glows from the drawings
    for (const m of svg.matchAll(/<circle\b[^>]*>/g)) assert.match(m[0], /fill="white"/);
    for (const tag of ['text', 'image', 'foreignObject', 'input', 'button', 'script', 'style']) {
      assert.doesNotMatch(svg, new RegExp(`<${tag}\\b`, 'i'), `<${tag}>`);
    }
  }
});

test('christmas-lights: two instances share no ids; every reference stays inside its instance', () => {
  const sets = [renderChristmasLightsSvg(uniquePrefix('cl')), renderChristmasLightsSvg(uniquePrefix('cl'))].map((svg) => {
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const own = new Set(ids);
    for (const m of svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) assert.ok(own.has(m[1]), m[1]);
    return own;
  });
  assert.deepEqual([...sets[0]].filter((id) => sets[1].has(id)), []);
});

test('christmas-lights: independent — imports nothing from other decorations or the demo', () => {
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  for (const file of walk(DIR).filter((f) => f.endsWith('.ts'))) {
    for (const m of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      assert.ok(!/halloween|ghost|cat-ears|paper-plane|demo/i.test(spec), `${file} imports ${spec}`);
      assert.ok(spec.startsWith('./') || spec.startsWith('../'), `${file}: external import ${spec}`);
      if (spec.includes('shared')) assert.match(spec, /shared\/svg$/, `${file}: ${spec}`);
    }
  }
});

test('loop: 3 s, state 1 → state 2 → state 1, last frame = first frame (every attribute)', () => {
  assert.equal(LOOP_DURATION_MS, 3000);
  assert.equal(FRAME_COUNT, 180);
  assert.equal(stateAt(0), 0);
  assert.equal(stateAt(0.5), 1);
  for (let b = 0; b < 6; b++) {
    // each bulb reaches its drawing at its own (slightly delayed) moment
    const own = MOTION.ripple[b];
    assert.ok(bulbState(own, b).state < 1e-9, `bulb ${b} as in drawing 1`);
    assert.ok(bulbState(0.5 + own, b).state > 1 - 1e-9, `bulb ${b} as in drawing 2`);
    assert.ok(bulbState(0, b).state < 0.01 && bulbState(0.5, b).state > 0.99, `bulb ${b}: near its drawing at p = 0 / 0.5`);
  }
  assert.deepEqual(garlandFrame(1), garlandFrame(0));
});

test('smooth and gentle: no jumps between frames; sway within ±2°; bulbs change one after another', () => {
  assert.ok(MOTION.sway.degrees <= 2);
  for (let b = 0; b < 6; b++) {
    for (let f = 0; f < FRAME_COUNT; f++) {
      const a = bulbState(f / FRAME_COUNT, b), c = bulbState((f + 1) / FRAME_COUNT, b);
      assert.ok(Math.abs(c.state - a.state) < 0.06, `bulb ${b} frame ${f}: turn step`);
      assert.ok(Math.abs(c.light - a.light) < 0.08, `bulb ${b} frame ${f}: light step`);
      assert.ok(Math.abs(c.sway - a.sway) < 0.1, `bulb ${b} frame ${f}: sway step`);
    }
  }
  // not all at once: at the middle of the change the bulbs are at different points of it
  const mid = [0, 1, 2, 3, 4, 5].map((b) => bulbState(0.25, b).state);
  assert.ok(Math.max(...mid) - Math.min(...mid) > 0.1);
});

test('no pauses and no jerks: every motion has a continuous speed, also across the loop seam', () => {
  // second differences (change of speed per frame) stay small everywhere, including frames 179 → 0 → 1
  const series: [string, (p: number) => number][] = [['breath', stateAt]];
  for (let b = 0; b < 6; b++) {
    series.push([`bulb ${b} turn`, (p) => bulbState(p, b).state]);
    series.push([`bulb ${b} sway`, (p) => bulbState(p, b).sway]);
    series.push([`bulb ${b} light`, (p) => bulbState(p, b).light]);
    const file = LIT_IN[b];
    series.push([`glint ${b} size`, (p) => sparkleState(p, file).scale]);
    series.push([`glint ${b} opacity`, (p) => sparkleState(p, file).opacity]);
    series.push([`glint ${b} glow`, (p) => sparkleState(p, file).glow]);
  }
  for (const [name, fn] of series) {
    let maxSpeed = 0;
    let maxJerk = 0;
    for (let f = 0; f < FRAME_COUNT; f++) {
      const [a, b, c] = [fn((f - 1) / FRAME_COUNT), fn(f / FRAME_COUNT), fn((f + 1) / FRAME_COUNT)];
      if ([a, b, c].some(Number.isNaN)) continue;
      maxSpeed = Math.max(maxSpeed, Math.abs(c - b));
      maxJerk = Math.max(maxJerk, Math.abs(c - 2 * b + a));
    }
    assert.ok(maxJerk <= Math.max(0.2 * maxSpeed, 1e-6), `${name}: speed changes by ${maxJerk.toFixed(4)} per frame (max speed ${maxSpeed.toFixed(4)})`);
  }
  // the garland never stands still: the turn of the bulbs (taken together) is always under way somewhere
  for (let f = 0; f < FRAME_COUNT; f++) {
    const moving = [0, 1, 2, 3, 4, 5].reduce((m, b) => m + Math.abs(bulbState((f + 1) / FRAME_COUNT, b).sway - bulbState(f / FRAME_COUNT, b).sway) + Math.abs(bulbState((f + 1) / FRAME_COUNT, b).state - bulbState(f / FRAME_COUNT, b).state), 0);
    assert.ok(moving > 0.005, `frame ${f}: the garland moves`);
  }
});

test('bulbs stay on their hangers: the socket never moves away from the hanger end during the animation', () => {
  const rot = (p: Pt, deg: number, c: Pt): Pt => {
    const a = (deg * Math.PI) / 180;
    const [x, y] = [p[0] - c[0], p[1] - c[1]];
    return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];
  };
  for (let b = 0; b < 6; b++) {
    const socket = pointsOf(dOf(DRAWINGS[0].elements[BULBS_IN_FILES[0][b].parts.socket]));
    const hang = HANG_POINTS[b];
    const gap = (pts: Pt[]) => Math.min(...pts.map((p) => Math.hypot(p[0] - hang[0], p[1] - hang[1])));
    const drawn = gap(socket);
    for (let f = 0; f < FRAME_COUNT; f++) {
      const s = bulbState(f / FRAME_COUNT, b);
      const t = BULB_TURNS[b].socket;
      const now = socket.map((p) => rot(rot(p, (t.angle * 180 / Math.PI) * s.state, t.centre), s.sway, hang));
      assert.ok(gap(now) < drawn + 4, `bulb ${b} frame ${f}: socket ${gap(now).toFixed(1)} from the hanger end (drawn ${drawn.toFixed(1)})`);
    }
  }
});

test('glints: all glints of a drawing together, never turning; bright while their bulbs are lit, gone while dim', () => {
  // one common state per drawing: the same for every glint of that drawing (no individual delays)
  for (let f = 0; f < FRAME_COUNT; f++) {
    const p = f / FRAME_COUNT;
    const one = sparkleState(p, 0), two = sparkleState(p, 1);
    assert.ok(!('turn' in one), 'glints do not turn');
    // fully there at their drawing, gone at the other one
    if (Math.abs(stateAt(p)) < 1e-9) assert.ok(one.opacity > 0.8 && two.opacity === 0);
  }
  assert.ok(sparkleState(0, 0).opacity > 0.8 && sparkleState(0, 1).opacity === 0, 'drawing 1: its glints shine');
  assert.ok(sparkleState(0.5, 1).opacity > 0.8 && sparkleState(0.5, 0).opacity === 0, 'drawing 2: its glints shine');
  // gentle shimmer: size stays within a few per cent of the drawing while shining
  for (let f = 0; f < FRAME_COUNT; f++) {
    const g = sparkleState(f / FRAME_COUNT, 0);
    if (g.opacity > 0.8) assert.ok(Math.abs(g.scale - 1) <= 0.06, `frame ${f}: glint size ${g.scale}`);
  }
});

test('bulbs keep the drawings\' own look: no extra dimming of lit or dim bulbs', () => {
  for (const p of [0, 0.25, 0.5, 0.75]) {
    const fr = garlandFrame(p);
    for (let b = 0; b < 6; b++) {
      for (const part of ['bulb', 'rim', 'socket', 'socketRim', 'socketHighlight']) assert.ok(!('opacity' in fr[`b${b}-${part}`]), `bulb ${b} ${part}`);
    }
  }
  // at the drawings, the dim bulb's halo and highlight are exactly the file's
  const fr = garlandFrame(0.5 + MOTION.ripple[1]);
  assert.equal(fr['b1-glow-1'].opacity, '0'); // blue: lit in drawing 1, dim in drawing 2
  assert.equal(fr['b1-glow-2'].opacity, '1');
  assert.equal(fr['b1-highlight'].opacity, '0.6');
});

test('approved Christmas Lights 1.0.0 is unchanged (markup and every attribute in all 180 frames)', () => {
  // If this fails, the look or the motion changed. That needs the owner's
  // approval and a new version — not a new fingerprint.
  assert.equal(CHRISTMAS_LIGHTS_META.id, 'christmas-lights');
  assert.equal(CHRISTMAS_LIGHTS_META.version, '1.0.0');
  assert.equal(CHRISTMAS_LIGHTS_META.status.tgs, 'not-exported');
  assert.equal(sha256(renderChristmasLightsSvg('t-')), '1c7bbd66db3ed9b68d7b94357ff85859c372bc4659a6fae133b2dc4cc58337c7');
  const frames: string[] = [];
  for (let f = 0; f < FRAME_COUNT; f++) frames.push(JSON.stringify(garlandFrame(f / FRAME_COUNT)));
  assert.equal(sha256(frames.join('\n')), 'e4db9909759b6e195607241d7aee481a1315a1309a4beacb63033a66f48dc973');
});
