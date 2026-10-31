// Apply Style: preview selection (carousel) vs applied selection (stored id).
// The button shows only while they differ; tapping it saves and returns to
// Settings, which shows the decoration; kept across navigation and reloads.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
const URL_ = `${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`;
const KEY = 'tg-prototype:applied-decoration';
let browser;
let context;
let page;
const wait = (ms) => page.waitForTimeout(ms);

async function openYourColor() {
  await page.click('[data-action="edit-profile"]');
  await wait(450);
  await page.click('.screen--edit-profile [data-row="your-color"]');
  await wait(450);
}
/** Apply Style: saves and goes straight back to Settings by itself. */
async function apply() {
  await page.click('.screen--your-color .apply-style');
  await wait(450);
}
const applyVisible = () =>
  page.evaluate(() => {
    const bar = document.querySelector('.screen--your-color .apply-bar');
    if (!bar) return null;
    const cs = getComputedStyle(bar);
    return cs.visibility === 'visible' && +cs.opacity > 0.5;
  });
const active = () => page.evaluate(() => document.documentElement.dataset.activeScreen);
async function backToSettings() {
  await page.click('.screen--your-color .your-color__back');
  await wait(450);
  await page.click('.screen--edit-profile [data-action="edit-close"]');
  await wait(450);
}
/** Swipe the carousel (via its API, same path as a swipe) until `id` is on the avatar. */
async function preview(id) {
  for (let i = 0; i < 8; i++) {
    if ((await page.evaluate(() => window.prototype.yourColor().decorations.previewId())) === id) return;
    await page.evaluate(() => window.prototype.yourColor().decorations.next());
    await wait(480);
  }
  throw new Error(`could not reach ${id}`);
}
const applied = () => page.evaluate((k) => localStorage.getItem(k), KEY);
const settingsAvatar = () =>
  page.evaluate(() => {
    const s = document.querySelector('[data-screen="settings"]');
    const layer = s.querySelector('[data-slot="avatar-decoration"]');
    const photo = s.querySelector('.avatar__photo').getBoundingClientRect();
    const svg = layer.querySelector(':scope > svg');
    const r = svg?.getBoundingClientRect();
    return {
      id: layer.dataset.decoration ?? null,
      svgs: layer.querySelectorAll(':scope > svg').length,
      release: svg?.getAttribute('data-decoration') ?? null,
      size: r ? r.width : 0,
      dx: r ? r.left + r.width / 2 - (photo.left + photo.width / 2) : null,
      dy: r ? r.top + r.height / 2 - (photo.top + photo.height / 2) : null,
      overflow: svg ? getComputedStyle(svg).overflow : null,
    };
  });

before(async () => {
  browser = await chromium.launch();
  context = await browser.newContext({ viewport: { width: 520, height: 960 } });
  page = await context.newPage();
  await page.goto(URL_);
  await page.evaluate(() => document.fonts.ready);
});

after(async () => {
  await browser?.close();
});

test('fresh start: nothing applied; Your Color opens on None with no Apply Style button', async () => {
  assert.equal(await applied(), null);
  assert.equal((await settingsAvatar()).svgs, 0);
  await openYourColor();
  assert.equal(await page.evaluate(() => window.prototype.yourColor().decorations.previewId()), 'none');
  assert.equal(await applyVisible(), false, 'hidden: nothing changed yet');
  assert.equal(await page.$eval('.screen--your-color .apply-style', (n) => n.tabIndex), -1, 'not reachable by keyboard while hidden');
});

