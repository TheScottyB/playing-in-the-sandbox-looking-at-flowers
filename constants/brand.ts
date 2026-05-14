// constants/brand.ts
//
// Single source of truth for visual tokens. Captured from the values
// currently scattered across app/index.tsx and app/flower-detail.tsx so
// the Phase 2 rebrand becomes a swap-in-this-one-file operation rather
// than a sweep across screens.
//
// Until the brand workshop locks final values, these mirror what's
// already on screen — no visual change today.

import { Platform } from 'react-native';

/** Background + foreground colors. Ink = dark plates; paper = light text. */
export const PALETTE = {
  // Surfaces
  ink: '#0a0a0a',
  inkSoft: '#1a1a1a',

  // Foreground text against ink
  paper: '#fff',
  paperStrong: 'rgba(255,255,255,0.9)',
  paperBright: 'rgba(255,255,255,0.88)',
  paperHigh: 'rgba(255,255,255,0.85)',
  paperMid: 'rgba(255,255,255,0.75)',
  paperSoft: 'rgba(255,255,255,0.7)',
  paperDim: 'rgba(255,255,255,0.68)',
  paperFaint: 'rgba(255,255,255,0.6)',
  paperLow: 'rgba(255,255,255,0.55)',
  paperGhost: 'rgba(255,255,255,0.5)',

  // Lines
  hairline: 'rgba(255,255,255,0.25)',

  // Reserve for future brand accent (Phase 2 rebrand fills in)
  accent: '#fff', // placeholder — same as `paper` until rebrand
  accentInk: '#0a0a0a',
} as const;

/** Type stack. `serif` is the only platform-branched value. */
export const TYPE = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
} as const;

/** Corner radii. `card` is the rounded card surface; `pill` is capsule. */
export const RADIUS = {
  card: 18,
  button: 17,
  pill: 999,
} as const;

/**
 * Tracked-uppercase eyebrow used for region+date label, OFFLINE badge,
 * the FINDING TODAY'S BLOOM loading label, and section markers.
 *
 * Variations are sized for context (top bar, in-card badge, etc.) but
 * share the letter-spacing language.
 */
export const EYEBROW = {
  base: { fontSize: 11, letterSpacing: 2.4, fontWeight: '600' as const },
  small: { fontSize: 10, letterSpacing: 2.8, fontWeight: '600' as const },
  tiny: { fontSize: 9, letterSpacing: 2, fontWeight: '600' as const },
} as const;

export type Palette = typeof PALETTE;
export type Type = typeof TYPE;
export type Radius = typeof RADIUS;
