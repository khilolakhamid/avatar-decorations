/**
 * Automatic checks for Ghost Orbit 1.0.0.
 * Run: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { FPS, FRAME_COUNT, GHOST_ORBIT_META, ghostMotion, ghostPose, LOOP_DURATION_MS, ORBIT, renderGhostOrbitSvg, STEP_DEG } from '../src/decorations/ghost-orbit';
import { GHOST_PARTS, ghostTransforms } from '../src/decorations/ghost-orbit/component/composition';
import { SOURCE_SHA256 } from '../src/decorations/ghost-orbit/assets/sources.generated';
import { uniquePrefix } from '../src/shared/svg';

const ROOT = process.env.PROJECT_ROOT ?? process.cwd();
const ASSETS_DIR = join(ROOT, 'src/decorations/ghost-orbit/assets');
const sha256 = (d: string | Buffer) => createHash('sha256').update(d).digest('hex');

/** SHA-256 of the owner's original vectors (new ghost + face received 2026-10-28). */
const ORIGINAL_SVG_SHA256: Record<string, string> = {
  'face.svg': 'd0841205edfbdc35bf727e5462471387c6998a0a66572ba516efd7797f0f4a56',
  'ghost.svg': '6df234adc9f6ca012a05a4b27c24b217e3b68400b7f6adc46282aa415853b21d',
};

test('ghost-orbit: the original SVG files (ghost, face) are unchanged and embedded byte for byte', () => {
  const files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.svg')).sort();
  assert.deepEqual(files, Object.keys(ORIGINAL_SVG_SHA256).sort());
  for (const f of files) assert.equal(sha256(readFileSync(join(ASSETS_DIR, f))), ORIGINAL_SVG_SHA256[f], f);
  assert.deepEqual(SOURCE_SHA256, ORIGINAL_SVG_SHA256);
});

test('ghost-orbit: no avatar placeholder, background or controls inside the decoration', () => {
  for (const phase of [0, 0.37, 0.81]) {
    const svg = renderGhostOrbitSvg('t-', phase);
    assert.match(svg, /^<svg[^>]*viewBox="0 0 512 512"/);
    assert.doesNotMatch(svg, /<circle\b/i);
    assert.doesNotMatch(svg.replace(/<clipPath\b[\s\S]*?<\/clipPath>/g, ''), /<rect\b/i);
    assert.doesNotMatch(svg, /#?d9d9d9/i);
    for (const tag of ['text', 'image', 'foreignObject', 'input', 'button', 'script', 'style']) {
      assert.doesNotMatch(svg, new RegExp(`<${tag}\\b`, 'i'), `<${tag}>`);
    }
  }
});

test('ghost-orbit: independent — imports nothing from other decorations or the demo', () => {
  const dir = join(ROOT, 'src/decorations/ghost-orbit');
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  for (const file of walk(dir).filter((f) => f.endsWith('.ts'))) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      assert.ok(!/halloween|demo/i.test(spec), `${file} imports ${spec}`);
      // only its own files and the shared SVG helpers
      assert.ok(spec.startsWith('./') || spec.startsWith('../') , `${file}: external import ${spec}`);
      if (spec.includes('shared')) assert.match(spec, /shared\/svg$/, `${file}: ${spec}`);
    }
  }
});

