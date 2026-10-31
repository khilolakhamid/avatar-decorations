// Layout tests of the Settings screen against the Figma geometry.
// Run with `npm test` (builds first). Needs Playwright with Chromium.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = new URL('..', import.meta.url).pathname;
let browser;
let page;

/** Rect of the first element matching `selector`, relative to the 402 × 874 screen. */
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

before(async () => {
  browser = await chromium.launch();
  page = await browser.newPage({ viewport: { width: 520, height: 960 } });
  await page.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
  await page.evaluate(() => document.fonts.ready);
});

after(async () => {
  await browser?.close();
});

test('screen is the Figma frame size', async () => {
  assertRect(await rect('.device__screen'), [0, 0, 402, 874], 'screen');
});

test('header elements sit at the Figma coordinates', async () => {
  assertRect(await rect('.profile-header'), [0, 0, 402, 268], 'header');
  assertRect(await rect('.profile-header__qr'), [16, 62, 44, 44], 'QR button');
  assertRect(await rect('.profile-header__edit'), [331, 62, 55, 44], 'Edit button (Telegram reference: 55 × 44 capsule)');
  assertRect(await rect('.profile-header__search'), [275, 62, 44, 44], 'Search button (12 pt left of Edit)');
  assertRect(await rect('.profile-header__qr .icon svg'), [27.008, 72.758, 21.984, 21.984], 'QR icon');
  // The star's x depends on the width of the name, i.e. on the font (SF Pro
  // on Apple devices, a fallback elsewhere), so only its row and size are fixed.
  const star = await rect('.profile-header__star svg');
  near(star.y, 211, 'star y');
  near(star.width, 20, 'star width');
  near(star.height, 20, 'star height');
});

test('avatar is a separate 104 × 104 element with an empty decoration layer', async () => {
  assertRect(await rect('[data-component="avatar"]'), [149, 90, 104, 104], 'avatar');
  assertRect(await rect('.avatar__photo'), [149, 90, 104, 104], 'photo');
  assertRect(await rect('[data-slot="avatar-decoration"]'), [149, 90, 104, 104], 'decoration layer');
  const empty = await page.evaluate(() => document.querySelector('[data-slot="avatar-decoration"]').childElementCount);
  assert.equal(empty, 0, 'nothing applied yet (fresh start): the layer is empty');
});

test('settings cards match the Figma cards', async () => {
  const cards = await page.$$eval('.settings-group', (nodes) => {
    const screen = document.querySelector('.device__screen').getBoundingClientRect();
    return nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return [r.left - screen.left, r.top - screen.top, r.width, r.height];
    });
  });
  const expected = [
    [16, 284, 370, 156], // + Change Profile Decoration (52)
    [16, 464, 370, 52],
    [16, 540, 370, 52],
    // Wallet card removed: Saved Messages… moved up by one card (52 + 24).
    [16, 616, 370, 208],
  ];
  assert.equal(cards.length, expected.length);
  expected.forEach((e, i) => assertRect({ x: cards[i][0], y: cards[i][1], width: cards[i][2], height: cards[i][3] }, e, `card ${i + 1}`));
});

test('rows: order, icons, tiles, chevrons and separators', async () => {
  const titles = await page.$$eval('.settings-row__title', (n) => n.map((x) => x.textContent));
  assert.deepEqual(titles, [
    'Set Emoji Status',
    'Change Profile Decoration',
    'Change Profile Photo',
    'Add Account',
    'My Profile',
    'Saved Messages',
    'Recent Calls',
    'Devices',
    'Chat Folders',
  ]);
  assertRect(await rect('[data-row="set-emoji-status"] .settings-row__icon svg'), [43.398, 297.717, 25.723, 25.722], 'emoji icon');
  // Everything below the new row moved down by one row (52).
  assertRect(await rect('[data-row="change-profile-decoration"] .settings-row__icon svg'), [42.94, 350.21, 24.12, 23.985], 'decoration icon (drawing, ×1.17)');
  assertRect(await rect('[data-row="change-profile-photo"] .settings-row__icon svg'), [41.084, 403.152, 25.693, 22.5], 'photo icon');
  assertRect(await rect('[data-row="add-account"] .settings-row__icon svg'), [43.223, 478.098, 23.555, 23.554], 'add icon');
  assertRect(await rect('[data-row="my-profile"] .settings-row__tile'), [32, 551, 30, 30], 'My Profile tile');
  assertRect(await rect('[data-row="my-profile"] .settings-row__glyph svg'), [37.971, 556.908, 18.059, 18.059], 'My Profile glyph');
  assertRect(await rect('[data-row="devices"] .settings-row__glyph svg'), [37.14, 738.548, 19.721, 14.779], 'Devices glyph');
  assertRect(await rect('[data-row="my-profile"] .settings-row__chevron svg'), [364.54, 560.055, 6.948, 11.903], 'chevron');
  assertRect(await rect('[data-row="change-profile-decoration"] .settings-row__separator'), [90, 335, 280, 1], 'separator (new row)');
  assertRect(await rect('[data-row="change-profile-photo"] .settings-row__separator'), [90, 387, 280, 1], 'separator (plain)');
  assertRect(await rect('[data-row="recent-calls"] .settings-row__separator'), [78, 667, 292, 1], 'separator (tile)');
  assert.equal(await page.$$eval('[data-row="set-emoji-status"] .settings-row__separator', (n) => n.length), 0);
});

