/**
 * Path data utilities for shape morphing.
 *
 * A morph interpolates the numbers of two paths that have exactly the same
 * command sequence (same number of points) — this is also the rule for
 * animated shapes in Lottie/TGS.
 */

export interface PathData {
  /** Command letters in order, e.g. ['M','C','C','L','Z']. */
  commands: string[];
  /** All numbers, flattened, in order. */
  values: number[];
}

const ARG_COUNT: Record<string, number> = { M: 2, L: 2, C: 6, Z: 0, H: 1, V: 1, Q: 4, S: 4, T: 2 };

/** Parses absolute path data (as exported by Figma: M, L, C, H, V, Z).
 * H and V are converted to L, so every point is a full (x, y) pair. */
export function parsePath(d: string): PathData {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  const commands: string[] = [];
  const values: number[] = [];
  let i = 0;
  // current point and subpath start, to turn H/V into plain L segments
  let cx = 0, cy = 0, sx = 0, sy = 0;
  while (i < tokens.length) {
    const cmd = tokens[i++];
    if (!/[a-zA-Z]/.test(cmd)) throw new Error(`parsePath: expected a command, got "${cmd}"`);
    if (cmd !== cmd.toUpperCase()) throw new Error(`parsePath: relative command "${cmd}" not supported`);
    const n = ARG_COUNT[cmd];
    if (n === undefined) throw new Error(`parsePath: unsupported command "${cmd}"`);
    // a command may repeat its arguments without repeating the letter
    do {
      const args: number[] = [];
      for (let k = 0; k < n; k++) args.push(Number(tokens[i++]));
      if (cmd === 'H') {
        commands.push('L');
        values.push(args[0], cy);
        cx = args[0];
      } else if (cmd === 'V') {
        commands.push('L');
        values.push(cx, args[0]);
        cy = args[0];
      } else {
        commands.push(cmd);
        values.push(...args);
        if (cmd === 'Z') {
          cx = sx;
          cy = sy;
        } else {
          cx = args[n - 2];
          cy = args[n - 1];
          if (cmd === 'M') {
            sx = cx;
            sy = cy;
          }
        }
      }
    } while (n > 0 && i < tokens.length && !/[a-zA-Z]/.test(tokens[i]));
  }
  return { commands, values };
}

export function serializePath(p: PathData, digits = 3): string {
  const f = 10 ** digits;
  let out = '';
  let vi = 0;
  for (const cmd of p.commands) {
    out += cmd;
    const n = ARG_COUNT[cmd];
    for (let k = 0; k < n; k++) {
      const v = Math.round(p.values[vi++] * f) / f;
      out += (k === 0 ? '' : ' ') + v;
    }
  }
  return out;
}

export function sameStructure(a: PathData, b: PathData): boolean {
  return a.commands.length === b.commands.length && a.commands.every((c, i) => c === b.commands[i]);
}

/** Linear interpolation of two structurally identical paths. */
export function lerpPath(a: PathData, b: PathData, t: number): PathData {
  return { commands: a.commands, values: a.values.map((v, i) => v + (b.values[i] - v) * t) };
}

/**
 * Applies a function to every (x, y) pair. H/V are not supported here
 * (the source shapes we morph do not use them).
 */
export function mapPoints(p: PathData, fn: (x: number, y: number) => [number, number]): PathData {
  const values = p.values.slice();
  let vi = 0;
  for (const cmd of p.commands) {
    if (cmd === 'H' || cmd === 'V') throw new Error('mapPoints: H/V not supported');
    const n = ARG_COUNT[cmd];
    for (let k = 0; k < n; k += 2) {
      const [x, y] = fn(values[vi + k], values[vi + k + 1]);
      values[vi + k] = x;
      values[vi + k + 1] = y;
    }
    vi += n;
  }
  return { commands: p.commands, values };
}

/** All (x, y) pairs of a path (control points included). */
export function points(p: PathData): [number, number][] {
  const out: [number, number][] = [];
  mapPoints(p, (x, y) => {
    out.push([x, y]);
    return [x, y];
  });
  return out;
}