test('ghost-orbit: no clouds and no stars — only the five ghosts', () => {
  const svg = renderGhostOrbitSvg('t-');
  assert.deepEqual([...svg.matchAll(/data-layer="([^"]+)"/g)].map((m) => m[1]), ['ghosts']);
  assert.doesNotMatch(svg, /cloud|star/i);
  // colours of the removed vectors
  assert.doesNotMatch(svg, /#60447B|#DBC2FF|#FFD588/i);
  assert.equal((svg.match(/data-part="[^"]+"/g) ?? []).length, 35, '5 ghosts × (ghost, body, shape, face, mouth, 2 eyes), nothing else');
});

test('ghost-orbit: five ghosts reuse ONE ghost definition (body + face)', () => {
  const svg = renderGhostOrbitSvg('t-');
  assert.equal((svg.match(/data-part="ghost-\d"/g) ?? []).length, 5);
  assert.equal((svg.match(/<use href="#t-ghost"\/>/g) ?? []).length, 5);
  for (const part of ['mouth', 'eye-left', 'eye-right']) {
    assert.equal((svg.match(new RegExp(`<use href="#t-face-${part}"/>`, 'g')) ?? []).length, 5, part);
    assert.equal((svg.match(new RegExp(`id="t-face-${part}"`, 'g')) ?? []).length, 1, `${part} defined once`);
  }
  assert.equal((svg.match(/id="t-ghost"/g) ?? []).length, 1, 'body defined once');
});

test('ghost-orbit: two instances share no ids; every reference stays inside its instance', () => {
  const sets = [renderGhostOrbitSvg(uniquePrefix('go')), renderGhostOrbitSvg(uniquePrefix('go'))].map((svg) => {
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const own = new Set(ids);
    for (const m of svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) assert.ok(own.has(m[1]), m[1]);
    return own;
  });
  assert.deepEqual([...sets[0]].filter((id) => sets[1].has(id)), []);
});

/* ---------- approved version 1.0.0 (2026-10-28) ---------- */

test('approved Ghost Orbit 1.0.0 is unchanged (markup and every transform of all 180 frames)', () => {
  // If this fails, the look or the motion changed. That needs the owner's
  // approval and a new version — not a new fingerprint.
  assert.equal(GHOST_ORBIT_META.version, '1.0.0');
  assert.equal(GHOST_ORBIT_META.status.tgs, 'not-exported');
  assert.equal(LOOP_DURATION_MS, 3000);
  assert.equal(FPS, 60);
  assert.equal(FRAME_COUNT, 180);
  assert.equal(sha256(renderGhostOrbitSvg('t-')), 'a3a54126db49266164182a02b807b4812c187c3816b2edc70cac03106d15af45');
  const frames: string[] = [];
  for (let f = 0; f < 180; f++)
    for (let i = 0; i < ORBIT.count; i++) frames.push(GHOST_PARTS.map((k) => ghostTransforms(i, f / 180)[k]).join('|'));
  assert.equal(sha256(frames.join('\n')), 'a835c8ac000391ec5956dcbed168b6fe59892f04165d523bbc6b0f0bc370d701');
});

/* ---------- seamless loop and motion ---------- */

const close = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;
const sameAngle = (a: number, b: number) => close((((a - b) % 360) + 540) % 360 - 180, 0, 1e-9);

test('orbit: after one loop (72°) every ghost stands exactly where its neighbour started', () => {
  assert.equal(STEP_DEG, 72);
  for (let i = 0; i < ORBIT.count; i++) {
    const end = ghostPose(i, 1);
    const neighbourStart = ghostPose((i - 1 + ORBIT.count) % ORBIT.count, 0);
    assert.ok(close(end.x, neighbourStart.x) && close(end.y, neighbourStart.y), `ghost ${i} position`);
    assert.ok(sameAngle(end.rotate, neighbourStart.rotate), `ghost ${i} rotation`);
    assert.equal(end.scale, neighbourStart.scale);
  }
});

test('loop: the whole picture at the end of the loop equals the picture at its start', () => {
  // every ghost = tuple of all its transforms; compare the 5 tuples as sets
  const norm = (t: string) =>
    t.replace(/rotate\((-?[\d.]+)\)/g, (_, a) => `rotate(${Math.round((((Number(a) + 540) % 360) - 180) * 100) / 100})`)
      .replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 100) / 100));
  const ghosts = (phase: number) =>
    Array.from({ length: ORBIT.count }, (_, i) => GHOST_PARTS.map((k) => norm(ghostTransforms(i, phase)[k])).join(' | ')).sort();
  assert.deepEqual(ghosts(1), ghosts(0));
  // and the motion is really there: frames inside the loop differ from the start
  assert.notDeepEqual(ghosts(0.5), ghosts(0));
});

test('loop: every motion is smooth — no jump between neighbouring frames (180 frames)', () => {
  const nums = (phase: number) =>
    Array.from({ length: ORBIT.count }, (_, i) => {
      const m = ghostMotion(ghostPose(i, phase).theta);
      return [m.sway, m.swish, m.breathX, m.breathY, m.look, m.mouth];
    }).flat();
  for (let f = 0; f < 180; f++) {
    const a = nums(f / 180), b = nums((f + 1) / 180);
    a.forEach((v, k) => assert.ok(Math.abs(v - b[k]) < (k % 6 < 2 ? 0.6 : 0.15), `frame ${f}: value ${k} jumps ${v} → ${b[k]}`));
  }
});

test('motion: gentle sway, clear look-around, mouth opens, ghosts not in step', () => {
  let maxSway = 0, left = 0, right = 0, centre = 0, open = 0;
  for (let f = 0; f < 180; f++) {
    const ms = Array.from({ length: ORBIT.count }, (_, i) => ghostMotion(ghostPose(i, f / 180).theta));
    for (const m of ms) {
      maxSway = Math.max(maxSway, Math.abs(m.sway));
      assert.ok(m.look >= -1 && m.look <= 1 && m.mouth >= 0 && m.mouth <= 1);
      if (m.look <= -0.99) left++;
      if (m.look >= 0.99) right++;
      if (Math.abs(m.look) < 0.01) centre++;
      if (m.mouth > 0.99) open++;
    }
    // the five ghosts never sway or look the same way at the same moment
    assert.ok(new Set(ms.map((m) => Math.round(m.sway * 10))).size > 1, `frame ${f}: all ghosts sway alike`);
    assert.ok(new Set(ms.map((m) => Math.round(m.look * 100))).size > 1, `frame ${f}: all ghosts look alike`);
  }
  assert.ok(maxSway <= 5 && maxSway >= 3, `body sway ±${maxSway}°`);
  // over the loop the ghosts really look left, right and straight, and say "А-а-а"
  for (const [n, what] of [[left, 'left'], [right, 'right'], [centre, 'straight'], [open, 'mouth open']] as const) {
    assert.ok(n > 30, `${what}: ${n} ghost-frames`);
  }
});

test('orbit: the ghosts move counter-clockwise on screen, at constant speed and radius', () => {
  for (let i = 0; i < ORBIT.count; i++) {
    const a = ghostPose(i, 0), b = ghostPose(i, 0.01);
    // screen y points down: counter-clockwise on screen ⇔ cross product (r × v) < 0
    const cross = (a.x - ORBIT.cx) * (b.y - a.y) - (a.y - ORBIT.cy) * (b.x - a.x);
    assert.ok(cross < 0, `ghost ${i} turns counter-clockwise`);
    for (const p of [0, 0.25, 0.5, 0.75, 1]) {
      const q = ghostPose(i, p);
      assert.ok(close(Math.hypot(q.x - ORBIT.cx, q.y - ORBIT.cy), ORBIT.r, 1e-9), 'constant radius');
    }
  }
  // the top ghost (≈ −81°) heads to the left
  const top = [ghostPose(0, 0), ghostPose(0, 0.1)];
  assert.ok(top[1].x < top[0].x);
});
