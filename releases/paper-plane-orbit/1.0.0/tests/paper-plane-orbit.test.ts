/**
 * Automatic checks for Paper Plane Orbit 1.0.0 (approved 2026-10-30).
 * Run: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  FRAME_COUNT,
  LOOP_DURATION_MS,
  MOTION,
  PAPER_PLANE_ORBIT_META,
  planeFrame,
  planeState,
  renderPaperPlaneOrbitSvg,
  VIEWS,
} from '../src/decorations/paper-plane-orbit';
import { SOURCE_SHA256 } from '../src/decorations/paper-plane-orbit/assets/sources.generated';
import { lerpPt, viewCentre, type CornerName } from '../src/decorations/paper-plane-orbit/component/planeModel';
import { FIRST, FIRST_TURN_POINTS, firstTurnPoint, SECOND, turnPoint } from '../src/decorations/paper-plane-orbit/component/firstTurn';
import { uniquePrefix } from '../src/shared/svg';

const ROOT = process.env.PROJECT_ROOT ?? process.cwd();
const DIR = join(ROOT, 'src/decorations/paper-plane-orbit');
const sha256 = (d: string | Buffer) => createHash('sha256').update(d).digest('hex');
const states = Array.from({ length: FRAME_COUNT + 1 }, (_, f) => planeState(f / FRAME_COUNT));

/** SHA-256 of the owner's original vectors Paper_Plane_1/2/3.svg (2 and 3 received 2026-10-30; 1 = updated version, 2026-10-30). */
const ORIGINAL_SVG_SHA256: Record<string, string> = {
  'paper_plane_1.svg': '81dc84009f2b5ed8b8d4af6e5602b66fe8e5e15069a33b8894c0648092815ae0',
  'paper_plane_2.svg': '346f83e7caabdf16514919fe761d244fc83e686bae397230112c3095a515d2ef',
  'paper_plane_3.svg': 'b5f24e37eb3e796286a2c8ef91258f06915235f9fda8dfa091ef688bff00efbf',
};

test('paper-plane-orbit: the three original SVGs are unchanged and embedded byte for byte', () => {
  const files = readdirSync(join(DIR, 'assets')).filter((f) => f.endsWith('.svg')).sort();
  assert.deepEqual(files, Object.keys(ORIGINAL_SVG_SHA256));
  for (const f of files) assert.equal(sha256(readFileSync(join(DIR, 'assets', f))), ORIGINAL_SVG_SHA256[f], f);
  assert.deepEqual(SOURCE_SHA256, ORIGINAL_SVG_SHA256);
});

test('paper-plane-orbit: every corner, gradient and colour of drawings 2 and 3 comes from the original files', () => {
  for (const v of VIEWS) {
    const file = readFileSync(join(DIR, 'assets', `${v.file}.svg`), 'utf8');
    const has = (n: number) => assert.ok(file.includes(String(n)), `${v.file}: ${n}`);
    for (const [x, y] of Object.values(v.corners)) {
      has(x);
      has(y);
    }
    for (const g of [v.faceGradient, v.outlineAGradient, v.outlineBGradient, v.keelAGradient, v.keelBGradient]) {
      [...g.from, ...g.to].forEach(has);
      for (const c of g.stops) assert.ok(file.includes(c), `${v.file}: ${c}`);
    }
    assert.ok(file.includes(v.keelLineColour), `${v.file}: ${v.keelLineColour}`);
  }
});

