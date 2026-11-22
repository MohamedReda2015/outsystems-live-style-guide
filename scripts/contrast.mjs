#!/usr/bin/env node
/**
 * WCAG 2.x contrast checker for OutSystems UI tokens (Node 16+, no dependencies).
 *
 * Usage:
 *   node contrast.mjs <foreground> <background>      e.g.  node contrast.mjs neutral-7 white
 *                                                          node contrast.mjs "#ffffff" warning
 *                                                          node contrast.mjs var(--color-error) error-light
 *   node contrast.mjs --suggest <background> [--min 4.5]   tokens usable as TEXT on that background
 *   node contrast.mjs --audit                              every palette color vs white, body background, and white text on it
 *   add --osui 3 to use the OutSystems UI 3.0 token set (default: Classic / 2.x),
 *   --json for machine output, --tokens <file> for a custom brand token file
 *
 * Colors: #hex, rgb(), CSS named colors, token names (primary, neutral-7, red-darker, background-body;
 * with --osui 3 also text, text-subtlest, border-input, token-text-danger …), --color-*, var(--color-*),
 * --token-* or var(--token-*, fallback).
 * Exit code (pair mode): 0 = passes AA for normal text (4.5:1), 1 = fails, 2 = bad input.
 */
import { loadTokens, resolveColor, contrast, exactToken, colorVarFor } from './osui-tokens.mjs';

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name, def) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] ? args[i + 1] : def; };
const tokens = loadTokens(opt('--tokens'), opt('--osui', flag('--osui3') ? '3' : '2'));
const json = flag('--json');
const positional = args.filter((a, i) => !a.startsWith('--') && !['--min', '--tokens', '--suggest', '--osui'].includes(args[i - 1]));

const verdict = (r) => ({
  ratio: +r.toFixed(2),
  normalTextAA: r >= 4.5, largeTextAA: r >= 3, nonTextAA: r >= 3, normalTextAAA: r >= 7,
});
const mark = (b) => (b ? 'PASS' : 'FAIL');
const label = (input, hex) => { const t = exactToken(hex, tokens); return t && t !== input ? `${input} (${hex}, token ${t})` : `${input} (${hex})`; };

if (flag('--audit')) {
  const white = '#ffffff', body = resolveColor('background-body', tokens);
  const rows = Object.entries(tokens.colors).map(([name, v]) => {
    const hex = resolveColor(v, tokens);
    return { token: name, hex, onWhite: +contrast(hex, white).toFixed(2), onBody: +contrast(hex, body).toFixed(2), whiteTextOnIt: +contrast(white, hex).toFixed(2) };
  });
  if (json) { console.log(JSON.stringify(rows, null, 2)); process.exit(0); }
  console.log('token'.padEnd(18), 'hex'.padEnd(8), 'text-on-white', 'text-on-body', 'white-text-on-it   (AA normal text = 4.5)');
  for (const r of rows) {
    const f = (x) => `${x.toFixed(2).padStart(5)} ${x >= 4.5 ? 'ok ' : x >= 3 ? 'lg ' : '-- '}`;
    console.log(r.token.padEnd(18), r.hex.padEnd(8), f(r.onWhite).padEnd(13), f(r.onBody).padEnd(12), f(r.whiteTextOnIt));
  }
  console.log('\nok = passes 4.5:1 · lg = large text / UI components only (3:1) · -- = fails');
  process.exit(0);
}

if (flag('--suggest')) {
  const bgIn = opt('--suggest');
  const bg = resolveColor(bgIn, tokens);
  if (!bg) { console.error(`Unknown background color: ${bgIn}`); process.exit(2); }
  const min = parseFloat(opt('--min', '4.5'));
  const list = Object.entries(tokens.colors)
    .map(([name, v]) => ({ token: name, hex: resolveColor(v, tokens), ratio: contrast(resolveColor(v, tokens), bg) }))
    .filter((x) => x.ratio >= min).sort((a, b) => b.ratio - a.ratio);
  if (json) { console.log(JSON.stringify({ background: bg, min, tokens: list.map((x) => ({ ...x, ratio: +x.ratio.toFixed(2) })) }, null, 2)); process.exit(0); }
  console.log(`Tokens (OutSystems UI ${tokens.version === '3' ? '3.0' : 'Classic'}) with contrast >= ${min}:1 on ${label(bgIn, bg)}:`);
  for (const x of list) console.log(`  ${x.ratio.toFixed(2).padStart(5)}  ${colorVarFor(x.token, tokens)}  ${x.hex}`);
  if (!list.length) console.log('  none: choose a different background');
  process.exit(0);
}

if (positional.length !== 2) {
  console.error('Usage: node contrast.mjs <foreground> <background> | --suggest <background> [--min 4.5] | --audit  [--json] [--tokens file]');
  process.exit(2);
}
const [fgIn, bgIn] = positional;
const fg = resolveColor(fgIn, tokens), bg = resolveColor(bgIn, tokens);
if (!fg || !bg) { console.error(`Unknown color: ${!fg ? fgIn : bgIn}`); process.exit(2); }
const v = verdict(contrast(fg, bg));
if (json) console.log(JSON.stringify({ foreground: fg, background: bg, ...v }, null, 2));
else {
  console.log(`${label(fgIn, fg)} on ${label(bgIn, bg)}  →  ${v.ratio}:1`);
  console.log(`  normal text AA (4.5) ${mark(v.normalTextAA)} · large text AA (3) ${mark(v.largeTextAA)} · UI/non-text AA (3) ${mark(v.nonTextAA)} · normal text AAA (7) ${mark(v.normalTextAAA)}`);
  if (!v.normalTextAA) console.log(`  tip: node contrast.mjs --suggest ${bgIn}`);
}
process.exit(v.normalTextAA ? 0 : 1);