test('Wallet is removed from the screen structure', async () => {
  assert.equal(await page.$$eval('[data-row="wallet"], [data-group="wallet"]', (n) => n.length), 0);
  assert.equal(await page.evaluate(() => /Wallet/.test(document.querySelector('[data-screen="settings"]').textContent)), false);
});

test('header buttons: liquid glass from the Telegram reference (purple glass, light rim, white ink); other screens keep their glass', async () => {
  const g = await page.evaluate(() => {
    const out = {};
    for (const id of ['qr-code', 'search', 'edit-profile']) {
      const b = document.querySelector(`.profile-header [data-action="${id}"]`);
      const before = getComputedStyle(b, '::before');
      const after = getComputedStyle(b, '::after');
      out[id] = {
        ink: getComputedStyle(b).color,
        glassBg: before.backgroundColor,
        backdrop: before.backdropFilter,
        rim: after.boxShadow,
        radius: getComputedStyle(b).borderRadius,
        figmaLayers: getComputedStyle(b.querySelector('.glass__layer--base')).opacity,
      };
    }
    return out;
  });
  for (const [id, v] of Object.entries(g)) {
    assert.match(v.ink, /^(rgb\(255, 255, 255\)|color\(srgb 1 1 1\))$/, `${id}: white ink`);
    assert.equal(v.glassBg, 'rgba(255, 255, 255, 0.1)', `${id}: see-through purple glass`);
    assert.equal(v.backdrop, 'blur(8px)', `${id}: blurs the leaves behind`);
    assert.match(v.rim, /rgb\(164, 216, 251\).*inset/, `${id}: bright rim in the profile colour (blue by default)`);
    assert.equal(v.radius, '22px', `${id}: fully rounded`);
    assert.equal(v.figmaLayers, '0', `${id}: no white matte layer while expanded`);
  }
  // Collapsed bar: the glass turns back into the light Figma glass with dark ink.
  await page.evaluate(() => (document.querySelector('[data-screen="settings"] .screen__scroll').scrollTop = 400));
  await page.waitForTimeout(150);
  const collapsed = await page.evaluate(() => {
    const b = document.querySelector('.profile-header [data-action="edit-profile"]');
    return { ink: getComputedStyle(b).color, figma: getComputedStyle(b.querySelector('.glass__layer--base')).opacity, glass: getComputedStyle(b, '::before').opacity };
  });
  assert.equal(collapsed.figma, '1');
  assert.equal(collapsed.glass, '0');
  assert.doesNotMatch(collapsed.ink, /^(rgb\(255, 255, 255\)|color\(srgb 1 1 1\))$/, 'dark ink on the light bar');
  await page.evaluate(() => (document.querySelector('[data-screen="settings"] .screen__scroll').scrollTop = 0));
  await page.waitForTimeout(150);
});

test('labels start at the Figma text x', async () => {
  near((await rect('[data-row="add-account"] .settings-row__title')).x, 90, 'plain label x');
  near((await rect('[data-row="change-profile-decoration"] .settings-row__title')).x, 90, 'new row label x');
  near((await rect('[data-row="saved-messages"] .settings-row__title')).x, 78, 'tile label x');
});

