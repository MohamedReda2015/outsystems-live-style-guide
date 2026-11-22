import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { run, ids, p } from './helpers.mjs';

const lint = (...args) => run('lint-ui-css.mjs', [...args, '--json']);

test('Classic: bad block fires every expected rule and exits 1', () => {
  const r = lint(p('scripts/examples/bad-block.css'));
  assert.equal(r.code, 1);
  for (const id of ['A11Y-05', 'A11Y-01', 'A11Y-02', 'THM-02', 'THM-03', 'THM-04', 'TOK-01', 'TOK-02', 'TOK-03', 'TOK-04', 'TOK-05', 'RSP-02', 'RSP-03', 'LES-03']) {
    assert.ok(ids(r).has(id), `expected ${id}`);
  }
  assert.equal(r.json.summary.blocker, 1);
});

test('Classic: good block has zero findings', () => {
  const r = lint(p('scripts/examples/good-block.css'));
  assert.equal(r.code, 0);
  assert.equal(r.json.findings.length, 0);
});

test('Inline styles in HTML are reported (THM-05) and their declarations linted', () => {
  const r = lint(p('scripts/examples/bad-screen.html'));
  assert.equal(r.code, 1);
  assert.ok(ids(r).has('THM-05'));
  assert.ok(ids(r).has('A11Y-02'));
});

test('Literal colors map to the exact token', () => {
  const r = lint(p('scripts/examples/bad-block.css'));
  const f = r.json.findings.find((x) => x.id === 'TOK-01' && /#fff\b/.test(x.message));
  assert.match(f.fix, /var\(--color-neutral-0\)/);
});

test('3.0: retired variables, bare tokens, neutral-0, RTL and radius 100% are reported', () => {
  const r = lint(p('scripts/examples/classic-to-osui3.css'), '--osui', '3', '--rtl');
  assert.equal(r.code, 1);
  for (const id of ['TOK-08', 'TOK-09', 'TOK-10', 'TXT-02', 'LES-18']) assert.ok(ids(r).has(id), `expected ${id}`);
  const retired = r.json.findings.filter((f) => f.id === 'TOK-08').map((f) => f.message.split(' ')[0]);
  for (const v of ['--shadow-s', '--border-size-s', '--font-size-h4', '--font-semi-bold', '--color-red-lightest']) {
    assert.ok(retired.includes(v), `expected ${v} reported as retired`);
  }
});

test('3.0: good block has zero findings', () => {
  const r = lint(p('scripts/examples/good-block-osui3.css'), '--osui', '3', '--rtl');
  assert.equal(r.code, 0);
  assert.equal(r.json.findings.length, 0);
});

test('Classic mode does not flag 3.0 retired names, but hints when 3.0 syntax is used', () => {
  const r = run('lint-ui-css.mjs', [p('scripts/examples/good-block-osui3.css')]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /Re-run with --osui 3/);
});

test('Theme starters are clean in their own modes', () => {
  assert.equal(lint(p('templates/theme-starter.css'), '--theme').json.findings.length, 0);
  assert.equal(lint(p('templates/theme-starter-osui3.css'), '--osui', '3', '--theme', '--rtl').json.findings.length, 0);
});

test('lint-ignore suppresses a finding on its line; --min-severity filters', () => {
  const dir = mkdtempSync(join(tmpdir(), 'osui-lint-'));
  try {
    const f = join(dir, 'x.css');
    writeFileSync(f, '.app-x { color: var(--color-neutral-9) !important; } /* lint-ignore THM-02: test */\n.app-y { margin: 13px; }\n');
    const r = lint(f);
    assert.ok(!ids(r).has('THM-02'));
    assert.ok(ids(r).has('TOK-03'));
    const onlyBlockers = lint(f, '--min-severity', 'blocker');
    assert.equal(onlyBlockers.json.findings.length, 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('A folder argument is scanned recursively', () => {
  const r = lint(p('scripts/examples'));
  assert.ok(r.json.summary.files >= 5);
});

test('No input → usage error (exit 2)', () => {
  const r = run('lint-ui-css.mjs', []);
  assert.equal(r.code, 2);
});
