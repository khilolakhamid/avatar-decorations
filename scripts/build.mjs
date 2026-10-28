// Build script (esbuild + TypeScript).
//   node scripts/build.mjs          → embeds SVGs, then builds
//                                      dist/halloween-pumpkin/index.js   (the decoration alone, ES module)
//                                      dist/halloween-pumpkin/index.d.ts (types)
//                                      dist/demo.html                    (Halloween Pumpkin demo page)
//                                      dist/ghost-orbit/index.js         (Ghost Orbit, the decoration alone)
//                                      dist/ghost-orbit-demo.html        (Ghost Orbit demo page)
//   node scripts/build.mjs --serve  → same, rebuilds on change and serves the demo at http://localhost:5173
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const serve = process.argv.includes('--serve');
const libDir = join(root, 'dist/halloween-pumpkin');
mkdirSync(libDir, { recursive: true });

const common = {
  bundle: true,
  // .jpg is only used by the demo (the reference image); the decoration needs no loaders
  loader: { '.jpg': 'dataurl' },
  target: 'es2020',
  logLevel: 'warning',
  legalComments: 'none',
};

/** Copies the original .svg text into assets/sources.generated.ts. */
function embedAssets() {
  execFileSync(process.execPath, [join(root, 'scripts/embed-assets.mjs')], { stdio: 'inherit' });
}

/** Decoration only — what another project would copy or import. */
async function buildLibrary(id = 'halloween-pumpkin') {
  await esbuild.build({
    ...common,
    entryPoints: [join(root, `src/decorations/${id}/index.ts`)],
    outfile: join(root, `dist/${id}/index.js`),
    format: 'esm',
    minify: true,
  });
}

/**
 * Type declarations. tsc writes them under dist/halloween-pumpkin/types/;
 * relative imports get explicit `.js` endings so the types resolve in every
 * TypeScript setup (moduleResolution "bundler" and the strict "nodenext").
 */
function buildTypes() {
  const typesDir = join(libDir, 'types');
  rmSync(typesDir, { recursive: true, force: true });
  const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');
  execFileSync(process.execPath, [tsc, '-p', join(root, 'tsconfig.types.json')], { stdio: 'inherit' });
  const walk = (dir) =>
    readdirSync(dir).flatMap((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : [join(dir, f)]));
  for (const file of walk(typesDir).filter((f) => f.endsWith('.d.ts'))) {
    const fixed = readFileSync(file, 'utf8').replace(/(from\s+|import\()(['"])(\.{1,2}\/[^'"]+)\2/g, (m, pre, q, spec) => {
      const target = resolve(dirname(file), spec);
      if (existsSync(`${target}.d.ts`)) return `${pre}${q}${spec}.js${q}`;
      if (existsSync(join(target, 'index.d.ts'))) return `${pre}${q}${spec}/index.js${q}`;
      return m;
    });
    writeFileSync(file, fixed);
  }
  writeFileSync(
    join(libDir, 'index.d.ts'),
    "// Types for index.js — the Halloween Pumpkin decoration.\nexport * from './types/decorations/halloween-pumpkin/index.js';\n",
  );
}

/** Demo page: template + bundled script inlined into ONE html file. */
async function buildDemo(dir = 'src/demo', out = 'dist/demo.html') {
  const result = await esbuild.build({
    ...common,
    entryPoints: [join(root, dir, 'main.ts')],
    format: 'iife',
    minify: true,
    write: false,
  });
  const js = result.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const template = readFileSync(join(root, dir, 'template.html'), 'utf8');
  writeFileSync(join(root, out), `${template}\n<script>${js}</script>\n`);
}

async function buildAll({ types = true } = {}) {
  const t = Date.now();
  embedAssets();
  await Promise.all([
    buildLibrary('halloween-pumpkin'),
    buildDemo(),
    buildLibrary('ghost-orbit'),
    buildDemo('src/demo/ghost-orbit', 'dist/ghost-orbit-demo.html'),
  ]);
  if (types) buildTypes();
  console.log(
    `built in ${Date.now() - t} ms → dist/halloween-pumpkin/index.js${types ? ', index.d.ts' : ''}, dist/demo.html, dist/ghost-orbit/index.js, dist/ghost-orbit-demo.html`,
  );
}

await buildAll();

if (serve) {
  const { watch } = await import('node:fs');
  let timer;
  watch(join(root, 'src'), { recursive: true }, (_, file) => {
    if (file && file.endsWith('sources.generated.ts')) return; // written by the build itself
    clearTimeout(timer);
    timer = setTimeout(() => buildAll({ types: false }).catch((e) => console.error(e.message)), 100);
  });
  createServer((req, res) => {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    const page = req.url?.startsWith('/ghost-orbit') ? 'dist/ghost-orbit-demo.html' : 'dist/demo.html';
    // the template has no <html>/<head>; browsers handle that, but give a proper doctype locally
    res.end(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${readFileSync(join(root, page), 'utf8')}`);
  }).listen(5173, () => console.log('Demo: http://localhost:5173 (Halloween Pumpkin), http://localhost:5173/ghost-orbit'));
}
