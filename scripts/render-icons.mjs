#!/usr/bin/env node
/**
 * Renders the Specimen Sandbox app icon — the Seed Spiral "Anchored" variant —
 * from the Claude Design final spec into PNG assets at 1024×1024.
 *
 * Source of design intent: docs/plans/archive/... + the original handoff
 * bundle under /tmp/design-pkg-specimen/. This script ports the SVG
 * generator from `final-spiral.jsx` into plain JS so the icons are
 * reproducible from the repo without the design tool.
 *
 * Run: node scripts/render-icons.mjs
 *
 * Outputs to app_store_assets/icons/:
 *   - icon-1024.png            iOS App Store hero (full color, ink stock)
 *   - adaptive-foreground.png  Android adaptive foreground (transparent)
 *   - adaptive-background.png  Android adaptive background (ink stock + grain)
 *   - monochrome.png           Wear OS / notification (white on transparent)
 *   - icon-mark.svg            SVG source of truth
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'app_store_assets', 'icons');
mkdirSync(OUT, { recursive: true });

// ── Design parameters (locked from chat: "Anchored" winner) ─────────────────
const PARAMS = {
  pearlSize: 118,
  stock: 'ink', // 'ink' or 'cream'
  foil: 'balanced', // 'subtle' | 'balanced' | 'vibrant'
  density: 'balanced', // 'sparse' | 'balanced' | 'dense'
  pearlStyle: 'pearl', // 'foil' | 'pearl' | 'solid'
  halo: false,
};

const F_CREAM = '#e9e3d2';
const F_CREAM_HI = '#f1ecde';
const F_CREAM_LO = '#ddd5c0';
const F_INK = '#0a0a0c';
const F_INK_2 = '#1a1916';

const FOIL_STOPS = {
  subtle: [['0%', '#bcc6e6'], ['30%', '#d9c8e6'], ['55%', '#efe1c4'], ['80%', '#c6dec8'], ['100%', '#b8c6e0']],
  balanced: [['0%', '#9bb0ff'], ['18%', '#c5a8ff'], ['38%', '#ffb8d9'], ['55%', '#fff0b8'], ['72%', '#b8f0c8'], ['88%', '#a8d8ff'], ['100%', '#9bb0ff']],
  vibrant: [['0%', '#7e9bff'], ['16%', '#c885ff'], ['34%', '#ff7eb8'], ['52%', '#ffd86b'], ['70%', '#7eebb0'], ['88%', '#7ec0ff'], ['100%', '#7e9bff']],
};

const DENSITY = { sparse: 130, balanced: 200, dense: 280 };

/** Fibonacci/sunflower seed positions — phyllotaxis. */
function makeSeeds({ N, baseR, maxR, exclude }) {
  const cx = 512;
  const cy = 512;
  const phi = Math.PI * (3 - Math.sqrt(5));
  const out = [];
  for (let i = 0; i < N; i++) {
    const r = baseR * Math.sqrt(i);
    if (r > maxR) continue;
    if (r < exclude) continue;
    const a = i * phi;
    out.push({ i, x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, r });
  }
  return out;
}

/**
 * Build the spiral SVG string.
 * @param {'full' | 'fg' | 'bg'} mode  full = ink stock + spiral; fg = spiral only (transparent); bg = ink stock only.
 * @param {undefined | 'mono-light' | 'mono-dark'} palette  Monochrome override for notifications.
 */
