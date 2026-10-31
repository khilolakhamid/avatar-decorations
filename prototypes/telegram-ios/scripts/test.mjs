// Builds the prototype, then runs tests/*.test.mjs with Node's test runner.
//   node scripts/test.mjs
import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;

const build = spawnSync(process.execPath, [join(root, 'scripts/build.mjs')], { stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);

const files = readdirSync(join(root, 'tests'))
  .filter((f) => f.endsWith('.test.mjs'))
  .map((f) => join(root, 'tests', f));
const run = spawnSync(process.execPath, ['--test', ...files], { stdio: 'inherit' });
process.exit(run.status ?? 1);