test('paper-plane-orbit: no avatar placeholder, photo, background or controls inside the decoration', () => {
  for (const p of [0, 0.3, 0.45, 0.8]) {
    // the files' own clip rectangles (inside <clipPath>) only cut the drawing, they are never painted
    const svg = renderPaperPlaneOrbitSvg('t-', p).replace(/<clipPath\b[\s\S]*?<\/clipPath>/g, '');
    assert.match(svg, /^<svg[^>]*viewBox="0 0 512 512"/);
    assert.doesNotMatch(svg, /<circle\b/i);
    assert.doesNotMatch(svg, /<rect\b/i);
    assert.doesNotMatch(svg, /#?d9d9d9/i);
    for (const tag of ['text', 'image', 'foreignObject', 'input', 'button', 'script', 'style']) {
      assert.doesNotMatch(svg, new RegExp(`<${tag}\\b`, 'i'), `<${tag}>`);
    }
  }
});

test('paper-plane-orbit: exactly ONE plane on screen — the original drawing while it holds a view, the turning shape while it turns', () => {
  const svg = renderPaperPlaneOrbitSvg('t-', 0.45);
  assert.equal((svg.match(/data-part="plane"/g) ?? []).length, 1);
  for (let f = 0; f <= FRAME_COUNT; f++) {
    const fr = planeFrame(f / FRAME_COUNT);
    const o = [0, 1, 2].map((v) => Number(fr[`orig-${v}`].opacity));
    const first = Number(fr.first.opacity), morph = Number(fr.morph.opacity);
    assert.ok(o[0] + o[1] + o[2] <= 1, `frame ${f}: never two original drawings at once`);
    assert.ok(!(first > 0 && morph > 0), `frame ${f}: never two turning shapes`);
    assert.ok(o[0] + o[1] + o[2] + first + morph >= 1, `frame ${f}: the plane is always drawn`);
    // turn 1 ↔ 2 replaces the originals outright (it starts and ends exactly as them)
    if (first > 0) assert.equal(o[0] + o[1] + o[2], 0, `frame ${f}: turn 1 → 2 never overlaps an original`);
    // turn 2 ↔ 3 only overlaps an original in its first/last few frames, where they coincide
    if (morph > 0 && o[1] + o[2] > 0) assert.ok(states[f].blend < 0.1 || states[f].blend > 0.9, `frame ${f}: overlap only at the switch`);
  }
});

test('paper-plane-orbit: drawing 1 has the same structure as drawing 2 (element by element)', () => {
  assert.equal(FIRST.elements.length, SECOND.elements.length);
  FIRST.elements.forEach((e, i) => {
    const b = SECOND.elements[i];
    assert.equal(e.points === null, b.points === null, `element ${i}: both straight or both curved`);
    if (e.points) assert.equal(e.points.length, b.points!.length, `element ${i}: same number of points`);
    const style = (m: string) => m.replace(/\sd="[^"]*"/, '').replace(/url\(#paint(\d)_linear_\d+_\d+\)/g, 'url(#paint$1)');
    if (e.points) assert.equal(style(e.markup), style(b.markup), `element ${i}: same colours, widths, caps`);
  });
  assert.deepEqual(
    FIRST.gradients.map((g) => g.stops),
    SECOND.gradients.map((g) => g.stops),
    'same gradient colours',
  );
});

test('paper-plane-orbit: turn 1 ↔ 2 starts exactly as drawing 1 and ends exactly as drawing 2', () => {
  for (const [i, { first, second }] of Object.entries(FIRST_TURN_POINTS)) {
    first.forEach((p, k) => {
      for (const [t, want] of [[0, turnPoint(p, second[k], 0)], [1, turnPoint(p, second[k], 1)]] as const) {
        const got = firstTurnPoint(p, second[k], t, Number(i), k);
        assert.ok(Math.hypot(got[0] - want[0], got[1] - want[1]) < 0.01, `element ${i} point ${k} at t=${t}`);
      }
    });
    // the matched point lists draw the same shapes as the files (added points lie on the files' edges)
    assert.ok(first.length >= FIRST.elements[Number(i)].points!.length);
  }
});

test('paper-plane-orbit: two instances share no ids; every reference stays inside its instance', () => {
  const sets = [renderPaperPlaneOrbitSvg(uniquePrefix('pp')), renderPaperPlaneOrbitSvg(uniquePrefix('pp'))].map((svg) => {
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const own = new Set(ids);
    for (const m of svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) assert.ok(own.has(m[1]), m[1]);
    return own;
  });
  assert.deepEqual([...sets[0]].filter((id) => sets[1].has(id)), []);
});

test('paper-plane-orbit: independent — imports nothing from other decorations or the demo', () => {
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  for (const file of walk(DIR).filter((f) => f.endsWith('.ts'))) {
    for (const m of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      assert.ok(!/halloween|ghost|cat-ears|demo/i.test(spec), `${file} imports ${spec}`);
      assert.ok(spec.startsWith('./') || spec.startsWith('../'), `${file}: external import ${spec}`);
      if (spec.includes('shared')) assert.match(spec, /shared\/svg$/, `${file}: ${spec}`);
    }
  }
});

test('loop: 3 s, invisible at start and end, last frame = first frame (every attribute)', () => {
  assert.equal(LOOP_DURATION_MS, 3000);
  assert.equal(FRAME_COUNT, 180);
  assert.equal(states[0].opacity, 0);
  assert.equal(states[FRAME_COUNT].opacity, 0);
  assert.deepEqual(planeFrame(1), planeFrame(0));
});

test('story: drawing 1 far away → drawing 2 big and close → drawing 3 flying away and vanishing', () => {
  const at = (p: number) => planeState(p);
  const approach = at(0.15), close = at(0.46), away = at(0.76);
  assert.ok(close.scale / approach.scale >= 1.5 && close.scale / away.scale >= 1.5, 'clearly bigger when close');
  assert.ok(close.scale <= 1.3, 'not oversized');
  // the drawing shown at each moment
  const view = (s: ReturnType<typeof at>) => (s.blend < 0.01 ? s.viewA : s.blend > 0.99 ? s.viewB : -1);
  assert.equal(view(at(0.1)), 0, 'start: drawing 1');
  assert.equal(view(close), 1, 'close: drawing 2');
  assert.equal(view(at(0.8)), 2, 'flying away and vanishing: drawing 3');
  // the way back to drawing 1 happens only while invisible
  for (const s of states) if (s.viewA === 2 && s.viewB === 0 && s.blend > 0) assert.equal(s.opacity, 0, 'turn back to 1 is never seen');
  // fully visible while it is big, invisible while it returns behind the photo
  assert.equal(close.opacity, 1);
  for (const s of states.slice(Math.ceil(MOTION.fade.fadeOutEnd * FRAME_COUNT))) assert.equal(s.opacity, 0);
});

test('smooth: no jumps while the plane can be seen — position, size, shape (morph) and turn', () => {
  // the outline points of the plane at a moment (face of the 1 ↔ 2 turn, or the corner model for 2 ↔ 3)
  const corners = (s: ReturnType<typeof planeState>) => {
    const lo = Math.min(s.viewA, s.viewB), hi = Math.max(s.viewA, s.viewB);
    const t = s.viewA <= s.viewB ? s.blend : 1 - s.blend;
    if (lo === 0 && hi <= 1) {
      const { first, second } = FIRST_TURN_POINTS[0];
      return first.map((p, k) => firstTurnPoint(p, second[k], hi === 0 ? 0 : t, 0, k));
    }
    const A = VIEWS[Math.max(lo, 1) - 1], B = VIEWS[hi - 1];
    const cA = viewCentre(A), cB = viewCentre(B);
    return (Object.keys(A.corners) as CornerName[]).map((k) =>
      lerpPt([A.corners[k][0] - cA[0], A.corners[k][1] - cA[1]], [B.corners[k][0] - cB[0], B.corners[k][1] - cB[1]], lo === 0 ? 0 : t),
    );
  };
  for (let f = 0; f < FRAME_COUNT; f++) {
    const a = states[f], b = states[f + 1];
    assert.ok(Math.abs(b.opacity - a.opacity) < 0.1, `frame ${f}: opacity step`);
    if (Math.max(a.opacity, b.opacity) <= 0.05) continue;
    assert.ok(Math.hypot(b.x - a.x, b.y - a.y) < 10, `frame ${f}: position step`);
    assert.ok(Math.abs(b.scale - a.scale) < 0.03, `frame ${f}: size step`);
    assert.ok(Math.abs(b.rotate - a.rotate) < 3, `frame ${f}: turn step`);
    const ca = corners(a), cb = corners(b);
    if (ca.length !== cb.length) continue; // the switch from one turn model to the other happens at a drawing, where both are exact
    // corners move at most a few drawing units per frame (the drawing turns, it does not jump)
    ca.forEach((p, i) => assert.ok(Math.hypot(cb[i][0] - p[0], cb[i][1] - p[1]) < 6, `frame ${f}: corner ${i} step`));
  }
});

test('wind and bank: gentle', () => {
  assert.ok(Math.abs(MOTION.bank.degrees) <= 10, 'bank near the viewer within 10°');
  assert.ok(MOTION.wind.wobble <= 3, 'wobble within ±3°');
});

test('approved Paper Plane Orbit 1.0.0 is unchanged (markup and every attribute in all 180 frames)', () => {
  // If this fails, the look or the motion changed. That needs the owner's
  // approval and a new version — not a new fingerprint.
  assert.equal(PAPER_PLANE_ORBIT_META.id, 'paper-plane-orbit');
  assert.equal(PAPER_PLANE_ORBIT_META.version, '1.0.0');
  assert.equal(PAPER_PLANE_ORBIT_META.status.tgs, 'not-exported');
  assert.equal(sha256(renderPaperPlaneOrbitSvg('t-')), 'e08d3d77fc2a1133cb638ab5c32db7a445f1767569903359d27ba639e978e22d');
  const frames: string[] = [];
  for (let f = 0; f < FRAME_COUNT; f++) frames.push(JSON.stringify(planeFrame(f / FRAME_COUNT)));
  assert.equal(sha256(frames.join('\n')), 'de2609f23e95f10e53d2cfcf5f57c96ad1cfb37cad9e7b1fe4655d59671513e1');
});