test('1–3: another decoration shows the button (same place and look); back to the saved one hides it', async () => {
  await preview('christmas-lights');
  await wait(300);
  assert.equal(await applyVisible(), true, 'shown: unsaved change');
  const g = await page.evaluate(() => {
    const scr = document.querySelector('.device__screen').getBoundingClientRect();
    const b = document.querySelector('.screen--your-color .apply-style');
    const r = b.getBoundingClientRect();
    const reset = document.querySelector('.screen--your-color [data-group="reset-color"]').getBoundingClientRect();
    const cs = getComputedStyle(b);
    return { text: b.textContent, x: r.left - scr.left, y: r.top - scr.top, w: r.width, h: r.height, resetBottom: reset.bottom - scr.top, bg: cs.backgroundColor, radius: cs.borderRadius };
  });
  assert.equal(g.text, 'Apply Style');
  assert.deepEqual([g.x, g.w, g.h, g.y + g.h], [36, 330, 52, 874 - 34 - 8], 'same place and size');
  assert.ok(g.y > g.resetBottom + 8, 'covers nothing');
  assert.equal(g.bg, 'rgb(0, 139, 255)');
  assert.equal(g.radius, '26px');
  // Back to None (the saved state): hidden again.
  while ((await page.evaluate(() => window.prototype.yourColor().decorations.previewId())) !== 'none') {
    await page.evaluate(() => window.prototype.yourColor().decorations.prev());
    await wait(480);
  }
  await wait(320);
  assert.equal(await applyVisible(), false, 'hidden: back to the saved decoration');
  assert.equal(await applied(), null, 'nothing saved by swiping');
});

test('the button appears and disappears smoothly (fade + slide, no layout jump)', async () => {
  const before_ = await page.$eval('.screen--your-color .your-color__content', (n) => n.getBoundingClientRect().height);
  await page.evaluate(() => window.prototype.yourColor().decorations.next());
  await wait(440); // glide done, button transition just started
  const mid = await page.$eval('.screen--your-color .apply-bar', (n) => ({ o: +getComputedStyle(n).opacity, t: getComputedStyle(n).transform }));
  assert.ok(mid.o > 0 && mid.o < 1, `mid-fade (${mid.o})`);
  await wait(400);
  assert.equal(await applyVisible(), true);
  const after_ = await page.$eval('.screen--your-color .your-color__content', (n) => n.getBoundingClientRect().height);
  assert.equal(after_, before_, 'page layout unchanged');
  await page.evaluate(() => window.prototype.yourColor().decorations.prev());
  await wait(900);
  assert.equal(await applyVisible(), false);
});

test('colour changes do not show the button', async () => {
  await page.click('.screen--your-color [data-swatch="2"]');
  await wait(300);
  assert.equal(await applyVisible(), false);
  await page.click('.screen--your-color [data-swatch="0"]');
});

test('4–5: Apply Style saves and returns straight to Settings (from Edit Profile too), showing the decoration', async () => {
  await preview('christmas-lights');
  await wait(300);
  assert.equal(await active(), 'your-color');
  await apply();
  assert.equal(await applied(), 'christmas-lights', 'saved by stable id');
  assert.equal(await active(), 'settings', 'back on Settings, no extra page');
  assert.deepEqual(await page.$$eval('.screen-stack > *', (n) => n.map((x) => x.dataset.screen)), ['settings'], 'Your Color and Edit Profile closed');
  const a = await settingsAvatar();
  assert.deepEqual([a.id, a.release, a.svgs], ['christmas-lights', 'christmas-lights', 1]);
  assert.ok(Math.abs(a.size - (104 * 512) / 436) < 0.05, 'same scale as in the carousel');
  assert.ok(Math.abs(a.dx) < 0.05 && Math.abs(a.dy) < 0.05, 'same placement relative to the photo');
  assert.equal(a.overflow, 'visible');
});

test('Settings: the garland animates over the leaves and is not clipped', async () => {
  const info = await page.evaluate(() => {
    const s = document.querySelector('[data-screen="settings"]');
    const svg = s.querySelector('[data-slot="avatar-decoration"] > svg');
    const r = svg.getBoundingClientRect();
    const k = r.width / 512;
    const ink = { left: r.left - 17 * k, top: r.top - 15 * k, right: r.left + 426 * k, bottom: r.top + 303 * k };
    const surface = s.querySelector('.profile-header__surface').getBoundingClientRect();
    const pattern = s.querySelector('.profile-header__pattern');
    const avatar = s.querySelector('.avatar');
    const order = pattern.compareDocumentPosition(avatar) & Node.DOCUMENT_POSITION_FOLLOWING;
    return { inside: ink.left >= surface.left && ink.right <= surface.right && ink.top >= surface.top && ink.bottom <= surface.bottom, overLeaves: !!order, html: svg.innerHTML };
  });
  assert.ok(info.inside, 'glow and sparkles inside the header');
  assert.ok(info.overLeaves, 'drawn after (over) the leaf pattern');
  await wait(200);
  const html2 = await page.$eval('[data-screen="settings"] [data-slot="avatar-decoration"] > svg', (n) => n.innerHTML);
  assert.notEqual(info.html, html2, 'animating');
});

