/**
 * Automatic checks for the approved Halloween Pumpkin decoration (1.0.0).
 * Run: npm test   (no browser needed)
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { HALLOWEEN_PUMPKIN_META, renderHalloweenPumpkinSvg } from '../src/decorations/halloween-pumpkin';
import { ASSET_SOURCES } from '../src/decorations/halloween-pumpkin/assets';
import { SOURCE_SHA256 } from '../src/decorations/halloween-pumpkin/assets/sources.generated';
import { createTimeline, FRAME_COUNT } from '../src/decorations/halloween-pumpkin/animation/timeline';
import {
  DEFAULTS,
  lerpNumber,
  lerpPath,
  sample,
  TRANSFORM_PROPS,
  validateTimeline,
  type PathData,
} from '../src/shared/animation';
import { uniquePrefix } from '../src/shared/svg';

const ROOT = process.env.PROJECT_ROOT ?? process.cwd();
const ASSETS_DIR = join(ROOT, 'src/decorations/halloween-pumpkin/assets');
const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');

/** SHA-256 of the 9 approved original vectors (owner's final files, 2026-10-28). */
const APPROVED_SVG_SHA256: Record<string, string> = {
  'bat_head.svg': 'd485dcbb3e1444788b94ce7eaa34275db59511bbc8b053ceedea32bb3cba0619',
  'leaf_1.svg': '1386ccad1df3a1e92ce1a6c3a00e2abf4da8b37fc36cee0df4513755a7a9d18a',
  'leaf_2.svg': '99eef8f3dcb563fa9d8fb6185aee90d23a77247cae3cd685fb4374f9c7e41643',
  'left_wing.svg': '6021d960b0d4e6d7bdc54098d3a08cc14e5213e618a2859ce996b686f033bfd0',
  'mini pumpkin.svg': 'f85e2ecfc5f93c8013e2e4213f5ef642e813c36016f152e7caf8433223f4c754',
  'plant.svg': '65c1976ed24c20ccdc364d0bec20e0b5947094599292eabd1d09f215a7296c99',
  'pumpkin.svg': '41b951e495072498b7efe02fcf1b940188c52c2fde575e81b322016614fe31d9',
  'right_wing.svg': '362c83cd069d508f8ddc8e23dcbd8fde2e0201355a9e4a678111cc4bb8e5b70f',
  'tail.svg': 'b23be81a079c87953a98c92669d64ee22a358991022417dd1412438ccbfd4097',
};

/* ---------------- 1. no jump at the loop boundary ---------------- */

test('loop: every track ends exactly where it starts (built-in validator)', () => {
  const timeline = createTimeline(ASSET_SOURCES);
  assert.equal(timeline.frames, 180);
  assert.equal(timeline.fps, 60);
  assert.deepEqual(validateTimeline(timeline), []);
});

test('loop: frame 179.999 is visually the same as frame 0 for every moving part', () => {
  const timeline = createTimeline(ASSET_SOURCES);
  const end = FRAME_COUNT - 0.001;
  for (const [part, anim] of Object.entries(timeline.parts)) {
    for (const prop of TRANSFORM_PROPS) {
      const keys = anim[prop];
      if (!keys) continue;
      const a = sample(keys, 0, lerpNumber);
      const b = sample(keys, end, lerpNumber);
      // tolerance: 0.01 px / 0.01° / 0.0001 scale or opacity
      const tol = prop === 'x' || prop === 'y' || prop === 'rotate' ? 0.01 : 1e-4;
      assert.ok(Math.abs(a - b) <= tol, `${part}.${prop}: ${a} vs ${b} (default ${DEFAULTS[prop]})`);
    }
  }
  for (const [part, keys] of Object.entries(timeline.morphs)) {
    const a = sample<PathData>(keys, 0, lerpPath).values;
    const b = sample<PathData>(keys, end, lerpPath).values;
    const worst = Math.max(...a.map((v, i) => Math.abs(v - b[i])));
    assert.ok(worst <= 0.01, `${part}: shape differs by ${worst} px`);
  }
});

/* ---------- 2. no grey avatar circle and no test UI inside ---------- */

