// Your Color screen and Settings → Edit → Your Color → Edit → Settings.
// Geometry: reference screenshot (393 × 852) mapped to the 402 × 874 frame (y − 2).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
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

function assertRect(r, [x, y, width, height], label) {
  assert.ok(r, `${label}: element not found`);
  near(r.x, x, `${label} x`);
  near(r.y, y, `${label} y`);
  near(r.width, width, `${label} width`);
  near(r.height, height, `${label} height`);
}

const selected = () => page.$$eval(`${C} .color-swatch[aria-checked="true"]`, (n) => n.map((x) => Number(x.dataset.swatch)));
const previewBg = () => page.$eval(`${C} .color-preview`, (n) => n.style.background);

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 520, height: 960 } });
  await page.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await page.evaluate(() => document.fonts.ready);
});

after(async () => {
  await browser?.close();
});

test('Settings → Edit → Your Color opens the screen', async () => {
  await page.click('[data-action="edit-profile"]');
  await settle();
  // Scroll Edit Profile a bit first: the position must survive the round trip.
  await page.evaluate(() => (document.querySelector('.screen--edit-profile .screen__scroll').scrollTop = 120));
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await settle();
  assert.ok(await page.$(C));
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'your-color');
  assert.equal(await page.$eval('.status-bar', (n) => getComputedStyle(n).color), 'rgb(0, 0, 0)');
});

test('layout follows the reference', async () => {
  assertRect(await rect(`${C} .your-color__back`), [16, 62, 44, 44], 'back');
  assertRect(await rect(`${C} .segmented`), [122.5, 62, 157, 44], 'segmented control');
  assertRect(await rect(`${C} .color-card`), [16, 124, 370, 407.33], 'card');
  assertRect(await rect(`${C} .color-preview`), [16, 124, 370, 253.33], 'preview');
  assertRect(await rect(`${C} .color-preview .avatar__photo`), [149, 176, 104, 104], 'avatar');
  assertRect(await rect(`${C} .color-palette`), [34, 391.33, 334, 74], 'palette (SVG 1:1)');
  assertRect(await rect(`${C} [data-row="add-icons-to-profile"]`), [16, 479.33, 370, 52], 'Add Icons To Profile');
  assertRect(await rect(`${C} [data-group="reset-color"]`), [16, 601, 370, 52], 'Reset Profile Color');
  const status = await page.$eval(`${C} .color-preview__status`, (n) => n.textContent);
  assert.equal(status, 'online');
  const name = await page.$eval(`${C} .color-preview__name`, (n) => n.textContent);
  assert.equal(name, 'Capybara');
  assert.ok(await page.$(`${C} .color-preview__star svg`), 'star after the name');
  const text = await page.$eval(`${C} .your-color__content`, (n) => n.textContent);
  for (const gone of ['USE A GIFT', 'My Gifts', 'Chill Flame', 'Vice Cream', 'Apply Style']) {
    assert.ok(!text.toUpperCase().includes(gone.toUpperCase()), `no "${gone}"`);
  }
});

test('palette: the user SVG unchanged, 16 swatches, blue (1st, first row) selected by default', async () => {
  const markup = await page.$eval(`${C} .color-palette__art`, (n) => n.innerHTML.trim());
  const file = readFileSync(join(root, 'src/assets/your-color/Icons_Container.svg'), 'utf8').trim();
  // Same markup; the browser only writes empty elements as <x></x> instead of <x/>.
  const norm = (t) => t.replace(/><\/(circle|path)>/g, '/>').replace(/\s+/g, ' ');
  assert.equal(norm(markup), norm(file), 'SVG shown as provided');
  assert.equal(await page.$$eval(`${C} .color-swatch`, (n) => n.length), 16);
  assert.deepEqual(await selected(), [0], 'only the blue swatch is selected');
  assertRect(await rect(`${C} [data-swatch="4"]`), [34 + 172, 391.33, 33, 33], '5th swatch');
  assertRect(await rect(`${C} [data-swatch="0"]`), [34, 391.33, 33, 33], '1st swatch');
  assert.equal(await previewBg(), 'rgb(91, 142, 187)', 'preview blue #5B8EBB as on the blue reference');
});

test('tapping a colour moves the selection and recolours the preview; Reset restores blue', async () => {
  await page.click(`${C} [data-swatch="4"]`);
  assert.deepEqual(await selected(), [4]);
  assert.equal(await previewBg(), 'rgb(142, 108, 194)', 'purple still gives #8E6CC2');
  await page.click(`${C} [data-swatch="12"]`);
  assert.deepEqual(await selected(), [12], 'only one swatch selected');
  assert.match(await previewBg(), /linear-gradient/, 'two-colour swatch → two-colour preview');
  await page.click(`${C} [data-action="reset-color"]`);
  assert.deepEqual(await selected(), [0]);
  assert.equal(await previewBg(), 'rgb(91, 142, 187)');
});