test('6–7: reopening shows the saved one without the button; leaving through Back saves nothing', async () => {
  await openYourColor();
  assert.equal(await page.evaluate(() => window.prototype.yourColor().decorations.previewId()), 'christmas-lights', 'reopens on the saved one');
  assert.equal(await applyVisible(), false, 'no button: already saved');
  await preview('paper-plane-orbit');
  await wait(300);
  assert.equal(await applyVisible(), true);
  await backToSettings();
  assert.equal((await settingsAvatar()).id, 'christmas-lights');
  assert.equal(await applied(), 'christmas-lights');
  await openYourColor();
  assert.equal(await page.evaluate(() => window.prototype.yourColor().decorations.previewId()), 'christmas-lights');
  assert.equal(await applyVisible(), false);
  await backToSettings();
});

test('Paper Plane Orbit + Apply Style from the Change Profile Decoration row → plane on Settings', async () => {
  await page.click('[data-screen="settings"] [data-row="change-profile-decoration"]');
  await wait(450);
  await preview('paper-plane-orbit');
  await apply();
  assert.equal(await active(), 'settings');
  const a = await settingsAvatar();
  assert.deepEqual([a.id, a.release, a.svgs], ['paper-plane-orbit', 'paper-plane-orbit', 1]);
});

test('8: reload keeps the plane; Your Color opens on it, no button', async () => {
  await page.reload();
  await page.evaluate(() => document.fonts.ready);
  await wait(300);
  assert.equal(await applied(), 'paper-plane-orbit');
  assert.equal((await settingsAvatar()).id, 'paper-plane-orbit');
  await openYourColor();
  assert.equal(await page.evaluate(() => window.prototype.yourColor().decorations.previewId()), 'paper-plane-orbit');
  assert.equal(await applyVisible(), false);
  await backToSettings();
});

test('9: None — selecting it shows the button; Apply Style removes the decoration; avatar, leaves and colour unchanged', async () => {
  const before = await page.evaluate(() => {
    const s = document.querySelector('[data-screen="settings"]');
    return { leaves: s.querySelectorAll('.pattern-leaf').length, photo: s.querySelector('.avatar__photo').getBoundingClientRect().toJSON() };
  });
  await openYourColor();
  await preview('none');
  await wait(300);
  assert.equal(await applyVisible(), true, 'None differs from the saved plane');
  await apply();
  assert.equal(await active(), 'settings');
  const a = await settingsAvatar();
  assert.deepEqual([a.id, a.svgs], ['none', 0]);
  assert.equal(await applied(), 'none');
  const after_ = await page.evaluate(() => {
    const s = document.querySelector('[data-screen="settings"]');
    return { leaves: s.querySelectorAll('.pattern-leaf').length, photo: s.querySelector('.avatar__photo').getBoundingClientRect().toJSON() };
  });
  assert.deepEqual(after_, before);
  await page.reload();
  await wait(300);
  assert.equal((await settingsAvatar()).svgs, 0, 'none survives a reload');
  await openYourColor();
  assert.equal(await applyVisible(), false, 'None saved: no button');
  await preview('ghost-orbit');
  await wait(300);
  assert.equal(await applyVisible(), true, 'and back from None to a decoration shows it');
  await backToSettings();
});

