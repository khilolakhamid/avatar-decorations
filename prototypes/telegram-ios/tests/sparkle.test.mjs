// Sparkle burst on Your Color: once per finished switch to a real decoration,
// never for None, replaced (not piled up) on fast switching.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const URL_ = `${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`;
let browser;
let page;
const wait = (ms) => page.waitForTimeout(ms);
const C = '.screen--your-color';

const look = () =>
  page.evaluate(() => {
    const yc = window.prototype.yourColor();
    const stars = [...document.querySelectorAll('.screen--your-color .sparkle')];
    return { bursts: yc.sparkles.bursts, stars: stars.length, worn: yc.decorations.previewId(), visible: stars.filter((s) => +getComputedStyle(s).opacity > 0.01).length };
  });
const step = async (dir) => {
  await page.evaluate((d) => window.prototype.yourColor().decorations[d](), dir > 0 ? 'next' : 'prev');
};
/** Max number of stars seen while watching for `ms`. */
async function watch(ms) {
  let max = 0;
  let maxVisible = 0;
  for (let t = 0; t < ms; t += 60) {
    const l = await look();
    max = Math.max(max, l.stars);
    maxVisible = Math.max(maxVisible, l.visible);
    await wait(60);
  }
  return { max, maxVisible };
}
async function goTo(id) {
  for (let i = 0; i < 8 && (await look()).worn !== id; i++) {
    await step(1);
    await wait(500);
  }
  await wait(2300); // let any burst finish
}

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 520, height: 960 } });
  await page.goto(URL_);
  await page.click('[data-action="edit-profile"]');
  await wait(450);
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await wait(500);
});

after(async () => {
  await browser?.close();
});

test('opening on None: no sparkles', async () => {
  const l = await look();
  assert.equal(l.worn, 'none');
  const w = await watch(600);
  assert.deepEqual([l.bursts, w.max], [0, 0]);
});

test('switch to a decoration: one burst of 4–6 of the user’s stars, one after another, gone after ~2 s', async () => {
  const before_ = (await look()).bursts;
  await step(1); // None → Paper Plane Orbit
  await page.waitForSelector('.screen--your-color .sparkle', { state: 'attached' });
  const t0 = Date.now();
  // Stars start one after another, never all together.
  const delays = await page.$$eval('.screen--your-color .sparkle', (n) => n.map((s) => parseFloat(s.style.getPropertyValue('--d'))).sort((a, b) => a - b));
  for (let i = 1; i < delays.length; i++) assert.ok(delays[i] - delays[i - 1] >= 120, `staggered starts ${delays}`);
  assert.ok(delays.at(-1) >= 800 && delays.at(-1) <= 1120, 'the last one starts about 1 s later');
  // Overlapping, but never all together: at most half of them near full brightness at once.
  let maxBright = 0;
  let w = { max: 0, maxVisible: 0 };
  while (Date.now() - t0 < 1600) {
    const r = await page.$$eval('.screen--your-color .sparkle', (n) =>
      n.map((s) => +getComputedStyle(s).opacity / parseFloat(s.style.getPropertyValue('--o') || '1')),
    );
    maxBright = Math.max(maxBright, r.filter((o) => o > 0.9).length);
    w = { max: Math.max(w.max, r.length), maxVisible: Math.max(w.maxVisible, r.filter((o) => o > 0.01).length) };
    await wait(40);
  }
  assert.ok(maxBright <= 3, `no moment when they all flash together (${maxBright} near full)`);
  assert.ok((await look()).stars > 0, 'still sparkling 1.6 s in');
  const rest = await watch(1000);
  w.max = Math.max(w.max, rest.max);
  const l = await look();
  assert.equal(l.bursts, before_ + 1, 'exactly one burst for one switch');
  assert.ok(w.max >= 4 && w.max <= 6, `4–6 stars (${w.max})`);
  assert.ok(w.maxVisible >= 3, 'several stars visible at once (staggered, not all together)');
  assert.equal(l.stars, 0, 'elements removed after the burst');
});

