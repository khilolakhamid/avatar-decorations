// Runs the automatic tests in tests/*.test.ts with Node's built-in test runner.
// No extra dependencies: esbuild (already a dev dependency) compiles the
// TypeScript tests into a temporary folder, then `node --test` runs them.
//   node scripts/test.mjs
import * as esbuild from 'esbuild';
import { spawnSync } from 'node:child_process';
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, '.test-build');
rmSync(out, { recursive: true, force: true });

const entries = readdirSync(join(root, 'tests'))
  .filter((f) => f.endsWith('.test.ts'))
  .map((f) => join(root, 'tests', f));

await esbuild.build({
  entryPoints: entries,
  outdir: out,
  outExtension: { '.js': '.mjs' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  logLevel: 'warning',
});

const files = readdirSync(out).map((f) => join(out, f));
const run = spawnSync(process.execPath, ['--test', ...files], {
  stdio: 'inherit',
  env: { ...process.env, PROJECT_ROOT: root },
});
rmSync(out, { recursive: true, force: true });
process.exit(run.status ?? 1);