test('decoration markup contains no avatar placeholder, controls or background', () => {
  const svg = renderHalloweenPumpkinSvg('t-');
  const withoutClipPaths = svg.replace(/<clipPath\b[\s\S]*?<\/clipPath>/g, '');
  assert.match(svg, /^<svg[^>]*viewBox="0 0 512 512"/);
  assert.doesNotMatch(svg, /<circle\b/i, 'no circle (the grey avatar lives in the demo only)');
  assert.doesNotMatch(withoutClipPaths, /<rect\b/i, 'no rectangles outside clip paths (no background)');
  assert.doesNotMatch(svg, /#?d9d9d9/i, 'no grey placeholder colour');
  for (const tag of ['text', 'image', 'foreignObject', 'input', 'button', 'select', 'script', 'style', 'iframe']) {
    assert.doesNotMatch(svg, new RegExp(`<${tag}\\b`, 'i'), `no <${tag}>`);
  }
  assert.doesNotMatch(svg, /\bon[a-z]+=/i, 'no event handlers');
});

test('the decoration does not import anything from the demo or the reference', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith('.ts') ? [join(dir, e.name)] : [],
    );
  const files = [...walk(join(ROOT, 'src/decorations/halloween-pumpkin')), ...walk(join(ROOT, 'src/shared'))];
  for (const file of files) {
    const imports = [...readFileSync(file, 'utf8').matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
    for (const spec of imports) {
      assert.ok(!/demo|reference/.test(spec), `${file} imports ${spec}`);
    }
  }
});

/* ---------- 3. no SVG id conflicts between instances ---------- */

test('two instances on one page share no ids, and every reference stays inside its own instance', () => {
  const instances = [renderHalloweenPumpkinSvg(uniquePrefix('hp')), renderHalloweenPumpkinSvg(uniquePrefix('hp'))];
  const idSets = instances.map((svg) => {
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, 'duplicate id inside one instance');
    const refs = [
      ...[...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]),
      ...[...svg.matchAll(/href="#([^"]+)"/g)].map((m) => m[1]),
    ];
    const own = new Set(ids);
    for (const ref of refs) assert.ok(own.has(ref), `reference #${ref} does not point inside its instance`);
    return own;
  });
  const shared = [...idSets[0]].filter((id) => idSets[1].has(id));
  assert.deepEqual(shared, [], 'ids shared between instances');
  assert.ok(idSets[0].size > 30, 'expected the gradients and clip paths to have ids');
});

/* ---------- 4. original vectors are unchanged ---------- */

test('the 9 original SVG files are present and byte-identical to the approved ones', () => {
  const files = readdirSync(ASSETS_DIR).filter((f) => f.endsWith('.svg')).sort();
  assert.deepEqual(files, Object.keys(APPROVED_SVG_SHA256).sort());
  for (const file of files) {
    assert.equal(sha256(readFileSync(join(ASSETS_DIR, file))), APPROVED_SVG_SHA256[file], file);
  }
});

test('the embedded SVG text equals the original files byte for byte', () => {
  assert.deepEqual(SOURCE_SHA256, APPROVED_SVG_SHA256);
  const byFile: Record<string, string> = {
    'pumpkin.svg': ASSET_SOURCES.pumpkin,
    'plant.svg': ASSET_SOURCES.plant,
    'mini pumpkin.svg': ASSET_SOURCES.miniPumpkin,
    'tail.svg': ASSET_SOURCES.tail,
    'leaf_1.svg': ASSET_SOURCES.leaf1,
    'leaf_2.svg': ASSET_SOURCES.leaf2,
    'bat_head.svg': ASSET_SOURCES.batHead,
    'left_wing.svg': ASSET_SOURCES.leftWing,
    'right_wing.svg': ASSET_SOURCES.rightWing,
  };
  for (const [file, text] of Object.entries(byFile)) {
    assert.equal(text, readFileSync(join(ASSETS_DIR, file), 'utf8'), file);
  }
});

/* ---------- 5. approved composition and motion are unchanged ---------- */

/**
 * Fingerprints of the approved 1.0.0 composition (positions, layers) and of
 * the full keyframe data (timings, amplitudes, pivots, eye and plant shapes).
 * If one of these fails, the look or the motion has changed — that needs the
 * owner's approval and a new version, not an update of these numbers.
 */
const APPROVED_MARKUP_SHA256 = 'e1af3eaf860503663f901f8d272acb9a85ba5a819ffef32bfb45b5439df32745';
const APPROVED_TIMELINE_SHA256 = '9f36f5271b7f3c26c8f841afca4f96579a575f9b8235b2d7dfc25fce2d57d93c';

test('approved composition (markup) is unchanged', () => {
  assert.equal(sha256(renderHalloweenPumpkinSvg('hp-')), APPROVED_MARKUP_SHA256);
});

test('approved animation (all keyframes) is unchanged', () => {
  assert.equal(sha256(JSON.stringify(createTimeline(ASSET_SOURCES))), APPROVED_TIMELINE_SHA256);
});

test('version 1.0.0 is approved for the web; TGS is marked as not exported', () => {
  assert.equal(HALLOWEEN_PUMPKIN_META.version, '1.0.0');
  assert.equal(HALLOWEEN_PUMPKIN_META.status.web, 'approved');
  assert.equal(HALLOWEEN_PUMPKIN_META.status.tgs, 'not-exported');
});