test('back returns to Edit Profile at the same scroll position; × then returns to Settings', async () => {
  await page.click(`${C} .your-color__back`);
  await settle();
  assert.equal(await page.$(C), null);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'edit-profile');
  near(await page.evaluate(() => document.querySelector('.screen--edit-profile .screen__scroll').scrollTop), 120, 'Edit scroll kept', 1);
  await page.click('.screen--edit-profile .edit-profile__close');
  await settle();
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'settings');
});

test('the whole path works repeatedly; the screen opens with the colour chosen last', async () => {
  for (let i = 0; i < 3; i++) {
    await page.click('[data-action="edit-profile"]');
    await settle();
    await page.click('.screen--edit-profile [data-row="your-color"]');
    await settle();
    assert.deepEqual(await selected(), [i === 0 ? 0 : i - 1], 'kept from the previous visit');
    await page.click(`${C} [data-swatch="${i}"]`);
    await page.click(`${C} .your-color__back`);
    await settle();
    await page.click('.screen--edit-profile .edit-profile__close');
    await settle();
    assert.equal(await page.$$eval('[data-screen]', (n) => n.length), 1, 'only Settings mounted');
  }
});

test('Add Icons To Profile: maple leaf (user file, unchanged) before the chevron, blue #008BFF, centred', async () => {
  const fs = await import('node:fs');
  const file = fs.readFileSync(new URL('../src/assets/your-color/Maple.svg', import.meta.url), 'utf8');
  assert.match(file, /fill="#008BFF"/, 'source file untouched');
  await page.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await page.click('[data-action="edit-profile"]');
  await settle();
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await settle();
  const info = await page.evaluate(() => {
    const row = document.querySelector('.screen--your-color [data-row="add-icons-to-profile"]');
    const leaf = row.querySelector('.color-row__icon');
    const chev = row.querySelector('.settings-row__chevron svg').getBoundingClientRect();
    const r = row.getBoundingClientRect();
    const l = leaf.getBoundingClientRect();
    return {
      title: row.querySelector('.settings-row__title').textContent,
      isOwnElement: leaf.parentElement === row && !row.querySelector('.settings-row__title').contains(leaf),
      fill: getComputedStyle(leaf.querySelector('path')).fill,
      leaf: { left: l.left - r.left, width: l.width, cy: l.top + l.height / 2 - r.top },
      chevLeft: chev.left - r.left,
      chevCy: chev.top + chev.height / 2 - r.top,
      rowH: r.height,
    };
  });
  assert.equal(info.title, 'Add Icons To Profile');
  assert.ok(info.isOwnElement, 'separate element, not part of the text');
  assert.equal(info.fill, 'rgb(0, 139, 255)', '#008BFF');
  assert.equal(info.rowH, 52, 'row height unchanged');
  assert.ok(Math.abs(info.leaf.cy - info.chevCy) < 0.6, 'centred with the chevron');
  const gap = info.chevLeft - (info.leaf.left + info.leaf.width);
  assert.ok(gap > 4 && gap < 10, `gap to the chevron ${gap}`);
});

test('background leaves: same pattern as Settings, same places around the avatar, behind everything', async () => {
  const leavesAround = (screen) =>
    page.evaluate((sel) => {
      const root = document.querySelector(sel);
      const a = root.querySelector('.avatar__photo').getBoundingClientRect();
      const ax = a.left + a.width / 2;
      const ay = a.top + a.height / 2;
      return [...root.querySelectorAll('.pattern-leaf')].map((l) => {
        const r = l.getBoundingClientRect();
        return {
          dx: +(r.left + r.width / 2 - ax).toFixed(1),
          dy: +(r.top + r.height / 2 - ay).toFixed(1),
          w: +r.width.toFixed(1),
          o: getComputedStyle(l).opacity,
        };
      });
    }, screen);
  // Settings at rest (scroll 0) is under the Your Color screen; read it with the screen below.
  const onYourColor = await leavesAround('.screen--your-color');
  const onSettings = await leavesAround('[data-screen="settings"]');
  assert.equal(onYourColor.length, 18, '16 Figma leaves + 2 copies');
  assert.deepEqual(onYourColor, onSettings, 'same size, angle box, paleness and place relative to the avatar');
  const order = await page.evaluate(() => {
    const card = document.querySelector('.screen--your-color .color-preview');
    const kids = [...card.children].map((n) => n.className.split(' ')[0]);
    return { first: kids[0], pe: getComputedStyle(card.querySelector('.color-preview__pattern')).pointerEvents };
  });
  assert.equal(order.first, 'color-preview__pattern', 'drawn first: behind avatar, name and decorations');
  assert.equal(order.pe, 'none');
});

