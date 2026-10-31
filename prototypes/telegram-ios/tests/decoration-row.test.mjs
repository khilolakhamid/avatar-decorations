// Settings → "Change Profile Decoration" → Your Color (the existing screen) → back.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const URL_ = `${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`;
const KEY = 'tg-prototype:applied-decoration';
let browser;
let page;
const wait = (ms) => page.waitForTimeout(ms);
const active = () => page.evaluate(() => document.documentElement.dataset.activeScreen);

async function openFromRow() {
  await page.click('[data-screen="settings"] [data-row="change-profile-decoration"]');
  // Mid-transition: the new screen fades/rises in (same as every push).
  const entering = await page.$eval('.screen--your-color', (n) => n.classList.contains('is-entering') || getComputedStyle(n).opacity !== '1');
  await wait(450);
  return entering;
}

before(async () => {
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 520, height: 960 } });
  await context.addInitScript((k) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem(k, 'christmas-lights'); // applied earlier with Apply Style
      sessionStorage.setItem('seeded', '1');
    }
  }, KEY);
  page = await context.newPage();
  await page.goto(URL_);
  await page.evaluate(() => document.fonts.ready);
});

after(async () => {
  await browser?.close();
});

test('1–3: tapping the row opens Your Color directly, on Profile, with the applied decoration', async () => {
  assert.equal(await active(), 'settings');
  const entering = await openFromRow();
  assert.ok(entering, 'smooth push transition, like the other screens');
  assert.equal(await active(), 'your-color');
  const v = await page.evaluate(() => {
    const scr = document.querySelector('.screen--your-color');
    return {
      screens: document.querySelectorAll('.screen--your-color').length,
      stack: [...document.querySelector('.screen-stack').children].map((n) => n.dataset.screen),
      back: !!scr.querySelector('.your-color__back'),
      profileTab: scr.querySelector('[data-action="segment-profile"]').getAttribute('aria-selected'),
      nameTab: scr.querySelector('[data-action="segment-name"]').getAttribute('aria-selected'),
      swatches: scr.querySelectorAll('[data-swatch]').length,
      selectedSwatch: scr.querySelector('[data-swatch][aria-checked="true"]').dataset.swatch,
      addIcons: !!scr.querySelector('[data-row="add-icons-to-profile"]'),
      footnote: scr.querySelector('.edit-footnote').textContent.includes('You can change the color of your name'),
      reset: scr.querySelector('[data-action="reset-color"]').textContent,
      apply: !!scr.querySelector('.apply-style'),
      onAvatar: window.prototype.yourColor().decorations.previewId(),
      menus: document.querySelectorAll('[role="dialog"], [role="menu"]').length,
    };
  });
  assert.deepEqual(v, {
    screens: 1,
    stack: ['settings', 'your-color'],
    back: true,
    profileTab: 'true',
    nameTab: 'false',
    swatches: 16,
    selectedSwatch: '0',
    addIcons: true,
    footnote: true,
    reset: 'Reset Profile Color',
    apply: true,
    onAvatar: 'christmas-lights',
    menus: 0,
  });
});

test('4: back returns to Settings; the applied decoration is still on the avatar', async () => {
  await page.click('.screen--your-color .your-color__back');
  await wait(450);
  assert.equal(await active(), 'settings');
  assert.equal(await page.$$eval('.screen--your-color', (n) => n.length), 0, 'Your Color closed (its animations freed)');
  assert.equal(await page.$eval('[data-screen="settings"] [data-slot="avatar-decoration"]', (n) => n.dataset.decoration), 'christmas-lights');
});

test('5: repeating works; carousel and Apply Style work from this entry too', async () => {
  for (let i = 0; i < 3; i++) {
    await openFromRow();
    assert.equal(await active(), 'your-color');
    assert.equal(await page.$$eval('.screen--your-color', (n) => n.length), 1, 'never two Your Color screens');
    await page.click('.screen--your-color .your-color__back');
    await wait(450);
    assert.equal(await active(), 'settings');
  }
  await openFromRow();
  await page.evaluate(() => window.prototype.yourColor().decorations.next());
  await wait(500);
  const id = await page.evaluate(() => window.prototype.yourColor().decorations.previewId());
  await page.click('.screen--your-color .apply-style'); // saves and returns to Settings by itself
  await wait(450);
  assert.equal(await active(), 'settings');
  assert.equal(await page.$eval('[data-screen="settings"] [data-slot="avatar-decoration"]', (n) => n.dataset.decoration), id);
  assert.equal(await page.evaluate((k) => localStorage.getItem(k), KEY), id);
});

test('the Edit → Your Color path still returns to Edit Profile', async () => {
  await page.click('[data-action="edit-profile"]');
  await wait(450);
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await wait(450);
  await page.click('.screen--your-color .your-color__back');
  await wait(450);
  assert.equal(await active(), 'edit-profile');
  await page.click('.screen--edit-profile [data-action="edit-close"]');
  await wait(450);
  assert.equal(await active(), 'settings');
});
