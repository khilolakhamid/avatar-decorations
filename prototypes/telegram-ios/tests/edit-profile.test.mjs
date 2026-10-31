// Edit Profile screen and the Settings → Edit → Settings navigation.
// Geometry: reference screenshots (393 × 852) mapped to the 402 × 874 frame
// (y − 2, so × / ✓ line up with the Settings buttons). Run with `npm test`.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
let browser;
let page;

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

const settle = () => page.waitForTimeout(450);
const E = '.screen--edit-profile';

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 520, height: 960 } });
  await page.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await page.evaluate(() => document.fonts.ready);
});

after(async () => {
  await browser?.close();
});

test('Edit opens the Edit Profile screen', async () => {
  assert.equal(await page.$(E), null);
  await page.click('[data-action="edit-profile"]');
  await settle();
  assert.ok(await page.$(E));
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'edit-profile');
  const statusColor = await page.$eval('.status-bar', (n) => getComputedStyle(n).color);
  assert.equal(statusColor, 'rgb(0, 0, 0)', 'dark status bar on the light screen');
  // Nothing from Settings shows through (its header and tab bar are underneath).
  const onTop = await page.evaluate(() => {
    const s = document.querySelector('.device__screen').getBoundingClientRect();
    return document.elementFromPoint(s.left + 200, s.top + 820)?.closest('[data-screen]')?.dataset.screen;
  });
  assert.equal(onTop, 'edit-profile');
});

test('top: × and ✓ at the Settings button positions, photo and Change Photo', async () => {
  assertRect(await rect(`${E} .edit-profile__close`), [16, 62, 44, 44], 'close');
  assertRect(await rect(`${E} .edit-profile__done`), [342, 62, 44, 44], 'done');
  assertRect(await rect(`${E} .edit-profile__photo`), [151, 74, 100, 100], 'photo');
  const src = await page.$eval(`${E} .edit-profile__photo`, (n) => n.getAttribute('src'));
  const settingsSrc = await page.$eval('.avatar__photo', (n) => n.getAttribute('src'));
  assert.equal(src, settingsSrc, 'same capybara photo as on Settings');
  const change = await rect(`${E} .edit-profile__change-photo-text`);
  near(change.y + change.height, 200.33, 'Change Photo baseline', 0.6);
  near(change.x + change.width / 2, 201, 'Change Photo centred', 0.6);
});

test('cards follow the reference spacing', async () => {
  const cards = await page.$$eval(`${E} .settings-group`, (nodes) => {
    const s = document.querySelector('.device__screen').getBoundingClientRect();
    return nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return [n.dataset.group, r.left - s.left, r.top - s.top, r.width, r.height];
    });
  });
  const expected = [
    ['name', 16, 222, 370, 100],
    ['bio', 16, 376, 370, 50],
    ['birthday', 16, 480, 370, 52],
    ['profile-info', 16, 586, 370, 208],
    ['add-another-account', 16, 818, 370, 52], // profile card + 24 (no footnote any more)
    ['log-out', 16, 940, 370, 52],
  ];
  assert.deepEqual(cards.map((c) => c[0]), expected.map((e) => e[0]));
  expected.forEach((e, i) => assertRect({ x: cards[i][1], y: cards[i][2], width: cards[i][3], height: cards[i][4] }, e.slice(1), e[0]));
});

test('rows: Number, Username, Your Color, Channel — no Chat Automation', async () => {
  const titles = await page.$$eval(`${E} [data-group="profile-info"] .settings-row__title`, (n) => n.map((x) => x.textContent));
  assert.deepEqual(titles, ['Number', 'Username', 'Your Color', 'Channel']);
  assert.equal(await page.$$eval(`${E} [data-row="chat-automation"]`, (n) => n.length), 0);
  assert.equal(await page.$$eval(`${E} [data-row="username"] .settings-row__value`, (n) => n.length), 0, 'no username value');
  assert.equal(await page.$$eval(`${E} [data-row="username"] .settings-row__chevron`, (n) => n.length), 1, 'chevron only');
  const values = await page.$$eval(`${E} .settings-row__value`, (n) => n.map((x) => x.textContent));
  assert.deepEqual(values, ['Add', '+888 888 888', '', 'Capybara Channel']);
  // Reference: circles end 34 before the card edge, centred on the row (y 450 − 2 + 162 shift of the card).
  assertRect(await rect(`${E} .color-circles`), [386 - 34 - 42, 586 + 2 * 52 + 14, 42, 24], 'colour circles');
  const notes = await page.$$eval(`${E} .edit-footnote`, (n) => n.map((x) => x.textContent));
  assert.deepEqual(notes, [
    'Enter your name and add an optional profile photo.',
    'A few words about you.',
    'Nobody can see your birthday. Change',
    'You can add up to four accounts with different phone numbers.',
  ]);
});