test('tab bar: four tabs, no search button, full width, equal tabs', async () => {
  const tabs = await page.$$eval('.tab-bar [role="tab"] .tab-bar__label', (n) => n.map((x) => x.textContent));
  assert.deepEqual(tabs, ['Contacts', 'Calls', 'Chats', 'Settings']);
  const search = await page.$$eval('.tab-bar button, .tab-bar ~ button, .screen > button', (n) =>
    n.filter((x) => /search/i.test(`${x.getAttribute('aria-label') ?? ''} ${x.textContent} ${x.className}`)).length,
  );
  assert.equal(search, 0, 'there must be no search button');

  assertRect(await rect('.tab-bar'), [25, 787, 352, 62], 'tab bar');
  const widths = await page.$$eval('.tab-bar [role="tab"]', (n) => n.map((x) => x.getBoundingClientRect().width));
  widths.forEach((w) => near(w, 88, 'tab width'));

  const selected = await page.$$eval('[role="tab"][aria-selected="true"]', (n) => n.map((x) => x.dataset.tab));
  assert.deepEqual(selected, ['settings']);
  assertRect(await rect('.tab-bar__highlight'), [25 + 3 * 88 + 5, 790, 78, 56], 'selected highlight');
});

/** Scrolls the list and waits for the header to update (it follows in the next frame). */
async function scrollTo(y) {
  await page.evaluate((v) => (document.querySelector('.screen__scroll').scrollTop = v), y);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

test('header collapses smoothly into the bar and comes back', async () => {
  const buttons = ['.profile-header__qr', '.profile-header__search', '.profile-header__edit'];
  const expanded = await Promise.all(buttons.map(rect));
  const nameCenter = async () => {
    const r = await rect('.profile-header__name');
    return { y: r.y + r.height / 2, h: r.height, x: r.x + r.width / 2, right: r.x + r.width, left: r.x };
  };
  const start = await nameCenter();

  // Small steps: the name moves and shrinks continuously, no jumps.
  let previous = start;
  for (let y = 4; y <= 156; y += 4) {
    await scrollTo(y);
    const now = await nameCenter();
    assert.ok(previous.y - now.y <= 4.6 && now.y <= previous.y + 0.01, `name moves steadily at ${y}`);
    assert.ok(now.h <= previous.h + 0.01, `name never grows while collapsing at ${y}`);
    previous = now;
  }

  // Collapsed: buttons unchanged, compact title centred on them, not touching them.
  await scrollTo(156);
  const collapsed = await Promise.all(buttons.map(rect));
  collapsed.forEach((r, i) => assertRect(r, [expanded[i].x, expanded[i].y, expanded[i].width, expanded[i].height], buttons[i]));
  const title = await nameCenter();
  near(title.y, 84, 'title centred on the buttons', 1);
  near(title.x, 201, 'title centred on the screen', 1);
  assert.ok(title.left > 60 && title.right < 278, 'title does not overlap QR or Search');
  const color = await page.evaluate(() => getComputedStyle(document.querySelector('.profile-header__name')).color);
  assert.match(color, /^(rgb\(0, 0, 0\)|color\(srgb 0 0 0\))$/, 'title is black');
  const clickable = await page.evaluate(() => {
    const s = document.querySelector('.device__screen').getBoundingClientRect();
    return ['.profile-header__qr', '.profile-header__search', '.profile-header__edit'].every((sel) => {
      const b = document.querySelector(sel).getBoundingClientRect();
      return document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2)?.closest(sel) && s;
    });
  });
  assert.ok(clickable, 'buttons stay on top and clickable');

  // Back to the top: original look restored.
  await scrollTo(0);
  const back = await nameCenter();
  near(back.y, start.y, 'name y restored', 0.01);
  near(back.h, start.h, 'name size restored', 0.01);
  assertRect(await rect('[data-component="avatar"]'), [149, 90, 104, 104], 'avatar restored');
});

