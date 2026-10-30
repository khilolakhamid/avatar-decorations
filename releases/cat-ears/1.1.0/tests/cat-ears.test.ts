/**
 * Automatic checks for Cat Ears 1.1.0 (approved 2026-10-30; 1.0.0 stays frozen in releases/cat-ears/1.0.0/).
 * Run: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  AVATAR_AREA,
  bendPoint,
  bendShare,
  CAT_EARS_META,
  EAR_PIVOT,
  EAR_SIDES,
  earBends,
  earFrame,
  FRAME_COUNT,
  leftEarAngle,
  LOOP_DURATION_MS,
  renderCatEarsSvg,
  RIGHT_EAR,
  rightEarAngle,
  swayAngle,
  swayShare,
} from '../src/decorations/cat-ears';
import { SOURCE_SHA256 } from '../src/decorations/cat-ears/assets/sources.generated';
import { uniquePrefix } from '../src/shared/svg';

const ROOT = process.env.PROJECT_ROOT ?? process.cwd();
const DIR = join(ROOT, 'src/decorations/cat-ears');
const sha256 = (d: string | Buffer) => createHash('sha256').update(d).digest('hex');

/** SHA-256 of the owner's original vector (received 2026-10-30). */
const ORIGINAL_SVG_SHA256: Record<string, string> = {
  'ear.svg': 'db36cc1346df01c159d75ff61afff878b9b6a1f0dbc82522f9321e8980a92809',
};

test('cat-ears: the original ear.svg is unchanged and embedded byte for byte', () => {
  const files = readdirSync(join(DIR, 'assets')).filter((f) => f.endsWith('.svg')).sort();
  assert.deepEqual(files, Object.keys(ORIGINAL_SVG_SHA256));
  for (const f of files) assert.equal(sha256(readFileSync(join(DIR, 'assets', f))), ORIGINAL_SVG_SHA256[f], f);
  assert.deepEqual(SOURCE_SHA256, ORIGINAL_SVG_SHA256);
});