test('every catalogue item can be applied and shown on Settings (by id)', async () => {
  const ids = await page.evaluate(() => window.prototype.decorations.map((d) => d.id));
  for (const id of ids) {
    await openYourColor();
    await preview(id);
    await wait(300);
    if (await applyVisible()) await apply();
    else await backToSettings(); // already the saved one
    assert.equal(await active(), 'settings');
    const a = await settingsAvatar();
    assert.equal(a.id, id);
    assert.equal(a.svgs, id === 'none' ? 0 : 1, `${id}: exactly one decoration`);
    if (id !== 'none') assert.equal(a.release, id);
  }
});

test('Settings decoration pauses while covered by another screen, resumes on return', async () => {
  await openYourColor();
  await preview('ghost-orbit');
  await wait(300);
  if (await applyVisible()) await apply();
  await openYourColor();
  const snap = () => page.$eval('[data-screen="settings"] [data-slot="avatar-decoration"] > svg', (n) => n.innerHTML);
  const a = await snap();
  await wait(250);
  assert.equal(await snap(), a, 'paused under Your Color');
  await backToSettings();
  const b = await snap();
  await wait(250);
  assert.notEqual(await snap(), b, 'playing on Settings');
});

test('unknown stored id or blocked storage → start without a decoration', async () => {
  await page.evaluate((k) => localStorage.setItem(k, 'removed-decoration'), KEY);
  await page.reload();
  await wait(300);
  assert.equal((await settingsAvatar()).svgs, 0);
  const p2 = await context.newPage();
  await p2.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked'); } });
  });
  await p2.goto(URL_);
  await p2.waitForTimeout(300);
  const ok = await p2.evaluate(() => !!document.querySelector('[data-screen="settings"] [data-slot="avatar-decoration"]'));
  assert.ok(ok, 'prototype still runs');
  await p2.click('[data-action="edit-profile"]');
  await p2.waitForTimeout(450);
  await p2.click('.screen--edit-profile [data-row="your-color"]');
  await p2.waitForTimeout(450);
  await p2.evaluate(() => window.prototype.yourColor().decorations.next());
  await p2.waitForTimeout(800);
  await p2.click('.screen--your-color .apply-style');
  await p2.waitForTimeout(450);
  const second = await p2.evaluate(() => window.prototype.decorations[1].id);
  assert.equal(await p2.$eval('[data-screen="settings"] [data-slot="avatar-decoration"]', (n) => n.dataset.decoration), second, 'applied for the session');
  await p2.close();
});

test('a Cat Ears choice saved before the update shows v1.1.0, without choosing again', async () => {
  const p3 = await context.newPage();
  await p3.addInitScript((k) => localStorage.setItem(k, 'cat-ears'), KEY);
  await p3.goto(URL_);
  await p3.waitForTimeout(400);
  const info = await p3.evaluate(() => {
    const layer = document.querySelector('[data-screen="settings"] [data-slot="avatar-decoration"]');
    const entry = window.prototype.decorations.find((d) => d.id === 'cat-ears');
    return { id: layer.dataset.decoration, svgs: layer.querySelectorAll(':scope > svg').length, version: entry.version, stored: localStorage.getItem('tg-prototype:applied-decoration') };
  });
  assert.deepEqual(info, { id: 'cat-ears', svgs: 1, version: '1.1.0', stored: 'cat-ears' });
  // Fur at the widest sway is not cut: nothing between the ears and the header clips.
  const clip = await p3.evaluate(() => {
    let n = document.querySelector('[data-screen="settings"] [data-slot="avatar-decoration"] > svg');
    const out = [];
    for (; n && !n.classList.contains('profile-header__surface'); n = n.parentElement) out.push(getComputedStyle(n).overflow);
    const photo = getComputedStyle(document.querySelector('[data-screen="settings"] .avatar__photo'));
    return { out, photoRadius: photo.borderRadius };
  });
  assert.ok(clip.out.every((o) => o === 'visible'), `no wrapper clips the ears (${clip.out})`);
  assert.equal(clip.photoRadius, '50%', 'the photo stays round');
  await p3.close();
});

