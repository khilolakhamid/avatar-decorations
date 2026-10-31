// Build of the Telegram iOS prototype (separate from the library build in /scripts).
//   node scripts/build.mjs          → dist/index.html, dist/main.js, dist/main.css, dist/assets/*
//   node scripts/build.mjs --serve  → same, rebuilds on change, serves http://localhost:5180
// dist/index.html also works when opened directly from disk (no server needed).
import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const dist = join(root, 'dist');
const serve = process.argv.includes('--serve');
const port = Number(process.env.PORT ?? 5180);

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
copyFileSync(join(root, 'src/index.html'), join(dist, 'index.html'));

const options = {
  entryPoints: { main: join(root, 'src/main.ts') },
  outdir: dist,
  bundle: true,
  // IIFE (not an ES module) so the page also runs from file://
  format: 'iife',
  target: ['es2020', 'safari16'],
  loader: { '.svg': 'text', '.png': 'file' },
  assetNames: 'assets/[name]-[hash]',
  sourcemap: serve,
  minify: !serve,
  logLevel: 'info',
};

if (serve) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { hosts } = await ctx.serve({ servedir: dist, port, host: '0.0.0.0' });
  console.log(`Prototype: http://localhost:${port}  (also on your network: ${hosts.join(', ')})`);
} else {
  await esbuild.build(options);
  await buildStandalone();
}

/**
 * dist/telegram-ios-settings.html — the same prototype as ONE file
 * (script, styles and images inlined) to send around or open from anywhere.
 */
async function buildStandalone() {
  const result = await esbuild.build({
    ...options,
    loader: { '.svg': 'text', '.png': 'dataurl' },
    write: false,
    logLevel: 'warning',
  });
  const pick = (ext) => result.outputFiles.find((f) => f.path.endsWith(ext)).text;
  const html = readFileSync(join(root, 'src/index.html'), 'utf8')
    .replace('<link rel="stylesheet" href="main.css" />', () => `<style>${pick('.css')}</style>`)
    .replace('<script src="main.js" defer></script>', () => `<script>${pick('.js').replace(/<\/script/gi, '<\\/script')}</script>`);
  writeFileSync(join(dist, 'telegram-ios-settings.html'), html);
  console.log('  dist/telegram-ios-settings.html (single file)');
}
