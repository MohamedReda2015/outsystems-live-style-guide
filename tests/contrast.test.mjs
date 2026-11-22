import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run } from './helpers.mjs';

const c = (...args) => run('contrast.mjs', [...args, '--json']);

test('Classic neutral-7 on white passes AA (4.95:1)', () => {
  const r = c('neutral-7', 'white');
  assert.equal(r.code, 0);
  assert.equal(r.json.ratio, 4.95);
});

test('White on Classic warning fails (2.2:1) with exit 1', () => {
  const r = c('#ffffff', 'warning');
  assert.equal(r.code, 1);
  assert.equal(r.json.ratio, 2.2);
});

test('3.0 palette: --color-success as text fails, --token-text-success passes', () => {
  assert.equal(c('--osui', '3', 'success', 'white').json.ratio, 2.74);
  assert.equal(c('--osui', '3', 'token-text-success', 'white').code, 0);
});

test('var(--token-*, fallback) resolves through the token set or its fallback', () => {
  assert.equal(c('--osui', '3', 'var(--token-text-danger, #d2002b)', 'token-bg-danger-subtle-default').json.ratio, 5);
  assert.equal(c('var(--token-unknown, #000000)', 'white').json.ratio, 21);
});

test('--suggest lists text tokens for a background', () => {
  const r = c('--osui', '3', '--suggest', 'warning');
  assert.ok(r.json.tokens.some((t) => t.token === 'text'));
  assert.ok(r.json.tokens.every((t) => t.ratio >= 4.5));
});

test('--audit covers the whole palette', () => {
  const r = c('--audit');
  assert.ok(r.json.length > 90);
});

test('Unknown color → exit 2', () => {
  assert.equal(run('contrast.mjs', ['not-a-color', 'white']).code, 2);
});
