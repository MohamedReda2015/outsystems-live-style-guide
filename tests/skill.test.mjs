// Structural checks that keep the skill publishable and internally consistent.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { ROOT, p } from './helpers.mjs';

const read = (f) => readFileSync(p(f), 'utf8');
const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  if (['node_modules', '.git', 'dist'].includes(e.name)) return [];
  const full = join(dir, e.name);
  return e.isDirectory() ? walk(full) : [full];
});
const allFiles = walk(ROOT).map((f) => relative(ROOT, f).replace(/\\/g, '/'));
const textFiles = allFiles.filter((f) => /\.(md|mjs|mdc|css|json|yml|yaml|html|sh)$/.test(f));

const skill = read('SKILL.md');
const frontmatter = skill.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';

test('SKILL.md frontmatter: name, description limits, license, version', () => {
  assert.match(frontmatter, /^name: outsystems-live-style-guide$/m);
  const desc = frontmatter.match(/^description: (.*)$/m)?.[1] ?? '';
  assert.ok(desc.length > 100 && desc.length <= 1024, `description length ${desc.length}`);
  assert.ok(!/[<>]/.test(desc), 'description must not contain angle brackets');
  assert.match(frontmatter, /^license: MIT$/m);
  const version = frontmatter.match(/^\s+version: (\S+)$/m)?.[1];
  assert.equal(version, JSON.parse(read('package.json')).version, 'SKILL.md and package.json versions differ');
  assert.ok(read('CHANGELOG.md').includes(`## [${version}]`), 'CHANGELOG has no entry for the current version');
});

test('SKILL.md stays lean (< 300 lines)', () => {
  assert.ok(skill.split('\n').length < 300);
});

test('Every path referenced in SKILL.md and README.md exists', () => {
  for (const doc of ['SKILL.md', 'README.md', 'CONTRIBUTING.md']) {
    const refs = [...read(doc).matchAll(/`((?:references|templates|scripts|adapters|docs|tests)\/[\w.\-/]+)`/g)].map((m) => m[1]);
    for (const r of refs) assert.ok(existsSync(p(r)), `${doc} references missing ${r}`);
    const links = [...read(doc).matchAll(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)].map((m) => m[1].split('#')[0]);
    for (const l of links) assert.ok(existsSync(p(l)), `${doc} links to missing ${l}`);
  }
});

test('Every cited rule ID is defined in the checklist or lessons', () => {
  const defined = new Set([...(read('references/review-checklist.md') + read('references/lessons-learned.md'))
    .matchAll(/\|\s*([A-Z0-9]{2,4}-\d{2})\s*\||\*\*([A-Z]{3}-\d{2})/g)].map((m) => m[1] || m[2]));
  assert.ok(defined.size > 100, `only ${defined.size} IDs defined`);
  for (const f of textFiles.filter((x) => !x.startsWith('evals/') && !x.startsWith('tests/'))) {
    for (const m of read(f).matchAll(/\b((?:TOK|THM|LAY|RSP|A11Y|CMP|FRM|LST|FDB|TXT|PRF|LES|GOV)-\d{2})\b/g)) {
      assert.ok(defined.has(m[1]), `${f} cites undefined ${m[1]}`);
    }
  }
});

test('Token files are valid and colors are hex', () => {
  for (const f of ['scripts/tokens.json', 'scripts/tokens-osui3.json']) {
    const t = JSON.parse(read(f));
    assert.ok(Object.keys(t.colors).length > 50, f);
    for (const [k, v] of Object.entries(t.colors)) assert.match(v, /^#[0-9a-fA-F]{6}$/, `${f} ${k}`);
    assert.ok(t.spaces && t.fontSizes && t.frameworkClasses?.length, f);
  }
  const v3 = JSON.parse(read('scripts/tokens-osui3.json'));
  assert.equal(v3.version, '3');
  assert.ok(Object.keys(v3.retired).length > 30);
});

test('Eval cases follow the claude plugin eval layout', () => {
  const cases = readdirSync(p('evals')).filter((d) => statSync(p('evals', d)).isDirectory());
  assert.ok(cases.length >= 4);
  for (const c of cases) {
    assert.ok(existsSync(p('evals', c, 'prompt.md')), `${c}/prompt.md`);
    const yaml = read(`evals/${c}/case.yaml`);
    assert.match(yaml, /^schema_version: "1\.1"$/m);
    assert.match(yaml, new RegExp(`^name: ${c}$`, 'm'));
    const graders = readdirSync(p('evals', c, 'graders'));
    assert.ok(graders.length > 0, `${c} has no graders`);
    for (const g of graders) assert.match(read(`evals/${c}/graders/${g}`), /^---\ntype: llm\n/);
    if (/scaffold_script/.test(yaml)) assert.ok(existsSync(p('evals', c, 'place-files.sh')));
  }
});

test('Copilot adapter mentions every always-on topic of core-rules', () => {
  const core = read('adapters/core-rules.md');
  const copilot = read('adapters/copilot-instructions.md');
  for (const topic of ['Step 0', 'EnableAccessibilityFeatures', 'SetDarkTheme', 'SetDeviceBreakpoints', '--osui 3']) {
    assert.ok(core.includes(topic), `core-rules lacks ${topic}`);
    assert.ok(copilot.includes(topic), `copilot-instructions lacks ${topic}`);
  }
});

test('No private or machine-specific data in the published files', () => {
  const forbidden = [/[A-Za-z]:\\Users\\/, /\/c\/Users\//, /AppData/, /@gmail\.com/, /scratchpad/i, /OneDrive/];
  for (const f of textFiles.filter((x) => !x.startsWith('tests/'))) {
    for (const re of forbidden) assert.ok(!re.test(read(f)), `${f} matches ${re}`);
  }
});

test('Repository files required for publication exist', () => {
  for (const f of ['LICENSE', 'README.md', 'CHANGELOG.md', 'CONTRIBUTING.md', 'THIRD_PARTY_NOTICES.md', '.gitignore', '.github/workflows/ci.yml']) {
    assert.ok(existsSync(p(f)), f);
  }
  assert.match(read('LICENSE'), /^MIT License/);
});
