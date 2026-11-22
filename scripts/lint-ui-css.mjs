#!/usr/bin/env node
/**
 * OutSystems UI token & accessibility linter for CSS (Node 16+, no dependencies).
 *
 * Usage:
 *   node lint-ui-css.mjs <file|folder> [more...] [--osui 3] [--theme] [--rtl] [--json] [--min-severity minor|major|blocker] [--tokens file]
 *
 *   --osui 3  check against OutSystems UI 3.0 (design-token theme): 3.0 token suggestions, retired
 *             variables (TOK-08), neutral-0 trap (TOK-10). Default: OutSystems UI Classic (2.x) rules.
 *   --rtl     the app has right-to-left locales: flag physical left/right properties (TXT-02).
 *   <file>    .css files are parsed as CSS. Other text files (.html, .xml, .txt, .json exports)
 *             are scanned for inline style="..." attributes (THM-05), whose declarations are linted too.
 *   <folder>  scanned recursively for .css / .html / .xml files (node_modules and dot-folders skipped).
 *   --theme   the files are THEME stylesheets: restyling framework classes (THM-03) and setting
 *             font-family (TOK-06) are allowed there.
 *   Suppress a finding on one line with a comment containing:  lint-ignore <RULE-ID>
 *
 * Rule IDs match references/review-checklist.md:
 *   TOK-01 literal color · TOK-02 literal font size · TOK-03 spacing · TOK-04 radius/border width
 *   TOK-05 literal shadow · TOK-06 font-family outside theme · THM-02 !important
 *   THM-03 framework class restyled outside theme · THM-04 generated id / internal class selector
 *   THM-05 inline style · RSP-02 pixel media query · RSP-03 fixed width > 320px
 *   A11Y-01 text contrast · A11Y-02 text < 12px · A11Y-05 focus outline removed · LES-03 List flex/grid script
 *   TOK-08 retired 3.0 variable · TOK-09 --token-* without fallback · TOK-10 neutral-0 used as white (3.0)
 *   LES-18 border-radius 100% · TXT-02 physical left/right (with --rtl)
 *
 * Exit code: 0 = no Blocker/Major findings, 1 = Blocker or Major found, 2 = bad input.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { loadTokens, normHex, parseRgbFunc, resolveColor, contrast, exactToken, nearestToken, colorVarFor, NAMED_COLORS } from './osui-tokens.mjs';

// ---------- CLI ----------
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const THEME = flag('--theme');
const JSON_OUT = flag('--json');
const RTL = flag('--rtl');
const SEV_RANK = { minor: 1, major: 2, blocker: 3 };
const MIN_SEV = SEV_RANK[(opt('--min-severity', 'minor') || 'minor').toLowerCase()] || 1;
const tokens = loadTokens(opt('--tokens'), opt('--osui', flag('--osui3') ? '3' : '2'));
const V3 = tokens.version === '3';
const inputs = argv.filter((a, i) => !a.startsWith('--') && !['--min-severity', '--tokens', '--osui'].includes(argv[i - 1]));
if (!inputs.length) {
  console.error('Usage: node lint-ui-css.mjs <file|folder> [...] [--osui 3] [--theme] [--rtl] [--json] [--min-severity minor|major|blocker]');
  process.exit(2);
}
const RETIRED = tokens.retired || {};
const RETIRED_PATTERNS = (tokens.retiredPatterns || []).map(([re, fix]) => [new RegExp(re), fix]);
const retiredFix = (name) => {
  if (RETIRED[name]) return RETIRED[name];
  for (const [re, fix] of RETIRED_PATTERNS) if (re.test(name)) return name.replace(re, fix);
  return null;
};
let sawV3Syntax = false;

// ---------- token lookups ----------
const SPACE_BY_PX = Object.fromEntries(Object.entries(tokens.spaces).map(([k, v]) => [v, k]));
const SPACE_VALUES = Object.values(tokens.spaces).filter((v) => v > 0);
const FONT_BY_PX = {};
for (const [k, v] of Object.entries(tokens.fontSizes)) if (!(v in FONT_BY_PX)) FONT_BY_PX[v] = k;
const FRAMEWORK = new Set(tokens.frameworkClasses);
const CONTEXT = new Set(tokens.contextClasses);
const UTIL_RE = tokens.utilityClassPatterns.map((p) => new RegExp(p));
const INTERNAL_RE = tokens.osInternalPatterns.map((p) => new RegExp(p));
const isFrameworkClass = (c) => FRAMEWORK.has(c) || UTIL_RE.some((r) => r.test(c));
const isContextClass = (c) => CONTEXT.has(c);
const fontRef = (k) => (tokens.fontSizeVars ? tokens.fontSizeVars[k] : `var(--font-size-${k})`);
const fontClass = (k) => (k.startsWith('h') ? `.heading${k.slice(1)}` : `.font-size-${k}`);

const COLOR_PROPS = /^(color|background|background-color|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|outline(-color)?|fill|stroke|text-decoration(-color)?|caret-color|column-rule(-color)?)$/;
const SPACING_PROPS = /^(margin|padding)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$|^(gap|row-gap|column-gap)$/;
const NAMED_RE = new RegExp(`(^|[\\s,(])(${Object.keys(NAMED_COLORS).join('|')})(?=$|[\\s,)!;])`, 'i');

// ---------- file collection ----------
const files = [];
const walk = (p) => {
  const st = statSync(p);
  if (st.isDirectory()) {
    for (const e of readdirSync(p)) {
      if (e === 'node_modules' || e.startsWith('.')) continue;
      walk(join(p, e));
    }
  } else if (/\.(css|html?|xml)$/i.test(p) || inputs.includes(p)) files.push(p);
};
for (const i of inputs) {
  try { walk(i); } catch { console.error(`Cannot read ${i}`); process.exit(2); }
}

// ---------- CSS parsing (flat rules with at-rule context) ----------
function lineIndex(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1);
  return (pos) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= pos) lo = mid; else hi = mid - 1; } return lo + 1; };
}

function parseCss(src) {
  // ignore markers per line, then blank out comments (keep newlines for line numbers)
  const ignores = {};
  src.split('\n').forEach((l, i) => { const m = l.match(/lint-ignore\s+([A-Z0-9-]+(?:[\s,]+[A-Z0-9-]+)*)/); if (m) ignores[i + 1] = m[1].split(/[\s,]+/); });
  const text = src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  const lineOf = lineIndex(text);
  const rules = [];
  const stack = []; // at-rule headers
  let buf = '', bufStart = 0, i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === '{') {
      const header = buf.trim();
      const headerLine = lineOf(bufStart + (buf.length - buf.trimStart().length));
      if (header.startsWith('@') && !/^@font-face|^@page/i.test(header)) {
        stack.push(header); buf = ''; bufStart = i + 1; i++; continue;
      }
      // rule body until matching close brace (no nesting in plain CSS)
      let depth = 1, j = i + 1;
      while (j < text.length && depth) { if (text[j] === '{') depth++; else if (text[j] === '}') depth--; j++; }
      const body = text.slice(i + 1, j - 1);
      rules.push({ selector: header, line: headerLine, context: [...stack], decls: parseDecls(body, i + 1, lineOf) });
      buf = ''; bufStart = j; i = j; continue;
    }
    if (ch === '}') { stack.pop(); buf = ''; bufStart = i + 1; i++; continue; }
    if (ch === ';' && !buf.includes('{')) { buf = ''; bufStart = i + 1; i++; continue; } // @import / @charset
    buf += ch; i++;
  }
  return { rules, ignores };
}

function parseDecls(body, offset, lineOf) {
  const decls = [];
  let depth = 0, start = 0;
  const push = (end) => {
    const raw = body.slice(start, end);
    const idx = raw.indexOf(':');
    if (idx > 0) {
      const prop = raw.slice(0, idx).trim().toLowerCase();
      let value = raw.slice(idx + 1).trim();
      const important = /!important\s*$/i.test(value);
      value = value.replace(/!important\s*$/i, '').trim();
      const lead = raw.length - raw.trimStart().length;
      if (prop) decls.push({ prop, value, important, line: lineOf(offset + start + lead) });
    }
    start = end + 1;
  };
  for (let k = 0; k < body.length; k++) {
    if (body[k] === '(') depth++; else if (body[k] === ')') depth--;
    else if (body[k] === ';' && depth === 0) push(k);
  }
  push(body.length);
  return decls;
}

// ---------- findings ----------
const findings = [];
let current = { file: '', ignores: {} };
function report(id, sev, line, selector, message, fix) {
  if ((current.ignores[line] || []).includes(id)) return;
  if (SEV_RANK[sev] < MIN_SEV) return;
  findings.push({ id, severity: sev, file: current.file, line, selector, message, fix });
}

const stripVars = (v) => v.replace(/var\([^()]*(\([^()]*\)[^()]*)*\)/g, ' ');
const pxValues = (v) => [...stripVars(v).matchAll(/(-?\d*\.?\d+)(px|rem|pt)\b/g)].map((m) => ({ raw: m[0], px: m[2] === 'rem' ? +m[1] * 16 : m[2] === 'pt' ? +m[1] * 4 / 3 : +m[1] }));
const nearestSpace = (px) => SPACE_VALUES.reduce((a, b) => (Math.abs(b - px) < Math.abs(a - px) ? b : a));

function colorLiterals(value) {
  const out = [];
  const v = stripVars(value);
  for (const m of v.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) { const h = normHex(m[0]); if (h) out.push({ raw: m[0], hex: h, alpha: 1 }); }
  for (const m of v.matchAll(/rgba?\([^)]*\)/gi)) { const p = parseRgbFunc(m[0]); if (p) out.push({ raw: m[0], hex: p.hex, alpha: p.alpha }); }
  for (const m of v.matchAll(/hsla?\([^)]*\)/gi)) out.push({ raw: m[0], hex: null, alpha: 1 });
  const n = v.match(NAMED_RE); if (n) out.push({ raw: n[2], hex: NAMED_COLORS[n[2].toLowerCase()], alpha: 1 });
  return out;
}

function colorFix(c) {
  if (!c.hex) return 'use a var(--color-*) token';
  const exact = exactToken(c.hex, tokens);
  if (exact && c.alpha === 1) return `use ${colorVarFor(exact, tokens)}`;
  const near = nearestToken(c.hex, tokens);
  return `use a token, nearest: ${colorVarFor(near.name, tokens)} ${near.hex}${c.alpha < 1 ? (V3 ? ' (for transparency use a subtle token, e.g. var(--token-bg-primary-subtle-default, …))' : ' (for transparency use a -lightest token or --color-primary-selected)') : ''}`;
}

function classesOf(compound) { return [...compound.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((m) => m[1]); }

function lintSelector(rule) {
  const sel = rule.selector;
  if (/(^|[\s>+~,(])#[\w-]+/.test(sel.replace(/\[[^\]]*\]/g, ''))) {
    report('THM-04', 'major', rule.line, sel, 'ID selector: OutSystems generates element ids (#b3-…, #wt…) and they change on publish', 'add a Style Class to the element and select that');
  }
  if (/\[id[*^$|~]?=/.test(sel)) report('THM-04', 'major', rule.line, sel, 'attribute selector on generated id', 'add a Style Class and select that');
  for (const part of sel.split(',')) {
    const cls = classesOf(part);
    const internal = cls.find((c) => INTERNAL_RE.some((r) => r.test(c)));
    if (internal) report('THM-04', THEME ? 'minor' : 'major', rule.line, part.trim(), `selector depends on Service Studio internal class .${internal}`, 'select your own Style Class instead (Traditional Web themes may need ThemeGrid_* on purpose)');
    if (!THEME && cls.length) {
      const fw = cls.filter((c) => isFrameworkClass(c) && !isContextClass(c));
      const custom = cls.filter((c) => !isFrameworkClass(c) && !isContextClass(c));
      if (fw.length && !custom.length) {
        report('THM-03', 'major', rule.line, part.trim(), `restyles OutSystems UI class .${fw[0]} outside the theme (affects every use in every consuming app)`, 'scope under your prefixed block class (.app-xxx .' + fw[0] + '), use a prefixed class, or move the override to the theme (--theme)');
      }
    }
  }
}

function lintRule(rule) {
  const inRoot = /^(:root|html|body)$/.test(rule.selector.trim()) || /^body\.[\w-]+$/.test(rule.selector.trim()) || /^:root\[/.test(rule.selector.trim());
  const keyframes = rule.context.some((c) => /^@(-\w+-)?keyframes/i.test(c));
  const fontFace = /^@font-face/i.test(rule.selector);
  const isFocus = /:focus/.test(rule.selector);
  const disabled = /disabled|placeholder|is--disabled/i.test(rule.selector);
  if (!fontFace && !keyframes) lintSelector(rule);

  let colorDecl = null, bgDecl = null, outlineRemoved = null, focusReplacement = false, displayFlexGrid = false;
  for (const d of rule.decls) {
    const { prop, value, line } = d;

    // --- variable references (checked on every declaration, custom properties included) ---
    for (const m of value.matchAll(/var\(\s*(--[\w-]+)\s*(,)?/g)) {
      const name = m[1], hasFallback = !!m[2];
      if (/^--(token|osui)-/.test(name)) sawV3Syntax = true;
      if (name.startsWith('--token-') && !hasFallback) {
        report('TOK-09', 'major', line, rule.selector, `var(${name}) has no fallback: OutSystems UI does not declare light --token-* values at :root, so this resolves only in dark mode (or never)`, `write var(${name}, <value>) or use the --color-*/--border-radius-* role instead`);
      }
      if (V3) {
        const fix = retiredFix(name);
        if (fix) report('TOK-08', 'major', line, rule.selector, `${name} is retired in OutSystems UI 3.0: the declaration is silently dropped`, `use ${fix}`);
      }
    }
    if (V3 && prop.startsWith('--') && retiredFix(prop)) {
      report('TOK-08', 'minor', line, rule.selector, `defines retired variable ${prop}: no OutSystems UI 3.0 rule reads it any more`, `override ${retiredFix(prop)} instead (only your own rules still read ${prop})`);
    }
    if (V3 && /^(color|background|background-color)$/.test(prop) && /var\(\s*--color-neutral-0\s*\)/.test(value)) {
      report('TOK-10', 'minor', line, rule.selector, '--color-neutral-0 is #f6f7fa in OutSystems UI 3.0 (not white) and flips in dark mode', prop === 'color' ? 'white text: var(--color-text-light) on primary/red/green/blue fills, var(--color-text-inverse) on other fills' : 'surfaces: var(--color-background-surface)');
    }

    if (prop.startsWith('--')) continue; // token definitions are allowed to hold literals
    if (d.important && !(THEME && prop.startsWith('--'))) report('THM-02', 'minor', line, rule.selector, `!important on ${prop}`, 'raise specificity with your own class instead; if unavoidable add a lint-ignore THM-02 comment explaining why');

    // colors
    if (COLOR_PROPS.test(prop) && !fontFace) {
      for (const c of colorLiterals(value)) report('TOK-01', 'major', line, rule.selector, `literal color ${c.raw} in ${prop}`, colorFix(c));
    }
    if (prop === 'color') colorDecl = d;
    if (prop === 'background-color' || prop === 'background') bgDecl = d;

    // font size
    if (prop === 'font-size' || prop === 'font') {
      const sizes = prop === 'font' ? pxValues(value.split('/')[0]) : pxValues(value);
      for (const s of sizes) {
        if (s.px < tokens.minFontSize) report('A11Y-02', 'major', line, rule.selector, `text size ${s.raw} is below ${tokens.minFontSize}px`, 'use var(--font-size-xs) (12px) or larger');
        const k = FONT_BY_PX[Math.round(s.px)];
        report('TOK-02', 'major', line, rule.selector, `literal font size ${s.raw}`, k ? `use ${fontRef(k)} or class ${fontClass(k)}` : `off the type scale: pick the nearest ${V3 ? 'var(--token-font-size-*, …)' : 'var(--font-size-*)'} or heading class`);
      }
    }
    if (prop === 'font-family' && !THEME && !/^(inherit|initial|unset|var\()/i.test(value)) {
      report('TOK-06', 'minor', line, rule.selector, 'font-family set outside the theme', 'set fonts once in the Global/app theme');
    }

    // spacing
    if (SPACING_PROPS.test(prop)) {
      for (const s of pxValues(value)) {
        const a = Math.abs(s.px);
        if (a <= 2) continue;
        const cls = /gap/.test(prop) ? (V3 ? `.gap-${SPACE_BY_PX[a] ?? '*'} class` : '.gutter-* on Columns') : `.${prop.split('-')[0]}-${SPACE_BY_PX[a] ?? '*'} class`;
        if (SPACE_BY_PX[a] !== undefined) report('TOK-03', 'minor', line, rule.selector, `literal spacing ${s.raw} in ${prop}`, `use var(--space-${SPACE_BY_PX[a]}) or the ${cls}`);
        else report('TOK-03', 'major', line, rule.selector, `off-scale spacing ${s.raw} in ${prop}`, `use the 8px scale: nearest var(--space-${SPACE_BY_PX[nearestSpace(a)]}) (${nearestSpace(a)}px)`);
      }
    }

    // radius and border width
    if (prop === 'border-radius' || /^border-(top|bottom)-(left|right)-radius$/.test(prop)) {
      if (/^100%$/.test(value)) {
        report('LES-18', 'minor', line, rule.selector, 'border-radius: 100% draws an ellipse as soon as the element is not square (e.g. after a line-height change)', 'use 50% for a circle on a square element, or var(--border-radius-rounded) for a pill');
      } else if (!/^var\(/.test(value) && !/^(0|50%|inherit|initial|unset)$/.test(value)) {
        const px = pxValues(value)[0]?.px;
        const fix = /%/.test(value) ? (V3 ? '50% (--border-radius-circle is retired)' : 'var(--border-radius-circle)') : px >= 50 ? 'var(--border-radius-rounded)' : V3 ? 'var(--border-radius-soft) (8px) or a tier slot var(--border-radius-2xs…2xl)' : 'var(--border-radius-soft)';
        report('TOK-04', 'minor', line, rule.selector, `literal radius ${value}`, `use ${fix}`);
      }
    }
    if (/^border(-(top|right|bottom|left))?(-width)?$/.test(prop) && !/^(none|0|inherit|initial|unset)$/.test(value)) {
      for (const s of pxValues(value)) {
        const n = Math.round(s.px), name = { 1: 's', 2: 'm', 3: 'l' }[n];
        const fix = V3 ? (tokens.borderSizeVars?.[n] ? `use ${tokens.borderSizeVars[n]}` : 'use var(--token-border-size-025|050|075, …)') : name ? `use var(--border-size-${name})` : 'use var(--border-size-s|m|l)';
        report('TOK-04', 'minor', line, rule.selector, `literal border width ${s.raw}`, fix);
      }
    }

    // shadow
    if (prop === 'box-shadow' && !/^(none|inherit|initial|unset)$/.test(value) && !(isFocus) && stripVars(value).trim().length > 0 && /\d/.test(stripVars(value))) {
      const blur = pxValues(value)[2]?.px ?? pxValues(value)[1]?.px ?? 4;
      const name = Object.entries(tokens.shadows).reduce((a, b) => (Math.abs(b[1] - blur) < Math.abs(a[1] - blur) ? b : a))[0];
      report('TOK-05', 'minor', line, rule.selector, 'custom box-shadow', V3 ? `use ${tokens.shadowVars[name]}` : `use var(--shadow-${name}) (elevation scale xs…xl)`);
    }

    // RTL: physical sides do not mirror (only with --rtl)
    if (RTL) {
      const phys = prop.match(/^(margin|padding|border)-(left|right)(-.+)?$/) || (/^(left|right)$/.test(prop) && [prop]) || (prop === 'float' && /^(left|right)$/.test(value) && [prop]) || (prop === 'text-align' && /^(left|right)$/.test(value) && [prop]);
      if (phys) {
        const side = prop.includes('left') || value === 'left' ? 'start' : 'end';
        const fix = prop === 'text-align' ? `text-align: ${side}` : prop === 'float' ? `float: inline-${side}` : /^(left|right)$/.test(prop) ? `inset-inline-${side}` : prop.replace(/-(left|right)/, `-inline-${side}`);
        report('TXT-02', 'minor', line, rule.selector, `physical ${prop}${prop === 'float' || prop === 'text-align' ? ': ' + value : ''} does not mirror in RTL`, `use ${fix}`);
      }
    }

    // responsive widths
    if ((prop === 'width' || prop === 'min-width') && !rule.context.some((c) => /print/i.test(c))) {
      for (const s of pxValues(value)) if (s.px > 320) report('RSP-03', 'major', line, rule.selector, `fixed ${prop} ${s.raw} breaks on phones`, 'use max-width + width:100%, Columns, or a device-class rule (.desktop …)');
    }

    // focus
    if (isFocus) {
      if ((prop === 'outline' && /^(none|0(px)?)\b/.test(value)) || (prop === 'outline-style' && value === 'none') || (prop === 'outline-width' && /^0/.test(value))) outlineRemoved = d;
      else if (prop === 'box-shadow' || prop.startsWith('border') || (prop === 'outline' && !/^(none|0)/.test(value)) || prop === 'text-decoration' || prop === 'background' || prop === 'background-color') focusReplacement = true;
    }

    if (prop === 'display' && /\b(inline-)?(flex|grid)\b/.test(value)) displayFlexGrid = true;
  }

  if (outlineRemoved && !focusReplacement) {
    report('A11Y-05', 'blocker', outlineRemoved.line, rule.selector, 'focus outline removed with no visible replacement', 'keep a focus indicator: outline: var(--border-size-m) solid var(--color-primary); outline-offset: 2px');
  }

  // contrast
  // layered / gradient / image backgrounds cannot be judged statically
  const complexBg = bgDecl && (/gradient|url\(|image-set/i.test(bgDecl.value) || (bgDecl.value.match(/var\(|#[0-9a-f]{3,8}\b|rgba?\(/gi) || []).length > 1);
  if (colorDecl && !disabled && !keyframes && !complexBg) {
    const fg = resolveColor(colorDecl.value, tokens);
    let bgVal = bgDecl ? bgDecl.value.split(/\s+(?![^(]*\))/).find((p) => resolveColor(p, tokens)) : null;
    let bg = bgVal ? resolveColor(bgVal, tokens) : null;
    const rgba = bgVal && /^rgba?\(/i.test(bgVal) ? parseRgbFunc(bgVal) : null;
    if (rgba && rgba.alpha < 1) {
      // translucent background: composite over white (the usual card surface)
      const blend = (c) => Math.round(c * rgba.alpha + 255 * (1 - rgba.alpha));
      const [r0, g0, b0] = [1, 3, 5].map((k) => parseInt(rgba.hex.slice(k, k + 2), 16));
      bg = '#' + [r0, g0, b0].map((c) => blend(c).toString(16).padStart(2, '0')).join('');
      bgVal += ' over white';
    }
    if (fg) {
      const target = bg || '#ffffff';
      const r = contrast(fg, target);
      // No background in this rule: assume a white surface, unless the text is near-white
      // (then it is meant for a dark fill defined elsewhere, and we cannot judge it here).
      const lightTextUnknownBg = !bg && contrast(fg, '#ffffff') < 1.6;
      if (r < 4.5 && !lightTextUnknownBg) {
        // known background → major; unknown background → major only when it fails even large text (< 3:1) on white
        report('A11Y-01', bg || r < 3 ? 'major' : 'minor', colorDecl.line, rule.selector,
          `text ${colorDecl.value} on ${bg ? bgVal : 'white (assumed: no background in this rule, verify)'} is ${r.toFixed(2)}:1 (needs 4.5:1, or 3:1 for text ≥ 24px / bold ≥ 18.66px)`,
          `node scripts/contrast.mjs --suggest ${bg ? (exactToken(bg, tokens) || bg) : 'neutral-0'}`);
      }
    }
  }
  return displayFlexGrid;
}

// ---------- run ----------
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  current = { file: (relative(process.cwd(), f) || f).replace(/\\/g, '/'), ignores: {} };
  if (extname(f).toLowerCase() === '.css') {
    const { rules, ignores } = parseCss(src);
    current.ignores = ignores;
    const hasListScriptFix = rules.some((r) => /\.list\s*>\s*script/.test(r.selector) && r.decls.some((d) => d.prop === 'display' && d.value === 'none'));
    for (const r of rules) {
      for (const c of r.context) {
        if (/^@media/i.test(c) && /(min|max)-(width|height)\s*:\s*\d+(px|em|rem)/i.test(c) && !/print/i.test(c)) {
          report('RSP-02', 'minor', r.line, c, 'pixel media query', 'use .phone/.tablet/.desktop body classes, Columns break options or Responsive patterns');
          break;
        }
      }
      const flexGrid = lintRule(r);
      if (flexGrid && !hasListScriptFix && classesOf(r.selector).includes('list')) {
        report('LES-03', 'minor', r.line, r.selector, 'Reactive List with flex/grid: the inner <script> element becomes a layout item', 'add .list > script { display: none; } (theme)');
      }
    }
  } else {
    const lineOf = lineIndex(src);
    for (const m of src.matchAll(/\bstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
      const body = m[2] ?? m[3] ?? '';
      const line = lineOf(m.index);
      if (!body.trim()) continue;
      report('THM-05', 'major', line, '[inline style]', `inline style="${body.length > 60 ? body.slice(0, 57) + '…' : body}"`, 'move it to a Style Class (theme or block CSS) using tokens');
      lintRule({ selector: '[inline style]', line, context: [], decls: parseDecls(body, m.index, () => line) });
    }
  }
}

// ---------- output ----------
const order = { blocker: 0, major: 1, minor: 2 };
findings.sort((a, b) => order[a.severity] - order[b.severity] || a.file.localeCompare(b.file) || a.line - b.line);
const count = (s) => findings.filter((f) => f.severity === s).length;
const summary = { files: files.length, blocker: count('blocker'), major: count('major'), minor: count('minor') };
if (JSON_OUT) console.log(JSON.stringify({ summary, findings }, null, 2));
else {
  for (const f of findings) {
    console.log(`${f.severity.toUpperCase().padEnd(7)} ${f.id.padEnd(7)} ${f.file}:${f.line}  ${f.selector}`);
    console.log(`        ${f.message}\n        fix: ${f.fix}`);
  }
  console.log(`\n${summary.files} file(s) · ${summary.blocker} blocker · ${summary.major} major · ${summary.minor} minor · OutSystems UI ${V3 ? '3.0' : 'Classic'} rules${THEME ? ' · theme mode' : ''}${RTL ? ' · RTL checks' : ''}`);
  if (sawV3Syntax && !V3) console.log('note: this CSS uses --token-*/--osui-* variables (OutSystems UI 3.0). Re-run with --osui 3 to check against the 3.0 token set and retired variables.');
}
process.exit(summary.blocker || summary.major ? 1 : 0);