test('cat-ears: no avatar placeholder, photo, background or controls inside the decoration', () => {
  for (const p of [0, 0.3, 0.8]) {
    const svg = renderCatEarsSvg('t-', p);
    assert.match(svg, /^<svg[^>]*viewBox="0 0 512 512"/);
    assert.doesNotMatch(svg, /<circle\b/i);
    assert.doesNotMatch(svg, /<rect\b/i);
    assert.doesNotMatch(svg, /#?d9d9d9/i);
    for (const tag of ['text', 'image', 'foreignObject', 'input', 'button', 'script', 'style']) {
      assert.doesNotMatch(svg, new RegExp(`<${tag}\\b`, 'i'), `<${tag}>`);
    }
  }
});

test('cat-ears: two ears from the same original elements, the left one mirrored', () => {
  const svg = renderCatEarsSvg('t-');
  const elements = (readFileSync(join(DIR, 'assets', 'ear.svg'), 'utf8').match(/<path\b/g) ?? []).length;
  assert.equal((svg.match(/<path\b/g) ?? []).length, 2 * elements, 'every element of ear.svg, once per ear');
  assert.match(svg, /data-layer="ear-left" transform="translate\(512 0\) scale\(-1 1\)"/);
  assert.deepEqual([...svg.matchAll(/data-layer="([^"]+)"/g)].map((m) => m[1]), ['ear-left', 'ear-right']);
  // colours, strokes and widths are the file's own
  for (const c of ['#F9F6F5', '#D5CCE5']) assert.ok(svg.includes(c));
});

test('cat-ears: two instances share no ids; every reference stays inside its instance', () => {
  const sets = [renderCatEarsSvg(uniquePrefix('ce')), renderCatEarsSvg(uniquePrefix('ce'))].map((svg) => {
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length);
    const own = new Set(ids);
    for (const m of svg.matchAll(/(?:url\(#|href="#)([^)"]+)/g)) assert.ok(own.has(m[1]), m[1]);
    return own;
  });
  assert.deepEqual([...sets[0]].filter((id) => sets[1].has(id)), []);
});

test('cat-ears: independent — imports nothing from other decorations or the demo', () => {
  const walk = (d: string): string[] =>
    readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  for (const file of walk(DIR).filter((f) => f.endsWith('.ts'))) {
    for (const m of readFileSync(file, 'utf8').matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)) {
      const spec = m[1];
      assert.ok(!/halloween|ghost|demo/i.test(spec), `${file} imports ${spec}`);
      assert.ok(spec.startsWith('./') || spec.startsWith('../'), `${file}: external import ${spec}`);
      if (spec.includes('shared')) assert.match(spec, /shared\/svg$/, `${file}: ${spec}`);
    }
  }
});

test('layout: same canvas and photo place as the other decorations; ears at original size', () => {
  assert.deepEqual(AVATAR_AREA, { cx: 256, cy: 256, r: 218 });
  assert.deepEqual(RIGHT_EAR, { x: 341, y: 13, scale: 1 });
  // the swing pivot (base of the ear) lies on the photo, so the ear never leaves it
  const [px, py] = EAR_PIVOT;
  const d = Math.hypot(RIGHT_EAR.x + px - AVATAR_AREA.cx, RIGHT_EAR.y + py - AVATAR_AREA.cy);
  assert.ok(d < AVATAR_AREA.r, `pivot ${d.toFixed(1)} from the centre`);
});

test('loop: 3 s, the last frame joins the first exactly — also in speed', () => {
  assert.equal(LOOP_DURATION_MS, 3000);
  assert.equal(FRAME_COUNT, 180);
  assert.deepEqual(earFrame(1), earFrame(0));
  for (const fn of [leftEarAngle, rightEarAngle]) {
    const speedEnd = fn(1) - fn(179 / 180), speedStart = fn(1 / 180) - fn(0);
    assert.ok(Math.abs(speedEnd - speedStart) < 0.15, `speed across the seam ${speedEnd.toFixed(3)} / ${speedStart.toFixed(3)}`);
  }
  assert.deepEqual([...EAR_SIDES], ['left', 'right']);
});

test('bend: the base stays on the photo, only the upper part and the tip move', () => {
  // base corners of the ear (lower-left corner and lowest point) do not move at all
  for (const base of [[51.22, 142.91], [133, 215.5], [96.5, 185.88], [53.99, 138.41]] as const) {
    assert.equal(bendShare(base), 0, `base point ${base}`);
    assert.equal(swayShare(base), 0, `base point ${base} (sway)`);
    assert.deepEqual(bendPoint(base, 10, 4), base);
  }
  assert.equal(bendShare([133, 6.21]), 1, 'the tip gets the full bend');
  // pivot (middle of the base) lies on the photo
  const [px, py] = EAR_PIVOT;
  assert.ok(Math.hypot(RIGHT_EAR.x + px - AVATAR_AREA.cx, RIGHT_EAR.y + py - AVATAR_AREA.cy) < AVATAR_AREA.r);
});

test('motion: much livelier than 1.0.0 (2–3× the tip travel), springy, the two ears not identical, smooth', () => {
  const tipLen = Math.hypot(133 - EAR_PIVOT[0], 6.21 - EAR_PIVOT[1]);
  const oldTravel = tipLen * (3 * Math.PI) / 180; // 1.0.0: whole ear turned up to 3°
  let maxOut = 0, minIn = 0, maxStep = 0, differ = 0, opposite = false;
  for (let f = 0; f < FRAME_COUNT; f++) {
    const b = earBends(f / FRAME_COUNT), n = earBends((f + 1) / FRAME_COUNT);
    maxOut = Math.max(maxOut, b.left, b.right);
    minIn = Math.min(minIn, b.left, b.right);
    maxStep = Math.max(maxStep, Math.abs(n.left - b.left), Math.abs(n.right - b.right));
    if (Math.abs(b.left - b.right) > 1) differ++;
    if (b.left > 3 && b.right < -3) opposite = true;
  }
  const newTravel = tipLen * (maxOut * Math.PI) / 180;
  assert.ok(newTravel / oldTravel >= 2 && newTravel / oldTravel <= 4, `tip travel ×${(newTravel / oldTravel).toFixed(1)}`);
  assert.ok(minIn < -2, 'springs back past the rest');
  assert.ok(maxOut <= 12, `no folding: tip bend up to ${maxOut.toFixed(1)}°`);
  assert.ok(differ > 60, 'the ears move independently');
  assert.ok(opposite, 'once the ears lean to opposite sides together');
  assert.ok(maxStep < 1.2, `no jerks: largest step ${maxStep.toFixed(2)}° per frame`);
});

test('whole-ear sway: gentler than the tip, smooth and seamless, the ears out of phase, not rubbery together', () => {
  let maxSway = 0, maxTotal = 0, maxStep = 0, differ = 0;
  for (let f = 0; f < FRAME_COUNT; f++) {
    const p = f / FRAME_COUNT;
    for (const side of ['left', 'right'] as const) {
      const sw = swayAngle(p, side);
      const tip = side === 'left' ? leftEarAngle(p) : rightEarAngle(p);
      maxSway = Math.max(maxSway, Math.abs(sw));
      maxTotal = Math.max(maxTotal, Math.abs(sw + tip));
      maxStep = Math.max(maxStep, Math.abs(swayAngle((f + 1) / FRAME_COUNT, side) - sw));
    }
    if (Math.abs(swayAngle(p, 'left') - swayAngle(p, 'right')) > 1) differ++;
  }
  assert.ok(maxSway >= 2.5 && maxSway < 6, `sway up to ${maxSway.toFixed(2)}° (noticeable, below the tip's 10°)`);
  assert.ok(maxTotal <= 15, `tip + sway together up to ${maxTotal.toFixed(1)}°`);
  assert.ok(maxStep < 0.25, `soft: largest sway step ${maxStep.toFixed(3)}° per frame`);
  assert.ok(differ > 60, 'the two ears sway out of phase');
  for (const side of ['left', 'right'] as const) {
    assert.ok(Math.abs(swayAngle(1, side) - swayAngle(0, side)) < 1e-9);
    const end = swayAngle(1, side) - swayAngle(179 / 180, side), start = swayAngle(1 / 180, side) - swayAngle(0, side);
    assert.ok(Math.abs(end - start) < 0.01, 'same speed across the loop seam');
  }
});

test('approved Cat Ears 1.0.0 stays frozen in releases/cat-ears/1.0.0/ (not overwritten by 1.1.0)', () => {
  const rel = join(ROOT, 'releases/cat-ears/1.0.0');
  // inside a standalone release copy there is no releases/ folder: nothing to check there
  if (!existsSync(rel)) return;
  assert.equal(sha256(readFileSync(join(rel, 'dist/index.js'))), 'b3ad018aaeccfa4fcbd83d0fae76788b4b50ab59ed6e2224c74ba879152738c4');
  assert.equal(sha256(readFileSync(join(rel, 'src/decorations/cat-ears/component/motion.ts'))), 'e331ed4babb13c3df57d179d015d8f7921227f6aaca0701645dc31206ca1f20f');
});

test('approved Cat Ears 1.1.0 is unchanged (markup and every attribute of both ears in all 180 frames)', () => {
  // If this fails, the look or the motion changed. That needs the owner's
  // approval and a new version — not a new fingerprint.
  assert.equal(CAT_EARS_META.id, 'cat-ears');
  assert.equal(CAT_EARS_META.version, '1.1.0');
  assert.equal(CAT_EARS_META.status.tgs, 'not-exported');
  assert.equal(sha256(renderCatEarsSvg('t-')), '799a776fa94ab0ca1963671161d092be2b92d108f2b183c998bc5bb80706bd84');
  const frames: string[] = [];
  for (let f = 0; f < FRAME_COUNT; f++) frames.push(JSON.stringify(earFrame(f / FRAME_COUNT)));
  assert.equal(sha256(frames.join('\n')), 'bcaf76da767df35ab1094fa32d02fbedc0d2c3300bd461a65c8d5ef19c1047f6');
});
