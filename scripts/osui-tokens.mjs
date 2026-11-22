// Shared helpers for the OutSystems UI token scripts (Node 16+, no dependencies).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Load a token set. `version` "3" (or "3.0") loads tokens-osui3.json (OutSystems UI 3.0 design-token theme);
 * anything else loads tokens.json (OutSystems UI Classic / 2.x). An explicit path wins.
 */
export function loadTokens(path, version) {
  const file = path || join(here, /^3/.test(String(version || '')) ? 'tokens-osui3.json' : 'tokens.json');
  const t = JSON.parse(readFileSync(file, 'utf8'));
  t.version = t.version || '2';
  return t;
}

/** CSS reference for a color token name: roles → var(--color-x); design tokens → var(--token-x, #fallback). */
export function colorVarFor(name, tokens) {
  if (name.startsWith('token-')) return `var(--${name}, ${tokens.colors[name]})`;
  return `var(--color-${name})`;
}

const NAMED = {
  white: '#ffffff', black: '#000000', red: '#ff0000', green: '#008000', blue: '#0000ff', yellow: '#ffff00',
  orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', gray: '#808080', grey: '#808080', silver: '#c0c0c0',
  navy: '#000080', teal: '#008080', maroon: '#800000', olive: '#808000', lime: '#00ff00', aqua: '#00ffff',
  fuchsia: '#ff00ff', lightgray: '#d3d3d3', lightgrey: '#d3d3d3', darkgray: '#a9a9a9', darkgrey: '#a9a9a9',
  whitesmoke: '#f5f5f5', gainsboro: '#dcdcdc', crimson: '#dc143c', gold: '#ffd700', tomato: '#ff6347',
  dodgerblue: '#1e90ff', steelblue: '#4682b4', royalblue: '#4169e1', darkblue: '#00008b', darkred: '#8b0000',
  darkgreen: '#006400', lightblue: '#add8e6', lightgreen: '#90ee90', beige: '#f5f5dc', ivory: '#fffff0',
};
export const NAMED_COLORS = NAMED;

export function normHex(h) {
  let s = h.trim().toLowerCase().replace(/^#/, '');
  if (s.length === 3 || s.length === 4) s = s.slice(0, 3).split('').map((c) => c + c).join('');
  if (s.length === 8) s = s.slice(0, 6);
  return /^[0-9a-f]{6}$/.test(s) ? '#' + s : null;
}

export function parseRgbFunc(v) {
  const m = v.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:[\s,/]+([\d.]+%?))?\s*\)/i);
  if (!m) return null;
  const hex = '#' + [m[1], m[2], m[3]].map((n) => Math.max(0, Math.min(255, Math.round(+n))).toString(16).padStart(2, '0')).join('');
  let alpha = 1;
  if (m[4] !== undefined) alpha = m[4].endsWith('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  return { hex, alpha };
}

export function hexToRgb(hex) {
  const h = normHex(hex);
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
}

export function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

/** Resolve "#hex", "rgb()", "white", "primary", "neutral-7", "--color-primary", "var(--color-primary)" to "#rrggbb". */
export function resolveColor(input, tokens) {
  if (!input) return null;
  let s = String(input).trim();
  const v = s.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*([^)]*))?\)$/i);
  let fallback = null;
  if (v) { s = v[1]; fallback = v[2] ? v[2].trim() : null; }
  if (s.startsWith('--color-')) s = s.slice(8);
  else if (s.startsWith('--token-')) {
    const key = s.slice(2);
    if (tokens.colors[key]) return normHex(tokens.colors[key]);
    return fallback ? resolveColor(fallback, tokens) : null;
  }
  if (s.startsWith('#')) return normHex(s);
  if (/^rgba?\(/i.test(s)) return parseRgbFunc(s)?.hex ?? null;
  const key = s.toLowerCase();
  if (tokens.colors[key]) return normHex(tokens.colors[key]);
  if (NAMED[key]) return NAMED[key];
  return null;
}

export function exactToken(hex, tokens) {
  const h = normHex(hex);
  return Object.entries(tokens.colors).find(([, v]) => normHex(v) === h)?.[0] ?? null;
}

export function nearestToken(hex, tokens) {
  const [r, g, b] = hexToRgb(hex);
  let best = null;
  for (const [name, val] of Object.entries(tokens.colors)) {
    const [r2, g2, b2] = hexToRgb(val);
    // weighted RGB distance (cheap perceptual approximation)
    const d = Math.sqrt(2 * (r - r2) ** 2 + 4 * (g - g2) ** 2 + 3 * (b - b2) ** 2);
    if (!best || d < best.d) best = { name, d, hex: normHex(val) };
  }
  return best;
}