test('the applied style is kept by id when the carousel order changes', async () => {
  const p4 = await context.newPage();
  await p4.addInitScript((k) => localStorage.setItem(k, 'christmas-lights'), KEY);
  await p4.goto(URL_);
  await p4.waitForTimeout(400);
  const order = await p4.evaluate(() => window.prototype.decorations.map((d) => d.id));
  assert.deepEqual(order, ['none', 'paper-plane-orbit', 'cat-ears', 'christmas-lights', 'ghost-orbit', 'halloween-pumpkin']);
  assert.equal(await p4.$eval('[data-screen="settings"] [data-slot="avatar-decoration"]', (n) => n.dataset.decoration), 'christmas-lights');
  await p4.click('[data-action="edit-profile"]');
  await p4.waitForTimeout(450);
  await p4.click('.screen--edit-profile [data-row="your-color"]');
  await p4.waitForTimeout(500);
  const view = await p4.evaluate(() => {
    const d = window.prototype.yourColor().decorations;
    const role = (r) => document.querySelector(`.screen--your-color .deco-holder[data-role="${r}"]`)?.dataset.decoration;
    return { index: d.index, preview: d.previewId(), left: role('left'), right: role('right') };
  });
  assert.deepEqual(view, { index: 3, preview: 'christmas-lights', left: 'cat-ears', right: 'ghost-orbit' });
  assert.equal(await p4.$eval('.screen--your-color .apply-bar', (n) => n.classList.contains('is-visible')), false, 'saved one shown: no button');
  assert.equal(await p4.evaluate((k) => localStorage.getItem(k), KEY), 'christmas-lights', 'still the same id');
  await p4.close();
});

test('one profile photo everywhere (the new picture): round, not distorted, unchanged by switching, after Apply Style and reload', async () => {
  const photos = async (pg) =>
    pg.evaluate(() =>
      [...document.querySelectorAll('.avatar__photo, .edit-profile__photo')].map((img) => {
        const cs = getComputedStyle(img);
        const r = img.getBoundingClientRect();
        return { src: img.currentSrc || img.src, w: img.naturalWidth, h: img.naturalHeight, radius: cs.borderRadius, fit: cs.objectFit, box: [Math.round(r.width), Math.round(r.height)], filter: cs.filter };
      }),
    );
  const pg = await context.newPage();
  await pg.goto(URL_);
  await pg.waitForTimeout(300);
  await pg.click('[data-action="edit-profile"]');
  await pg.waitForTimeout(450);
  await pg.click('.screen--edit-profile [data-row="your-color"]');
  await pg.waitForTimeout(500);
  let list = await photos(pg);
  assert.equal(list.length, 3, 'Settings, Edit Profile, Your Color');
  assert.equal(new Set(list.map((p) => p.src)).size, 1, 'one shared source');
  assert.match(list[0].src, /capybara-profile/, 'the new picture');
  for (const p of list) {
    assert.deepEqual([p.w, p.h], [384, 384], 'square source, nothing stretched');
    assert.equal(p.radius, '50%');
    assert.equal(p.fit, 'cover');
    assert.equal(p.filter, 'none', 'no filters');
    assert.equal(p.box[0], p.box[1], 'round, not oval');
  }
  assert.deepEqual(list.map((p) => p.box[0]), [104, 100, 104], 'sizes as before');
  const src = list[0].src;
  await pg.evaluate(() => window.prototype.yourColor().decorations.next());
  await pg.waitForTimeout(500);
  assert.equal((await photos(pg))[2].src, src, 'switching decorations keeps the photo');
  await pg.click('.screen--your-color .apply-style');
  await pg.waitForTimeout(450);
  list = await photos(pg);
  assert.equal(list[0].src, src);
  assert.equal(await pg.$$eval('[data-screen="settings"] [data-slot="avatar-decoration"] > svg', (n) => n.length), 1, 'decoration on the new photo');
  await pg.reload();
  await pg.waitForTimeout(300);
  assert.equal((await photos(pg))[0].src, src, 'after reload');
  await pg.close();
});