test('own colour icons: five tiles with a glyph, nothing copied from Telegram', async () => {
  const glyphs = await page.$$eval(`${E} .settings-row__tile`, (n) => n.map((t) => !!t.querySelector('svg') && !t.dataset.glyph));
  assert.deepEqual(glyphs, [true, true, true, true, true]);
  // Glyphs are centred in their tiles.
  const offsets = await page.$$eval(`${E} .settings-row__tile`, (tiles) =>
    tiles.map((t) => {
      const a = t.getBoundingClientRect();
      const b = t.querySelector('svg').getBoundingClientRect();
      return [b.left + b.width / 2 - (a.left + a.width / 2), b.top + b.height / 2 - (a.top + a.height / 2)];
    }),
  );
  offsets.flat().forEach((d) => near(d, 0, 'glyph centred', 0.05));
  for (const sel of [`${E} [data-row="birthday"] .settings-row__tile`, `${E} [data-row="number"] .settings-row__tile`]) {
    assertRect(await rect(sel), [32, (await rect(sel)).y, 30, 30], 'tile size');
  }
  const { readdirSync, statSync } = await import('node:fs');
  const walk = (dir) => readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
  const files = walk(join(root, 'src'));
  assert.equal(files.filter((f) => /\.pdf$/i.test(f)).length, 0, 'no Telegram PDF resources in the project');
});

test('fields are real, editable inputs; bio grows without breaking the layout', async () => {
  await page.fill(`${E} input[name="last-name"]`, 'Hydrochoerus');
  assert.equal(await page.inputValue(`${E} input[name="last-name"]`), 'Hydrochoerus');
  const before = await rect(`${E} [data-group="birthday"]`);
  await page.fill(`${E} textarea[name="bio"]`, 'Calm, round and very good at sitting in hot springs all day long.');
  await page.dispatchEvent(`${E} textarea[name="bio"]`, 'input');
  const bio = await rect(`${E} [data-group="bio"]`);
  const afterBirthday = await rect(`${E} [data-group="birthday"]`);
  assert.ok(bio.height > 50, 'bio card grew');
  near(afterBirthday.y - before.y, bio.height - 50, 'cards below move by exactly the growth', 0.6);
  await page.fill(`${E} textarea[name="bio"]`, '');
  await page.dispatchEvent(`${E} textarea[name="bio"]`, 'input');
  assertRect(await rect(`${E} [data-group="bio"]`), [16, 376, 370, 50], 'bio back to one line');
});

test('scrolling: buttons stay, content reaches Log Out', async () => {
  const max = await page.evaluate(() => {
    const s = document.querySelector('.screen--edit-profile .screen__scroll');
    s.scrollTop = 1e5;
    return s.scrollTop;
  });
  await page.waitForTimeout(100);
  assert.ok(max > 150);
  assertRect(await rect(`${E} .edit-profile__close`), [16, 62, 44, 44], 'close after scroll');
  assertRect(await rect(`${E} .edit-profile__done`), [342, 62, 44, 44], 'done after scroll');
  const logOut = await rect(`${E} [data-group="log-out"]`);
  near(874 - (logOut.y + logOut.height), 44, 'space under Log Out (as in the reference)', 0.6);
  // The top blur never blocks touches or the mouse wheel (on both screens).
  const blocking = await page.$$eval('.profile-header__bar-blur', (n) => n.map((x) => getComputedStyle(x).pointerEvents));
  assert.deepEqual([...new Set(blocking)], ['none']);
  // Wheel over the top area scrolls the page.
  await page.evaluate(() => (document.querySelector('.screen--edit-profile .screen__scroll').scrollTop = 0));
  const box = await page.locator('.device__screen').boundingBox();
  await page.mouse.move(box.x + 201, box.y + 120);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(300);
  assert.ok((await page.evaluate(() => document.querySelector('.screen--edit-profile .screen__scroll').scrollTop)) > 100, 'wheel over the top area scrolls');
  const blur = await page.$eval(`${E} .profile-header__bar-blur`, (n) => getComputedStyle(n).opacity);
  assert.equal(blur, '1', 'top blur on while content is under the bar');
  await page.evaluate(() => (document.querySelector('.screen--edit-profile .screen__scroll').scrollTop = 0));
  await page.waitForTimeout(100);
  assert.equal(await page.$eval(`${E} .profile-header__bar-blur`, (n) => getComputedStyle(n).opacity), '0', 'no blur at rest');
});

test('× returns to Settings; Edit → ✓ returns too; Settings is unchanged', async () => {
  await page.click(`${E} .edit-profile__close`);
  await settle();
  assert.equal(await page.$(E), null);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'settings');
  assertRect(await rect('[data-component="avatar"]'), [149, 90, 104, 104], 'Settings avatar untouched');

  await page.click('[data-action="edit-profile"]');
  await settle();
  await page.click(`${E} .edit-profile__done`);
  await settle();
  assert.equal(await page.$(E), null);
  assert.equal(await page.$$eval('.tab-bar [role="tab"]', (n) => n.length), 4);
});
