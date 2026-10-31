// Avatar decoration try-on on the Your Color screen.
// The approved releases must stay untouched; the prototype only uses their builds.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const repo = join(root, '../..');
let browser;
let page;
const C = '.screen--your-color';
const settle = () => page.waitForTimeout(450);

async function rect(selector) {
  return page.evaluate((sel) => {
    const screen = document.querySelector('.device__screen').getBoundingClientRect();
    const node = document.querySelector(sel);
    if (!node) return null;
    const r = node.getBoundingClientRect();
    return { x: r.left - screen.left, y: r.top - screen.top, width: r.width, height: r.height };
  }, selector);
}

function near(actual, expected, label, tolerance = 0.51) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: expected ${expected}, got ${actual}`);
}

const state = () =>
  page.evaluate(() => {
    const d = window.prototype.yourColor().decorations;
    const screen = document.querySelector('.device__screen').getBoundingClientRect();
    return {
      index: d.index,
      position: d.position,
      worn: document.querySelector('.screen--your-color .avatar__decoration').dataset.decoration ?? null,
      liveCount: d.liveCount(),
      placeCount: d.placeCount(),
      holders: [...document.querySelectorAll('.screen--your-color .deco-holder')].map((h) => {
        const r = h.getBoundingClientRect();
        const cs = getComputedStyle(h);
        return {
          id: h.dataset.decoration,
          kind: h.dataset.kind,
          role: h.dataset.role,
          opacity: Number(cs.opacity),
          visible: cs.visibility !== 'hidden' && Number(cs.opacity) > 0.001,
          x: r.left - screen.left, y: r.top - screen.top, size: r.width,
        };
      }),
    };
  });

/** ids at [left, avatar, right] */
const triple = (s) => ['left', 'worn', 'right'].map((r) => s.holders.find((h) => h.role === r)?.id ?? null);

const INK = { 'christmas-lights': [-17, -15, 426, 303], 'paper-plane-orbit': [2, 96, 492, 412], none: [36, 36, 476, 476], 'ghost-orbit': [-17.66, -25.72, 529.66, 537.72], 'halloween-pumpkin': [8, 0, 516.72, 516], 'cat-ears': [-7, 11, 514, 238] };
const centreOf = (h) => ({ x: h.x + h.size / 2, y: h.y + h.size / 2 });
const inkRect = (h) => {
  const [x0, y0, x1, y1] = INK[h.id];
  const k = h.size / 512;
  return { left: h.x + x0 * k, top: h.y + y0 * k, right: h.x + x1 * k, bottom: h.y + y1 * k };
};
const byRole = (s, role) => s.holders.find((h) => h.role === role);
const ORDER = ['none', 'paper-plane-orbit', 'cat-ears', 'christmas-lights', 'ghost-orbit', 'halloween-pumpkin'];
/** Catalogue neighbour of `id` (cyclic). */
const at = (id, d) => ORDER[(ORDER.indexOf(id) + d + ORDER.length) % ORDER.length];

/** Drag on the preview card from the small decoration, `dx` in screen points of the phone. */
async function drag(dx, { release = true, steps = 12 } = {}) {
  const box = await page.locator(`${C} .deco-carousel`).boundingBox();
  const zoom = await page.evaluate(() => {
    const h = document.querySelector('.screen--your-color .color-preview');
    return h.getBoundingClientRect().width / h.offsetWidth;
  });
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let i = 1; i <= steps; i++) await page.mouse.move(x + (dx * zoom * i) / steps, y);
  if (!release) return { x, y, zoom };
  await page.mouse.up();
  await page.waitForTimeout(550);
}

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 520, height: 960 } });
  await page.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await page.evaluate(() => document.fonts.ready);
  await page.click('[data-action="edit-profile"]');
  await settle();
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await settle();
});

after(async () => {
  await browser?.close();
});

test('approved components and releases are unchanged (git)', () => {
  const changed = execFileSync('git', ['-C', repo, 'status', '--porcelain', '--', 'src/decorations', 'releases'], { encoding: 'utf8' });
  assert.equal(changed.trim(), '', 'src/decorations and releases must have no changes');
});

test('visible extents: each catalogue ink box holds every rendered pixel of all 180 frames and stays within the drawing', async () => {
  const measured = await page.evaluate(async () => {
    const out = [];
    for (const entry of window.prototype.decorations.filter((e) => e.kind === 'svg')) {
      const host = document.createElement('div');
      document.body.append(host);
      const d = entry.mount(host, entry.canvas);
      d.pause();
      const PAD = 64;
      const W = 512 + 2 * PAD;
      const c = document.createElement('canvas');
      c.width = c.height = W;
      const g = c.getContext('2d', { willReadFrequently: true });
      let px = [1e9, 1e9, -1e9, -1e9];
      let bb = [1e9, 1e9, -1e9, -1e9];
      for (let f = 0; f < 180; f++) {
        d.seek(f);
        const b = d.element.getBBox();
        bb = [Math.min(bb[0], b.x), Math.min(bb[1], b.y), Math.max(bb[2], b.x + b.width), Math.max(bb[3], b.y + b.height)];
        const svg = d.element.cloneNode(true);
        svg.setAttribute('viewBox', `${-PAD} ${-PAD} ${W} ${W}`);
        svg.setAttribute('width', W);
        svg.setAttribute('height', W);
        svg.removeAttribute('style');
        const img = new Image();
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
        await img.decode();
        g.clearRect(0, 0, W, W);
        g.drawImage(img, 0, 0);
        const a = g.getImageData(0, 0, W, W).data;
        for (let y = 0; y < W; y++)
          for (let x = 0; x < W; x++)
            if (a[(y * W + x) * 4 + 3] > 0)
              px = [Math.min(px[0], x - PAD), Math.min(px[1], y - PAD), Math.max(px[2], x + 1 - PAD), Math.max(px[3], y + 1 - PAD)];
      }
      d.destroy();
      host.remove();
      out.push({ id: entry.id, ink: entry.ink, px, bb });
    }
    return out;
  });
  for (const m of measured) {
    const [x0, y0, x1, y1] = m.ink;
    const info = `${m.id}: ink ${JSON.stringify(m.ink)}, pixels ${JSON.stringify(m.px)}, bbox ${JSON.stringify(m.bb.map((v) => +v.toFixed(2)))}`;
    assert.ok(x0 <= m.px[0] + 0.5 && y0 <= m.px[1] + 0.5 && x1 >= m.px[2] - 0.5 && y1 >= m.px[3] - 0.5, `holds every pixel — ${info}`);
    const outer = [Math.min(m.bb[0], m.px[0]), Math.min(m.bb[1], m.px[1]), Math.max(m.bb[2], m.px[2]), Math.max(m.bb[3], m.px[3])];
    assert.ok(x0 >= outer[0] - 1.01 && y0 >= outer[1] - 1.01 && x1 <= outer[2] + 1.01 && y1 <= outer[3] + 1.01, `within the drawing — ${info}`);
  }
  // Paper Plane Orbit: tight around the visible plane (its hidden views must not inflate the box).
  for (const id of ['paper-plane-orbit', 'christmas-lights', 'cat-ears']) {
    const m = measured.find((x) => x.id === id);
    const margin = id === 'cat-ears' ? 0 : 1;
    m.ink.forEach((v, i) => near(v, m.px[i] + (i < 2 ? -margin : margin), `${id} ink[${i}] (pixels)`, 0.01));
  }
});

test('Cat Ears: only v1.1.0 is in the prototype (no v1.0.0 code in the bundle), both motions run', async () => {
  const fs = await import('node:fs');
  const bundle = fs.readFileSync(join(root, 'dist/main.js'), 'utf8');
  const metas = bundle.match(/id:"cat-ears",name:"Cat Ears",version:"[0-9.]+"/g) ?? [];
  assert.deepEqual(metas, ['id:"cat-ears",name:"Cat Ears",version:"1.1.0"'], 'exactly one Cat Ears, version 1.1.0');
  assert.ok(bundle.includes('1.0.0 stays available in releases/cat-ears/1.0.0/'), 'the v1.1.0 build (its own status text) is the one bundled');
  // Both motions: the tips bend and the whole ears sway (the ear shape changes, not only its rotation).
  const frames = await page.evaluate(() => {
    const e = window.prototype.decorations.find((d) => d.id === 'cat-ears');
    const host = document.createElement('div');
    document.body.append(host);
    const d = e.mount(host, 512);
    d.pause();
    const shots = [0, 30, 60, 90, 120, 150].map((f) => {
      d.seek(f);
      return d.element.innerHTML;
    });
    d.destroy();
    host.remove();
    return shots;
  });
  assert.equal(new Set(frames).size, frames.length, 'every sampled frame differs');
});

test('catalogue: six equal positions in order None → Paper Plane Orbit → Cat Ears → Christmas Lights → Ghost Orbit → Halloween Pumpkin', async () => {
  const cat = await page.evaluate(() => window.prototype.decorations.map((e) => ({ id: e.id, kind: e.kind, version: e.version ?? null })));
  assert.deepEqual(cat.map((e) => e.id), ORDER);
  assert.deepEqual(cat.map((e) => e.kind), ['none', 'svg', 'svg', 'svg', 'svg', 'svg']);
  assert.deepEqual(cat.slice(1).map((e) => e.version), ['1.0.0', '1.1.0', '1.0.0', '1.0.0', '1.0.0'], 'Cat Ears is 1.1.0');
});

test('opens on None: plain avatar, Halloween Pumpkin on the left, Paper Plane Orbit on the right, both animating', async () => {
  const s = await state();
  assert.equal(s.worn, 'none');
  assert.deepEqual(triple(s), ['halloween-pumpkin', 'none', 'paper-plane-orbit']);
  assert.equal(await page.$$eval(`${C} .deco-holder[data-decoration="none"] svg *`, (n) => n.length), 0, 'no placeholder for None');
  assert.equal(byRole(s, 'worn').visible, false, 'None draws nothing on the avatar');
  assert.equal(s.liveCount, 2);
  assert.equal(s.placeCount, 3);
  const t = () => page.$eval(`${C} .deco-holder[data-role="right"] svg`, (n) => n.innerHTML);
  const a = await t();
  await page.waitForTimeout(250);
  assert.notEqual(a, await t(), 'side preview animates');
});

test('swipe left twice: Paper Plane Orbit left, Cat Ears on the avatar, Christmas Lights right', async () => {
  await drag(-110);
  await drag(-110);
  let s = await state();
  assert.deepEqual(triple(s), ['paper-plane-orbit', 'cat-ears', 'christmas-lights']);
  assert.equal(s.worn, 'cat-ears');
  // The following tests start from Halloween Pumpkin on the avatar.
  while ((await state()).worn !== 'halloween-pumpkin') await drag(-110);
  s = await state();
  assert.deepEqual(triple(s), ['ghost-orbit', 'halloween-pumpkin', 'none']);
  const photo = await rect(`${C} .avatar__photo`);
  const worn = byRole(s, 'worn');
  near(worn.size, (104 * 512) / 436, 'photo circle r 218 of 512 on the 104 pt photo', 0.05);
  near(centreOf(worn).x, photo.x + photo.width / 2, 'centre x', 0.05);
  near(centreOf(worn).y, photo.y + photo.height / 2, 'centre y', 0.05);
  const car = await rect(`${C} .deco-carousel`);
  for (const role of ['left', 'right']) {
    const ink = inkRect(byRole(s, role));
    near((ink.top + ink.bottom) / 2, car.y + car.height / 2, `${role} preview on the avatar line`, 0.3);
  }
  near((inkRect(byRole(s, 'right')).left + inkRect(byRole(s, 'right')).right) / 2, car.x + car.width / 2, 'right preview centred', 0.3);
});

test('full circles both ways: each step shows previous | selected | next, nothing piles up', async () => {
  for (const dir of [-1, 1]) {
    for (let i = 0; i < 9; i++) {
      await drag(110 * dir);
      const s = await state();
      const k = ORDER.indexOf(s.worn);
      const at = (d) => ORDER[(k + d + ORDER.length) % ORDER.length];
      assert.deepEqual(triple(s), [at(-1), at(0), at(1)], `dir ${dir} step ${i}`);
      assert.equal(s.position, Math.round(s.position), 'rests on a position');
      assert.equal(s.placeCount, 3, 'three places at rest');
      assert.equal(s.holders.length, 3, 'no leftover layers');
      assert.equal(s.liveCount, s.holders.filter((h) => h.kind === 'svg').length);
      assert.ok(s.holders.filter((h) => h.role === 'worn').length === 1, 'one decoration on the avatar');
    }
  }
  // back to image 4 for the next tests
  while ((await state()).worn !== 'halloween-pumpkin') await drag(-110);
});

/** Visible parts of different places never overlap (horizontal extents of the whole animation). */
function assertNoOverlap(s, label) {
  const vis = s.holders.filter((h) => h.visible);
  for (let i = 0; i < vis.length; i++)
    for (let j = i + 1; j < vis.length; j++) {
      const a = inkRect(vis[i]);
      const b = inkRect(vis[j]);
      assert.ok(a.right <= b.left + 0.5 || b.right <= a.left + 0.5, `${label}: ${vis[i].id}/${vis[i].role} overlaps ${vis[j].id}/${vis[j].role}`);
    }
}

test('mid-swipe: everything follows the finger continuously, no jumps, no overlaps (all pairs, both ways)', async () => {
  for (const dir of [-1, -1, -1, -1, 1, 1, 1, 1]) {
    const { x, y, zoom } = await drag(6 * dir, { release: false, steps: 1 });
    let last = null;
    for (let i = 1; i <= 36; i++) {
      await page.mouse.move(x + dir * 3.2 * i * zoom, y);
      const s = await state();
      assertNoOverlap(s, `dir ${dir} step ${i}`);
      assert.ok(s.placeCount <= 4, 'at most four places while moving');
      assert.equal(s.holders.filter((h) => h.role === 'worn' && h.visible).length <= 1, true);
      if (last)
        for (const h of s.holders) {
          const prev = last.find((p) => p.id === h.id && Math.abs(p.c - centreOf(h).x) < 40);
          if (prev) {
            const step = centreOf(h).x - prev.c;
            assert.ok(step * dir >= -0.01, `${h.id} moves with the finger`);
            assert.ok(Math.abs(step) < 8, `${h.id} no jump (${step})`);
          }
        }
      last = s.holders.map((h) => ({ id: h.id, c: centreOf(h).x }));
    }
    await page.mouse.up();
    await page.waitForTimeout(550);
    assertNoOverlap(await state(), 'after');
  }
  assert.equal((await state()).worn, 'halloween-pumpkin');
});

test('Cat Ears: on the avatar both ears symmetric above the photo, inside the card; side preview shows both', async () => {
  while ((await state()).worn !== at('cat-ears', -1)) await drag(-110);
  let s = await state();
  assert.equal(byRole(s, 'right').id, 'cat-ears', 'Cat Ears is the next one');
  const car = await rect(`${C} .deco-carousel`);
  const card = await rect(`${C} .color-preview`);
  let ears = inkRect(byRole(s, 'right'));
  const slot = await page.evaluate(() => window.prototype.yourColor().decorations.slotSize);
  near(ears.right - ears.left, slot, 'both ears fill the side slot width', 0.3);
  near((ears.left + ears.right) / 2, car.x + car.width / 2, 'centred', 0.3);
  assert.ok(ears.right <= card.x + card.width - 5.5);
  await drag(-110);
  s = await state();
  assert.deepEqual(triple(s), [at('cat-ears', -1), 'cat-ears', at('cat-ears', 1)]);
  const photo = await rect(`${C} .avatar__photo`);
  ears = inkRect(byRole(s, 'worn'));
  const cx = photo.x + photo.width / 2;
  // v1.1.0 sways: the 180-frame extent is −7 … 514, 1.2 pt off-centre; the ears themselves are mirrored.
  near(cx - ears.left, ears.right - cx, 'ears around the photo centre (whole sway)', 1.3);
  assert.ok(ears.top >= card.y + 1 && ears.top < photo.y && ears.bottom < photo.y + photo.height / 2, 'on top of the photo, inside the card');
  assert.ok(byRole(s, 'right').visible, 'next one shown on the right');
  while ((await state()).worn !== 'halloween-pumpkin') await drag(110);
});

test('Paper Plane Orbit: on the avatar at full size, never clipped, animating; removed once out of view', async () => {
  while ((await state()).worn !== at('paper-plane-orbit', -1)) await drag(-110);
  let s = await state();
  assert.equal(byRole(s, 'right').id, 'paper-plane-orbit', 'Paper Plane Orbit is the next one');
  await drag(-110);
  s = await state();
  assert.deepEqual(triple(s), [at('paper-plane-orbit', -1), 'paper-plane-orbit', at('paper-plane-orbit', 1)]);
  const worn = byRole(s, 'worn');
  const photo = await rect(`${C} .avatar__photo`);
  near(worn.size, (104 * 512) / 436, 'photo circle r 218 of 512 on the photo', 0.05);
  near(centreOf(worn).x, photo.x + photo.width / 2, 'centre x', 0.05);
  near(centreOf(worn).y, photo.y + photo.height / 2, 'centre y', 0.05);
  const card = await rect(`${C} .color-preview`);
  const ink = inkRect(worn);
  assert.ok(ink.left >= card.x && ink.right <= card.x + card.width && ink.top >= card.y, 'whole flight inside the card');
  const clip = await page.evaluate(() => {
    let n = document.querySelector('.screen--your-color .deco-holder[data-role="worn"]');
    const out = [];
    for (; n && !n.classList.contains('color-preview'); n = n.parentElement) out.push(getComputedStyle(n).overflow);
    return out;
  });
  assert.ok(clip.every((o) => o === 'visible'), `no container clips the plane (${clip})`);
  const t = () => page.$eval(`${C} .deco-holder[data-role="worn"] svg`, (n) => n.innerHTML);
  const a = await t();
  await page.waitForTimeout(200);
  assert.notEqual(a, await t(), 'plane is flying');
  // Two more steps: the plane goes to the left, then out of view → no instance left.
  await drag(-110);
  assert.equal(byRole(await state(), 'left').id, 'paper-plane-orbit');
  await drag(-110);
  s = await state();
  assert.equal(s.holders.filter((h) => h.id === 'paper-plane-orbit').length, 0, 'plane instance removed');
  assert.equal(await page.evaluate(() => document.querySelectorAll('[data-decoration="paper-plane-orbit"] svg').length), 0);
  assert.equal(s.placeCount, 3);
  while ((await state()).worn !== 'halloween-pumpkin') await drag(-110);
});

test('Christmas Lights: hangs over the top of the photo as designed, glow fully inside the card, never clipped', async () => {
  while ((await state()).worn !== at('christmas-lights', -1)) await drag(-110);
  let s = await state();
  assert.equal(byRole(s, 'right').id, 'christmas-lights', 'Christmas Lights is the next one');
  const card = await rect(`${C} .color-preview`);
  const side = inkRect(byRole(s, 'right'));
  assert.ok(side.left >= card.x + 5.5 && side.right <= card.x + card.width - 5.5 && side.top >= card.y, 'side preview with its glow inside the card');
  await drag(-110);
  s = await state();
  assert.deepEqual(triple(s), [at('christmas-lights', -1), 'christmas-lights', at('christmas-lights', 1)]);
  const worn = byRole(s, 'worn');
  const photo = await rect(`${C} .avatar__photo`);
  near(worn.size, (104 * 512) / 436, 'original placement: photo circle r 218 of 512 on the photo', 0.05);
  near(centreOf(worn).x, photo.x + photo.width / 2, 'canvas centred on the photo x', 0.05);
  near(centreOf(worn).y, photo.y + photo.height / 2, 'canvas centred on the photo y', 0.05);
  const ink = inkRect(worn);
  assert.ok(ink.top < photo.y, 'hangs over the top of the photo');
  assert.ok(ink.left >= card.x && ink.right <= card.x + card.width && ink.top >= card.y, 'glow and sparkles inside the card');
  const clip = await page.evaluate(() => {
    let n = document.querySelector('.screen--your-color .deco-holder[data-role="worn"]');
    const out = [getComputedStyle(n.querySelector('svg')).overflow];
    for (; n && !n.classList.contains('color-preview'); n = n.parentElement) out.push(getComputedStyle(n).overflow);
    return out;
  });
  assert.ok(clip.every((o) => o === 'visible'), `nothing clips the garland (${clip})`);
  const t = () => page.$eval(`${C} .deco-holder[data-role="worn"] svg`, (n) => n.innerHTML);
  const a = await t();
  await page.waitForTimeout(200);
  assert.notEqual(a, await t(), 'garland animates');
  assert.equal(s.holders.filter((h) => h.id === 'christmas-lights').length, 1, 'one garland');
  while ((await state()).worn !== 'halloween-pumpkin') await drag(-110);
});

test('side slot: one shared size (78 pt) for every decoration, active size unchanged', async () => {
  const slot = await page.evaluate(() => window.prototype.yourColor().decorations.slotSize);
  assert.equal(slot, 78, 'side slot 78 pt (was 100)');
  const seen = new Map();
  for (let i = 0; i < ORDER.length; i++) {
    const s = await state();
    for (const h of s.holders.filter((x) => x.role === 'left' || x.role === 'right')) {
      const r = inkRect(h);
      seen.set(h.id, Math.max(r.right - r.left, r.bottom - r.top));
    }
    const w = byRole(s, 'worn');
    if (w.kind === 'svg') near(w.size, (104 * 512) / 436, `${w.id} on the avatar keeps its size`, 0.05);
    await drag(-110);
  }
  for (const id of ['ghost-orbit', 'halloween-pumpkin', 'cat-ears', 'paper-plane-orbit', 'christmas-lights']) near(seen.get(id), 78, `${id}: whole animation fits the side slot`, 0.3);
  // None keeps its place but draws nothing (no ring, no placeholder).
  const noneDrawn = await page.evaluate(() =>
    [...document.querySelectorAll('.screen--your-color .deco-holder[data-decoration="none"] svg')].map((n) => n.childElementCount),
  );
  assert.ok(noneDrawn.every((c) => c === 0), `None draws nothing (${noneDrawn})`);
});

test('a new catalogue entry gets the same side slot automatically, and scales smoothly to the avatar', async () => {
  const r = await page.evaluate(async () => {
    const stub = {
      id: 'test-stub',
      name: 'Test stub',
      kind: 'svg',
      canvas: 512,
      avatarArea: { cx: 256, cy: 256, r: 218 },
      ink: [40, 180, 470, 330], // wide and flat, unlike the others
      mount(container) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 512 512');
        svg.innerHTML = '<rect x="40" y="180" width="430" height="150" fill="tomato"/>';
        svg.style.width = svg.style.height = '512px';
        container.append(svg);
        return { element: svg, setSize() {}, seek() {}, frame: 0, play() {}, pause() {}, destroy() { svg.remove(); } };
      },
    };
    const items = [...window.prototype.decorations, stub];
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:0;top:0;width:370px;height:253px;overflow:hidden';
    const avatar = document.createElement('div');
    avatar.style.cssText = 'position:absolute;left:133px;top:52px;width:104px;height:104px';
    const layer = document.createElement('div');
    avatar.append(layer);
    host.append(avatar);
    document.body.append(host);
    const c = window.prototype.DecorationCarousel({ items, host, avatarElement: avatar, avatarLayer: layer, photoDiameter: 104, previewSlotSize: 78, gutter: 8, initial: items.length - 2 });
    host.append(c.element);
    await new Promise((res) => setTimeout(res, 60));
    const size = () => host.querySelector('.deco-holder[data-decoration="test-stub"]').getBoundingClientRect().width;
    const sideCanvas = size();
    const sizes = [];
    c.next();
    for (let t = 0; t < 12; t++) {
      await new Promise((res) => requestAnimationFrame(res));
      sizes.push(size());
    }
    await new Promise((res) => setTimeout(res, 450));
    const activeCanvas = size();
    c.destroy();
    host.remove();
    return { sideCanvas, sizes, activeCanvas };
  });
  // Widest side of its visible extent (430 canvas units) = the slot.
  near((r.sideCanvas * 430) / 512, 78, 'stub fills the side slot', 0.05);
  near(r.activeCanvas, (104 * 512) / 436, 'stub on the avatar: photo-fitted size', 0.05);
  for (let i = 1; i < r.sizes.length; i++) assert.ok(r.sizes[i] >= r.sizes[i - 1] - 0.01, 'grows smoothly, never shrinks back');
  assert.ok(r.sizes.some((v) => v > r.sideCanvas + 1 && v < r.activeCanvas - 1), 'in-between sizes while moving');
});

test('an unfinished swipe glides back to exactly the same places', async () => {
  const before = (await state()).holders.map((h) => [h.id, h.role, Math.round(h.x * 10)]);
  await drag(-35);
  let s = await state();
  assert.deepEqual(s.holders.map((h) => [h.id, h.role, Math.round(h.x * 10)]), before);
  await drag(30);
  s = await state();
  assert.deepEqual(s.holders.map((h) => [h.id, h.role, Math.round(h.x * 10)]), before);
});

test('fast repeated swipes: no skipped or doubled steps, lands exactly', async () => {
  const start = ORDER.indexOf((await state()).worn);
  const flick = async (dx) => {
    const box = await page.locator(`${C} .deco-carousel`).boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    for (let i = 1; i <= 4; i++) await page.mouse.move(x + (dx * i) / 4, y);
    await page.mouse.up();
    await page.waitForTimeout(90); // next flick while the track is still gliding
  };
  for (let i = 0; i < 3; i++) await flick(-60);
  await page.waitForTimeout(700);
  let s = await state();
  assert.equal(s.worn, ORDER[(start + 3) % ORDER.length], 'three flicks = three steps');
  assert.deepEqual([s.placeCount, s.holders.length], [3, 3]);
  for (let i = 0; i < 3; i++) await flick(60);
  await page.waitForTimeout(700);
  s = await state();
  assert.equal(s.worn, ORDER[start]);
  assert.equal(s.position, Math.round(s.position));
});

test('keyboard and a tap on a side preview also switch', async () => {
  await page.focus(`${C} .deco-carousel`);
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(550);
  assert.equal((await state()).worn, at('halloween-pumpkin', 1));
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(550);
  assert.equal((await state()).worn, 'halloween-pumpkin');
  const left = await page.evaluate(() => {
    const h = document.querySelector('.screen--your-color .color-preview').getBoundingClientRect();
    const a = document.querySelector('.screen--your-color .avatar__photo').getBoundingClientRect();
    const c = document.querySelector('.screen--your-color .deco-carousel').getBoundingClientRect();
    return { x: 2 * (a.left + a.width / 2) - (c.left + c.width / 2), y: c.top + c.height / 2, h };
  });
  await page.mouse.click(left.x, left.y);
  await page.waitForTimeout(550);
  assert.equal((await state()).worn, at('halloween-pumpkin', -1), 'tap on the left preview selects it');
  await page.click(`${C} .deco-carousel`);
  await page.waitForTimeout(550);
  assert.equal((await state()).worn, 'halloween-pumpkin', 'tap on the right preview selects it');
});

test('palette and Reset keep working with a decoration on', async () => {
  await page.click(`${C} [data-swatch="4"]`);
  assert.equal(await page.$eval(`${C} .color-preview`, (n) => n.style.background), 'rgb(142, 108, 194)');
  await page.click(`${C} [data-action="reset-color"]`);
  assert.equal(await page.$eval(`${C} .color-preview`, (n) => n.style.background), 'rgb(91, 142, 187)');
  assert.equal((await state()).worn, 'halloween-pumpkin');
});

test('side previews stay clear of the name, status and palette', async () => {
  const s = await state();
  const name = await rect(`${C} .color-preview__name-row`);
  const card = await rect(`${C} .color-preview`);
  for (const h of s.holders.filter((x) => x.visible && x.role !== 'worn')) {
    const r = inkRect(h);
    assert.ok(r.bottom <= name.y, `${h.id} above the name`);
    assert.ok(r.left >= card.x + 5.5 && r.right <= card.x + card.width - 5.5, `${h.id} inside the card`);
  }
});

test('back closes the screen and frees every animation; reopening starts on None', async () => {
  await page.click(`${C} .your-color__back`);
  await settle();
  assert.equal(await page.$(C), null);
  assert.equal(await page.evaluate(() => document.querySelectorAll('.deco-holder').length), 0, 'all removed');
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await settle();
  const s = await state();
  assert.deepEqual([s.worn, ...triple(s), s.placeCount], ['none', 'halloween-pumpkin', 'none', 'paper-plane-orbit', 3]);
});

test('works with any catalogue size: 6 stub decorations, both ways, several circles', async () => {
  const log = await page.evaluate(async () => {
    const alive = new Set();
    let created = 0;
    const stub = (i) => ({
      id: `stub-${i}`,
      name: `Stub ${i}`,
      kind: 'svg',
      canvas: 512,
      avatarArea: { cx: 256, cy: 256, r: 218 },
      ink: [100 + i, 100, 412 - i, 412],
      mount(container) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 512 512');
        svg.style.width = svg.style.height = '512px';
        container.append(svg);
        const id = ++created;
        alive.add(id);
        return { element: svg, setSize() {}, seek() {}, frame: 0, play() {}, pause() {}, destroy() { alive.delete(id); svg.remove(); } };
      },
    });
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:0;top:0;width:370px;height:253px;overflow:hidden';
    const avatar = document.createElement('div');
    avatar.style.cssText = 'position:absolute;left:133px;top:52px;width:104px;height:104px';
    const layer = document.createElement('div');
    avatar.append(layer);
    host.append(avatar);
    document.body.append(host);
    const items = Array.from({ length: 6 }, (_, i) => stub(i));
    const c = window.prototype.DecorationCarousel({ items, host, avatarElement: avatar, avatarLayer: layer, photoDiameter: 104, previewSlotSize: 78, gutter: 8 });
    host.append(c.element);
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    await wait(50);
    const seen = [];
    let maxAlive = 0;
    for (const dir of [1, -1]) {
      for (let i = 0; i < 14; i++) {
        dir > 0 ? c.next() : c.prev();
        for (let t = 0; t < 5; t++) {
          await wait(90);
          maxAlive = Math.max(maxAlive, alive.size);
        }
        seen.push(layer.dataset.decoration);
      }
    }
    const atRest = { alive: alive.size, places: c.placeCount(), dom: host.querySelectorAll('.deco-holder').length };
    c.destroy();
    host.remove();
    return { seen, maxAlive, atRest, afterDestroy: alive.size };
  });
  const fwd = Array.from({ length: 14 }, (_, i) => `stub-${(i + 1) % 6}`);
  const back = Array.from({ length: 14 }, (_, i) => `stub-${(((14 - i - 1) % 6) + 6) % 6}`);
  assert.deepEqual(log.seen, [...fwd, ...back]);
  assert.ok(log.maxAlive <= 4, `never more than four instances (${log.maxAlive})`);
  assert.deepEqual(log.atRest, { alive: 3, places: 3, dom: 3 });
  assert.equal(log.afterDestroy, 0);
});

for (const width of [320, 375, 390]) {
  test(`narrow iPhone ${width} pt: every position fits the card, previews clear of the worn decoration`, async () => {
    const p = await browser.newPage({ viewport: { width, height: 760 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    await p.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=device`);
    await p.click('[data-action="edit-profile"]');
    await p.waitForTimeout(450);
    await p.click('.screen--edit-profile [data-row="your-color"]');
    await p.waitForTimeout(450);
    const geo = () =>
      p.evaluate((INK) => {
        const card = document.querySelector('.screen--your-color .color-preview').getBoundingClientRect();
        const name = document.querySelector('.screen--your-color .color-preview__name-row').getBoundingClientRect();
        const ink = (role) => {
          const h = document.querySelector(`.screen--your-color .deco-holder[data-role="${role}"]`);
          const r = h.getBoundingClientRect();
          const [x0, y0, x1, y1] = INK[h.dataset.decoration];
          const k = r.width / 512;
          return { id: h.dataset.decoration, left: r.left + x0 * k, right: r.left + x1 * k, top: r.top + y0 * k, bottom: r.top + y1 * k };
        };
        return { card: { left: card.left, right: card.right, top: card.top }, nameTop: name.top, left: ink('left'), worn: ink('worn'), right: ink('right') };
      }, INK);
    for (let i = 0; i < ORDER.length; i++) {
      const g = await geo();
      const label = `${width}: ${g.worn.id}`;
      assert.ok(g.left.left >= g.card.left + 5.5 && g.right.right <= g.card.right - 5.5, `${label} sides inside the card`);
      if (g.worn.id !== 'none') {
        assert.ok(g.right.left >= g.worn.right + 2 && g.left.right <= g.worn.left - 2, `${label} clear of the worn one`);
        assert.ok(g.worn.top >= g.card.top, `${label} worn inside the card`);
      }
      assert.ok(g.left.bottom <= g.nameTop && g.right.bottom <= g.nameTop, `${label} above the name`);
      await p.evaluate(() => window.prototype.yourColor().decorations.next());
      await p.waitForTimeout(550);
    }
    await p.close();
  });
}