test('the selected colour is app state: kept across screens and reloads; blue by default', async () => {
  const ctx = await browser.newContext({ viewport: { width: 520, height: 960 } });
  const p = await ctx.newPage();
  const open = async () => {
    await p.click('[data-action="edit-profile"]');
    await p.waitForTimeout(450);
    await p.click('.screen--edit-profile [data-row="your-color"]');
    await p.waitForTimeout(450);
  };
  const sel = () => p.$$eval('.screen--your-color .color-swatch[aria-checked="true"]', (n) => n.map((x) => Number(x.dataset.swatch)));
  await p.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await open();
  assert.deepEqual(await sel(), [0], 'fresh start: blue');
  assert.equal(await p.evaluate(() => localStorage.getItem('tg-prototype:profile-color')), '0');
  // Pick green, leave through the other entry, come back: green.
  await p.click('.screen--your-color [data-swatch="1"]');
  await p.click('.screen--your-color .your-color__back');
  await p.waitForTimeout(450);
  await p.click('.screen--edit-profile [data-action="edit-close"]');
  await p.waitForTimeout(450);
  await p.click('[data-screen="settings"] [data-row="change-profile-decoration"]');
  await p.waitForTimeout(450);
  assert.deepEqual(await sel(), [1]);
  // Back to blue, reload: still blue.
  await p.click('.screen--your-color [data-swatch="0"]');
  await p.reload();
  await p.waitForTimeout(300);
  await open();
  assert.deepEqual(await sel(), [0], 'blue after reload');
  assert.equal(await p.$eval('.screen--your-color .color-preview', (n) => n.style.background), 'rgb(91, 142, 187)');
  // Broken stored value → blue.
  await p.evaluate(() => localStorage.setItem('tg-prototype:profile-color', 'oops'));
  await p.reload();
  await p.waitForTimeout(300);
  await open();
  assert.deepEqual(await sel(), [0]);
  await ctx.close();
});

test('the profile colour themes Settings and Edit Profile too: blue by default, purple exactly as before, live and after reload', async () => {
  const ctx = await browser.newContext({ viewport: { width: 520, height: 960 } });
  const p = await ctx.newPage();
  await p.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await p.waitForTimeout(300);
  const look = () =>
    p.evaluate(() => {
      const css = (sel, prop) => getComputedStyle(document.querySelector(sel))[prop];
      const edit = document.querySelector('.screen--edit-profile');
      return {
        header: css('.profile-header__color', 'backgroundColor'),
        rim: getComputedStyle(document.querySelector('.profile-header [data-action="edit-profile"]'), '::after').boxShadow.match(/rgb\([^)]+\)/)[0],
        circles: edit ? [css('.screen--edit-profile .color-circles__a', 'backgroundColor'), css('.screen--edit-profile .color-circles__b', 'backgroundColor')] : null,
      };
    });
  let v = await look();
  assert.equal(v.header, 'rgb(91, 142, 187)', 'Settings header blue #5B8EBB (as the Your Color card)');
  assert.equal(v.rim, 'rgb(164, 216, 251)', 'glass rim from the blue reference');
  await p.click('[data-action="edit-profile"]');
  await p.waitForTimeout(450);
  v = await look();
  const [a, b] = v.circles.map((c) => c.match(/\d+/g).map(Number));
  assert.ok(a[2] > a[0] + 100 && b[2] > b[0] + 100, `Your Color circles are blue (${v.circles})`);
  // Pick purple on Your Color: Edit and Settings follow at once, with the original purple values.
  await p.click('.screen--edit-profile [data-row="your-color"]');
  await p.waitForTimeout(450);
  await p.click('.screen--your-color [data-swatch="4"]');
  await p.click('.screen--your-color .your-color__back');
  await p.waitForTimeout(450);
  v = await look();
  assert.deepEqual(v.circles, ['rgb(141, 95, 212)', 'rgb(153, 110, 216)'], 'purple circles as before');
  assert.equal(v.header, 'rgb(156, 104, 206)', 'purple header #9C68CE as before');
  assert.equal(v.rim, 'rgb(229, 193, 255)', 'lavender rim as before');
  // Reload keeps the choice.
  await p.reload();
  await p.waitForTimeout(300);
  assert.equal((await look()).header, 'rgb(156, 104, 206)');
  await ctx.close();
});