function buildSvg(mode = 'full', palette) {
  const id = `fs-${palette || PARAMS.stock}-${mode}`;
  const stops = FOIL_STOPS[PARAMS.foil] || FOIL_STOPS.balanced;
  const seeds = makeSeeds({
    N: DENSITY[PARAMS.density] || 200,
    baseR: 24,
    maxR: 360,
    exclude: PARAMS.pearlSize - 6,
  });
  const dark = PARAMS.stock === 'ink';

  // ── Resolve fills ────────────────────────────────────────────
  let dotPrimary, dotSecondary, dotSecondaryEvery;
  if (palette === 'mono-light') {
    dotPrimary = '#ffffff';
    dotSecondary = '#ffffff';
    dotSecondaryEvery = 99;
  } else if (palette === 'mono-dark') {
    dotPrimary = F_INK;
    dotSecondary = F_INK;
    dotSecondaryEvery = 99;
  } else if (dark) {
    dotPrimary = `url(#${id}-foil)`;
    dotSecondary = F_CREAM_HI;
    dotSecondaryEvery = 4;
  } else {
    dotPrimary = F_INK;
    dotSecondary = `url(#${id}-foil)`;
    dotSecondaryEvery = 5;
  }

  let pearlFill, pearlStreak;
  if (palette === 'mono-light') {
    pearlFill = '#ffffff';
  } else if (palette === 'mono-dark') {
    pearlFill = F_INK;
  } else if (PARAMS.pearlStyle === 'foil') {
    pearlFill = `url(#${id}-foil)`;
    pearlStreak = `url(#${id}-streak)`;
  } else if (PARAMS.pearlStyle === 'pearl') {
    pearlFill = `url(#${id}-pearl)`;
    pearlStreak = `url(#${id}-streak)`;
  } else {
    pearlFill = dark ? F_CREAM_HI : F_INK;
  }

  // ── SVG defs ─────────────────────────────────────────────────
  const defs = `
    <defs>
      <linearGradient id="${id}-foil" x1="8%" y1="6%" x2="92%" y2="94%">
        ${stops.map(([off, c]) => `<stop offset="${off}" stop-color="${c}" />`).join('')}
      </linearGradient>
      <radialGradient id="${id}-pearl" cx="38%" cy="32%" r="78%">
        <stop offset="0%" stop-color="#fff6d9" />
        <stop offset="22%" stop-color="#ffe1c0" />
        <stop offset="45%" stop-color="#f2b8da" />
        <stop offset="70%" stop-color="#a8c0ff" />
        <stop offset="100%" stop-color="#7e90d8" />
      </radialGradient>
      <radialGradient id="${id}-paperCream" cx="50%" cy="42%" r="78%">
        <stop offset="0%" stop-color="${F_CREAM_HI}" />
        <stop offset="68%" stop-color="${F_CREAM}" />
        <stop offset="100%" stop-color="${F_CREAM_LO}" />
      </radialGradient>
      <filter id="${id}-grain" x="0%" y="0%" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix values="0 0 0 0 0.06  0 0 0 0 0.05  0 0 0 0 0.04  0 0 0 0 0.09" />
      </filter>
      <linearGradient id="${id}-streak" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff" stop-opacity="0" />
        <stop offset="44%" stop-color="#fff" stop-opacity="0" />
        <stop offset="52%" stop-color="#fff" stop-opacity="0.55" />
        <stop offset="60%" stop-color="#fff" stop-opacity="0" />
        <stop offset="100%" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>`;

  // ── Background block ────────────────────────────────────────
  let bg = '';
  if (mode !== 'fg') {
    if (palette === 'mono-light' || palette === 'mono-dark') {
      bg = ''; // transparent for monochrome
    } else if (dark) {
      bg = `
        <rect width="1024" height="1024" fill="${F_INK}" />
        <rect width="1024" height="1024" fill="${F_INK_2}" filter="url(#${id}-grain)" opacity="0.6" />`;
    } else {
      bg = `
        <rect width="1024" height="1024" fill="url(#${id}-paperCream)" />
        <rect width="1024" height="1024" fill="${F_CREAM}" filter="url(#${id}-grain)" opacity="0.55" />`;
    }
  }

  // ── Foreground (seeds + pearl) ──────────────────────────────
  let fg = '';
  if (mode !== 'bg') {
    const halo = PARAMS.halo
      ? `<circle cx="512" cy="512" r="370" fill="none" stroke="${palette === 'mono-light' ? '#fff' : dark ? F_CREAM_HI : F_INK}" stroke-width="2" opacity="0.22" />`
      : '';
    const dots = seeds
      .map((s) => {
        const rad = 17 - (s.r / 360) * 7;
        const op = 0.95 - (s.r / 360) * 0.3;
        const fill = s.i % dotSecondaryEvery === 0 ? dotSecondary : dotPrimary;
        return `<circle cx="${s.x.toFixed(2)}" cy="${s.y.toFixed(2)}" r="${rad.toFixed(2)}" fill="${fill}" opacity="${op.toFixed(3)}" />`;
      })
      .join('');
    const pearl = `<circle cx="512" cy="512" r="${PARAMS.pearlSize}" fill="${pearlFill}" />`;
    const streak = pearlStreak ? `<circle cx="512" cy="512" r="${PARAMS.pearlSize}" fill="${pearlStreak}" opacity="0.85" />` : '';
    const pearlStroke = `<circle cx="512" cy="512" r="${PARAMS.pearlSize}" fill="none" stroke="${dark ? F_INK_2 : F_INK}" stroke-width="${dark ? 3 : 4}" opacity="${dark ? 0.5 : 1}" />`;
    fg = `<g>${halo}${dots}${pearl}${streak}${pearlStroke}</g>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">${defs}${bg}${fg}</svg>`;
}

/** Render an SVG string to a PNG buffer at the given size. */
function renderPng(svg, size = 1024) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: size },
    background: 'rgba(0, 0, 0, 0)',
  });
  return resvg.render().asPng();
}

// ── Deliverables ────────────────────────────────────────────────────────────

const deliverables = [
  { name: 'icon-1024.png', mode: 'full', desc: 'iOS App Store hero — ink stock + spiral' },
  { name: 'adaptive-foreground.png', mode: 'fg', desc: 'Android adaptive foreground (transparent)' },
  { name: 'adaptive-background.png', mode: 'bg', desc: 'Android adaptive background (ink stock + grain)' },
  { name: 'monochrome.png', mode: 'full', palette: 'mono-light', desc: 'Wear OS / notification (white on transparent)' },
];

for (const d of deliverables) {
  const svg = buildSvg(d.mode, d.palette);
  const png = renderPng(svg);
  const path = join(OUT, d.name);
  writeFileSync(path, png);
  console.log(`✓ ${d.name}  (${(png.length / 1024).toFixed(1)} KB)  — ${d.desc}`);
}

// SVG source of truth — the full color icon
const svgSource = buildSvg('full');
writeFileSync(join(OUT, 'icon-mark.svg'), svgSource);
console.log(`✓ icon-mark.svg  (${(svgSource.length / 1024).toFixed(1)} KB)  — SVG source`);

console.log('\nDone. Re-run after tweaking PARAMS at the top of this script.');
