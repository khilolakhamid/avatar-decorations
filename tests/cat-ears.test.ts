/**
 * Automatic checks for Cat Ears 1.0.0.
 * Run: npm test
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  AVATAR_AREA,
  CAT_EARS_META,
  EAR_PARTS,
  EAR_PIVOT,
  earTransforms,
  FRAME_COUNT,
  leftEarAngle,
  LOOP_DURATION_MS,
  renderCatEarsSvg,
  RIGHT_EAR,
  rightEarAngle,
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

test('cat-ears: two ears from ONE ear definition, the left one mirrored', () => {
  const svg = renderCatEarsSvg('t-');
  assert.equal((svg.match(/id="t-ear"/g) ?? []).length, 1, 'ear defined once');
  assert.equal((svg.match(/<use href="#t-ear"\/>/g) ?? []).length, 2);
  assert.match(svg, /data-layer="ear-left" transform="translate\(512 0\) scale\(-1 1\)"/);
  assert.deepEqual([...svg.matchAll(/data-layer="([^"]+)"/g)].map((m) => m[1]), ['ear-left', 'ear-right']);
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

test('loop: 3 s, the last frame joins the first exactly', () => {
  assert.equal(LOOP_DURATION_MS, 3000);
  assert.equal(FRAME_COUNT, 180);
  assert.deepEqual(earTransforms(1), earTransforms(0));
  assert.ok(Math.abs(leftEarAngle(1) - leftEarAngle(0)) < 1e-9);
  assert.ok(Math.abs(rightEarAngle(1) - rightEarAngle(0)) < 1e-9);
  assert.deepEqual(EAR_PARTS, ['swing-left', 'swing-right']);
});

test('motion: gentle swing (out ≈ 3°, a little in), smooth, both ears together and mirrored', () => {
  let min = Infinity, max = -Infinity, maxStep = 0;
  for (let f = 0; f < 180; f++) {
    const l = leftEarAngle(f / 180), r = rightEarAngle(f / 180);
    min = Math.min(min, l, r);
    max = Math.max(max, l, r);
    maxStep = Math.max(maxStep, Math.abs(leftEarAngle((f + 1) / 180) - l), Math.abs(rightEarAngle((f + 1) / 180) - r));
    // same amplitude, speed and timing: the right ear turns exactly as much as the left one, at the same moment
    assert.equal(l, r, `frame ${f}`);
  }
  assert.ok(max >= 2 && max <= 4, `outwards up to ${max.toFixed(2)}°`);
  assert.ok(min < 0 && min > -2, `inwards down to ${min.toFixed(2)}°`);
  assert.ok(maxStep < 0.15, `no jump: largest step ${maxStep.toFixed(3)}° per frame`);
});

test('approved Cat Ears 1.0.0 is unchanged (markup and both ears in all 180 frames)', () => {
  // If this fails, the look or the motion changed. That needs the owner's
  // approval and a new version — not a new fingerprint.
  assert.equal(CAT_EARS_META.id, 'cat-ears');
  assert.equal(CAT_EARS_META.version, '1.0.0');
  assert.equal(CAT_EARS_META.status.tgs, 'not-exported');
  assert.equal(sha256(renderCatEarsSvg('t-')), '11c3d3c79f9eef404d5ace20725851f85095cca08c1cf750e2aa0563b8e79318');
  const frames: string[] = [];
  for (let f = 0; f < 180; f++) {
    const t = earTransforms(f / 180);
    frames.push(`${t['swing-left']}|${t['swing-right']}`);
  }
  assert.equal(sha256(frames.join('\n')), '27793ba527b0c6603d9fe3cccf437fb809623b7cedf9111f51fcec77360de6e7');
});
