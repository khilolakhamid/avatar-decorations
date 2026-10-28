// Freezes an approved decoration as a standalone package and zips it.
//   node scripts/package-release.mjs halloween-pumpkin
//
// 1. builds and tests the whole project (stops on any failure);
// 2. copies the decoration + the shared code it uses into
//    releases/<id>/<version>/ (never overwrites an existing version);
// 3. builds and tests the copy on its own;
// 4. writes releases/<id>-<version>.zip.
// Demo page, reference images and the avatar placeholder are never copied.
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const id = process.argv[2];
if (!id) throw new Error('usage: node scripts/package-release.mjs <decoration-id>');
const run = (cwd, script, ...args) =>
  execFileSync(process.execPath, [join(cwd, script), ...args], { cwd, stdio: 'inherit' });

// read version + names from the decoration's own metadata
const indexTs = readFileSync(join(root, `src/decorations/${id}/index.ts`), 'utf8');
const version = indexTs.match(/version:\s*'([^']+)'/)?.[1];
const name = indexTs.match(/name:\s*'([^']+)'/)?.[1];
if (!version) throw new Error(`no version in src/decorations/${id}/index.ts`);

const out = join(root, 'releases', id, version);
if (existsSync(out)) throw new Error(`${out} already exists — an approved version is never overwritten`);

// 1. whole project must be green
run(root, 'scripts/build.mjs');
run(root, 'scripts/test.mjs');

// 2. copy
mkdirSync(out, { recursive: true });
const copy = (from, to = from) => cpSync(join(root, from), join(out, to), { recursive: true });
copy(`src/decorations/${id}`);
copy('src/shared');
copy(`src/decorations/${id}/README.md`, 'README.md');
copy(`src/decorations/${id}/STATUS.md`, 'STATUS.md');
copy('scripts/release/build.mjs', 'scripts/build.mjs');
copy('scripts/embed-assets.mjs', 'scripts/embed-assets.mjs');
copy('scripts/test.mjs', 'scripts/test.mjs');
copy(`tests/${id}.test.ts`, `tests/${id}.test.ts`);

const rootPkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const pkg = {
  name: `@avatar-decorations/${id}`,
  version,
  description: `${name} — animated avatar decoration (web component). TGS: see STATUS.md.`,
  private: true,
  type: 'module',
  avatarDecoration: id,
  main: './dist/index.js',
  module: './dist/index.js',
  types: './dist/index.d.ts',
  exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' } },
  sideEffects: false,
  files: ['dist', 'src', 'README.md', 'STATUS.md'],
  scripts: { build: 'node scripts/build.mjs', test: 'node scripts/test.mjs', typecheck: 'tsc --noEmit' },
  devDependencies: rootPkg.devDependencies,
  engines: { node: '>=18' },
};
writeFileSync(join(out, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
writeFileSync(
  join(out, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020', module: 'ESNext', moduleResolution: 'Bundler', lib: ['ES2020', 'DOM', 'DOM.Iterable'],
        strict: true, noEmit: true, isolatedModules: true, skipLibCheck: true, types: [],
      },
      include: ['src'],
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(
  join(out, 'tsconfig.types.json'),
  JSON.stringify(
    {
      extends: './tsconfig.json',
      compilerOptions: { noEmit: false, declaration: true, emitDeclarationOnly: true, rootDir: 'src', outDir: 'dist/types' },
      include: [`src/decorations/${id}/index.ts`],
    },
    null,
    2,
  ) + '\n',
);
writeFileSync(join(out, '.gitignore'), 'node_modules/\n.test-build/\n');

// 3. build + test the copy on its own (dev tools borrowed for this run only)
const nm = join(out, 'node_modules');
symlinkSync(join(root, 'node_modules'), nm);
try {
  run(out, 'scripts/build.mjs');
  run(out, 'scripts/test.mjs');
} finally {
  rmSync(nm, { force: true });
}

// 4. zip
// the archive holds one folder named after the decoration
const zip = join(root, 'releases', `${id}-${version}.zip`);
const staging = join(root, '.release-staging');
rmSync(zip, { force: true });
rmSync(staging, { recursive: true, force: true });
cpSync(out, join(staging, id), { recursive: true });
execFileSync('zip', ['-rqX', zip, id], { cwd: staging, stdio: 'inherit' });
rmSync(staging, { recursive: true, force: true });
console.log(`released ${id} ${version} → releases/${id}/${version}/`);
