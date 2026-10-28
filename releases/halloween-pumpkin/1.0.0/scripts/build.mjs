// Build script of a standalone decoration package (no demo page).
//   node scripts/build.mjs → dist/index.js, dist/index.d.ts, dist/types/**
// The decoration id comes from "avatarDecoration" in package.json.
import * as esbuild from 'esbuild';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const id = pkg.avatarDecoration;
const dist = join(root, 'dist');
mkdirSync(dist, { recursive: true });

// 1. original SVG text → assets/sources.generated.ts (byte for byte)
execFileSync(process.execPath, [join(root, 'scripts/embed-assets.mjs'), id], { stdio: 'inherit' });

// 2. the module
await esbuild.build({
  entryPoints: [join(root, `src/decorations/${id}/index.ts`)],
  outfile: join(dist, 'index.js'),
  bundle: true,
  format: 'esm',
  target: 'es2020',
  minify: true,
  legalComments: 'none',
  logLevel: 'warning',
});

// 3. types, with explicit .js endings (work with "bundler" and "nodenext")
const typesDir = join(dist, 'types');
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
writeFileSync(join(dist, 'index.d.ts'), `export * from './types/decorations/${id}/index.js';\n`);

console.log(`built ${id} ${pkg.version} → dist/index.js, dist/index.d.ts`);