test('disappearing elements fade smoothly with the scroll and come back', async () => {
  const read = () =>
    page.evaluate(() => {
      const css = (sel) => getComputedStyle(document.querySelector(sel));
      const leaves = [...document.querySelectorAll('.pattern-leaf')];
      return {
        leaves: leaves.length,
        leafOpacity: Math.max(...leaves.map((l) => Number(getComputedStyle(l).opacity))),
        avatarOpacity: Number(css('.avatar').opacity),
        avatarFilter: css('.avatar').filter,
        phoneOpacity: Number(css('.profile-header__phone').opacity),
        bridgeOpacity: Number(css('.profile-header__goo').opacity),
        hidden: ['.avatar', '.profile-header__phone', '.profile-header__pattern', '.pattern-leaf'].some(
          (sel) => getComputedStyle(document.querySelector(sel)).display === 'none',
        ),
      };
    });

  await scrollTo(0);
  const start = await read();
  assert.equal(start.leaves, 18, 'all 18 leaves take part');
  assert.ok(start.leafOpacity > 0.7, 'leaves visible at the start');
  assert.equal(start.avatarOpacity, 1);
  assert.equal(start.phoneOpacity, 1);
  assert.equal(start.bridgeOpacity, 0);
  assert.equal(start.avatarFilter, 'blur(0px) brightness(1)');

  let prev = start;
  for (let y = 5; y <= 156; y += 5) {
    await scrollTo(y);
    const now = await read();
    assert.equal(now.hidden, false, `nothing is switched off with display:none (at ${y})`);
    assert.ok(now.leafOpacity <= prev.leafOpacity + 1e-6, `leaves only fade while collapsing (at ${y})`);
    assert.ok(now.phoneOpacity <= prev.phoneOpacity + 1e-6, `phone only fades while collapsing (at ${y})`);
    assert.ok(prev.phoneOpacity - now.phoneOpacity < 0.06, `phone fades gradually (at ${y})`);
    prev = now;
  }
  const end = await read();
  assert.equal(end.leafOpacity, 0, 'leaves gone');
  assert.equal(end.avatarOpacity, 0, 'avatar absorbed');
  assert.equal(end.phoneOpacity, 0, 'phone gone');
  assert.equal(end.bridgeOpacity, 0, 'bridge gone');

  await scrollTo(0);
  assert.deepEqual(await read(), start, 'scrolling back restores everything');
});

test('leaf pattern matches the reference layout', async () => {
  await scrollTo(0);
  // Centres measured on the reference screenshot (Figma positions + two copies at the sides).
  const expected = [
    [198.37, 70.58], [262.37, 180.58], [133.37, 180.58], [146.37, 232.58], [133.31, 106.57], [94.31, 144.57],
    [146.28, 55.56], [83.26, 79.55], [84.31, 210.57], [198.28, 218.56], [250.28, 233.56], [312.28, 209.56],
    [300.28, 144.56], [312.28, 78.56], [249.28, 56.56], [262.26, 107.55], [36.4, 144.0], [359.1, 144.6],
  ];
  const leaves = await page.$$eval('.pattern-leaf', (nodes) => {
    const s = document.querySelector('.device__screen').getBoundingClientRect();
    return nodes.map((n) => {
      const r = n.getBoundingClientRect();
      return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2, o: Number(getComputedStyle(n).opacity) };
    });
  });
  assert.equal(leaves.length, expected.length);
  expected.forEach(([x, y], i) => {
    near(leaves[i].x, x, `leaf ${i} x`, 0.6);
    near(leaves[i].y, y, `leaf ${i} y`, 0.6);
  });
  const clipped = await page.$eval('.profile-header__pattern svg > g', (g) => g.hasAttribute('clip-path'));
  assert.equal(clipped, false, 'no hard ellipse clip');
  assert.ok(leaves[4].o > leaves[16].o, 'leaves near the avatar are darker than the outer ones');
});

test('Change Profile Decoration: a normal row that opens Your Color; back returns to Settings', async () => {
  const detail = await page.evaluate(
    () =>
      new Promise((resolve) => {
        document.querySelector('.screen').addEventListener('prototype:action', (e) => resolve(e.detail), { once: true });
        document.querySelector('[data-row="change-profile-decoration"]').click();
      }),
  );
  assert.deepEqual(detail, { type: 'row', id: 'change-profile-decoration' });
  const classes = await page.$eval('[data-row="change-profile-decoration"]', (n) => n.className);
  const neighbour = await page.$eval('[data-row="change-profile-photo"]', (n) => n.className);
  assert.equal(classes, neighbour, 'same style as the neighbouring row');
  await page.waitForTimeout(450);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'your-color');
  await page.click('.screen--your-color .your-color__back');
  await page.waitForTimeout(450);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.activeScreen), 'settings');
  assert.equal(await page.$$eval('.screen--your-color', (n) => n.length), 0);
});

test('prototype code uses only the approved release builds of the decorations', () => {
  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
  for (const file of walk(join(root, 'src')).filter((f) => f.endsWith('.ts'))) {
    const source = readFileSync(file, 'utf8');
    for (const [, spec] of source.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
      if (!/(decorations|releases)\//.test(spec)) continue;
      assert.match(
        spec,
        /releases\/((ghost-orbit|halloween-pumpkin|paper-plane-orbit|christmas-lights)\/1\.0\.0|cat-ears\/1\.1\.0)\/dist\/index\.js$/,
        `${file}: only the approved release builds may be imported (Cat Ears: 1.1.0) (got ${spec})`,
      );
    }
  }
});