test('stars: the user’s star.svg, white, small, over the decoration, clear of the name; never catch input', async () => {
  await step(1); // → Cat Ears
  await wait(560);
  const g = await page.evaluate(() => {
    const scr = document.querySelector('.screen--your-color');
    const photo = scr.querySelector('.avatar__photo').getBoundingClientRect();
    const name = scr.querySelector('.color-preview__name-row').getBoundingClientRect();
    const layer = scr.querySelector('.sparkle-layer');
    const stars = [...layer.querySelectorAll('.sparkle')].map((s) => {
      const r = s.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, size: parseFloat(s.style.getPropertyValue('--s')), d: s.querySelector('path').getAttribute('d'), fill: s.querySelector('path').getAttribute('fill') };
    });
    const ordered = [...scr.querySelector('.color-preview').children].map((n) => n.className.split(' ')[0]);
    return {
      stars,
      photo: { cx: photo.left + photo.width / 2, cy: photo.top + photo.height / 2, r: photo.width / 2 },
      nameTop: name.top,
      pe: getComputedStyle(layer).pointerEvents,
      overDecorations: ordered.indexOf('sparkle-layer') > ordered.indexOf('deco-stage'),
      z: getComputedStyle(layer).zIndex,
      clip: getComputedStyle(layer).overflow,
    };
  });
  const svg = readFileSync(join(root, 'src/assets/your-color/star.svg'), 'utf8');
  const d = svg.match(/ d="([^"]+)"/)[1];
  for (const s of g.stars) {
    assert.equal(s.d, d, 'the user star, unchanged');
    assert.equal(s.fill, 'white');
    assert.ok(s.size >= 5 && s.size <= 9, `small (${s.size})`);
    const dist = Math.hypot(s.cx - g.photo.cx, s.cy - g.photo.cy) / g.photo.r;
    assert.ok(dist >= 0.5 && dist <= 1.25, `on the avatar / decoration (${dist.toFixed(2)} R)`);
    assert.ok(s.cy < g.nameTop - 4, 'above the name');
  }
  assert.equal(g.pe, 'none', 'taps and swipes pass through');
  assert.ok(g.overDecorations && g.z === '3', 'drawn over the decoration');
  assert.equal(g.clip, 'visible', 'not cut by the round photo');
  await wait(1800);
});

test('switch to None: no sparkles, and a running burst disappears', async () => {
  await goTo('paper-plane-orbit');
  // A burst running on Paper Plane Orbit … then swipe back to None mid-burst.
  await step(1); // → Cat Ears (burst starts at the end of the glide)
  await wait(520);
  assert.ok((await look()).stars > 0, 'burst running');
  await step(-1); // back to Paper Plane Orbit
  await wait(520);
  await step(-1); // → None
  await wait(450);
  const l = await look();
  assert.equal(l.worn, 'none');
  assert.equal(l.stars, 0, 'cleared on None');
  const b = l.bursts;
  const w = await watch(900);
  assert.equal(w.max, 0);
  assert.equal((await look()).bursts, b, 'no burst for None');
});

test('fast switching: one burst at the end, no piling up', async () => {
  const before_ = (await look()).bursts;
  for (let i = 0; i < 3; i++) {
    await step(1);
    await wait(90);
  }
  const w = await watch(2700);
  const l = await look();
  assert.equal(l.bursts, before_ + 1, 'intermediate items get no burst');
  assert.ok(w.max <= 6, `never more than one burst on screen (${w.max})`);
  assert.equal(l.stars, 0);
  // Switch again while a burst runs: the new one replaces it.
  await step(1);
  await wait(500);
  await step(1);
  const w2 = await watch(2600);
  assert.ok(w2.max <= 6, `replaced, not added (${w2.max})`);
});

test('an unfinished swipe and Apply Style do not trigger a burst', async () => {
  await wait(2300);
  const b0 = (await look()).bursts;
  const box = await page.locator(`${C} .deco-carousel`).boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 6; i++) await page.mouse.move(box.x + box.width / 2 - 4 * i, box.y + box.height / 2);
  await page.mouse.up();
  await wait(700);
  assert.equal((await look()).bursts, b0, 'glided back: same decoration, no burst');
  await page.click(`${C} .apply-style`); // saves and returns to Settings
  await wait(450);
  assert.equal((await look()).bursts, b0, 'Apply Style does not replay it');
  assert.equal(await page.$$eval('.sparkle', (n) => n.length), 0);
});

test('Settings never shows sparkles', async () => {
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'settings');
  assert.equal(await page.$$eval('[data-screen="settings"] .sparkle, [data-screen="settings"] .sparkle-layer', (n) => n.length), 0);
});

test('prefers-reduced-motion: no flashes', async () => {
  const p2 = await browser.newPage({ viewport: { width: 520, height: 960 }, reducedMotion: 'reduce' });
  await p2.goto(URL_);
  await p2.click('[data-action="edit-profile"]');
  await p2.waitForTimeout(450);
  await p2.click('.screen--edit-profile [data-row="your-color"]');
  await p2.waitForTimeout(450);
  await p2.evaluate(() => window.prototype.yourColor().decorations.next());
  let max = 0;
  for (let t = 0; t < 1600; t += 80) {
    max = Math.max(max, await p2.$$eval('.screen--your-color .sparkle', (n) => n.length));
    await p2.waitForTimeout(80);
  }
  assert.equal(max, 0);
  await p2.close();
});
