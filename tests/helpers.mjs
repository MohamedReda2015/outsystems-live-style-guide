import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const p = (...parts) => join(ROOT, ...parts);

/** Run one of the skill's scripts with Node; returns { code, stdout, stderr, json }. */
export function run(script, args = []) {
  const r = spawnSync(process.execPath, [p('scripts', script), ...args], { cwd: ROOT, encoding: 'utf8' });
  let json = null;
  try { json = JSON.parse(r.stdout); } catch { /* text output */ }
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, json };
}

export const ids = (result) => new Set((result.json?.findings || []).map((f) => f.id));
