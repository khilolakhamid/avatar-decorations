// Screenshot of the built prototype (run `npm run build` first).
//   node scripts/screenshot.mjs [scale]   → .screenshots/settings@<scale>x.png (screen only, 402 × 874 pt)
// Needs Playwright with Chromium (`npx playwright install chromium` once).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = new URL('..', import.meta.url).pathname;
const scale = Number(process.argv[2] ?? 3);
const outDir = join(root, '.screenshots');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 520, height: 960 }, deviceScaleFactor: scale });
await page.goto(`${pathToFileURL(join(root, 'dist/index.html')).href}?mode=frame`);
await page.evaluate(() => document.fonts.ready);
await page.waitForFunction(() => [...document.images].every((img) => img.complete));
const screen = page.locator('.device__screen');
const file = join(outDir, `settings@${scale}x.png`);
await screen.screenshot({ path: file });
await page.screenshot({ path: join(outDir, 'settings-frame.png') });
await browser.close();
console.log(file);
