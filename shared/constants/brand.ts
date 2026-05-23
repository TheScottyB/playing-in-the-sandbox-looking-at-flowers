// constants/brand.ts
//
// Single source of truth for visual tokens. Updated 2026-05-14 to align
// with the Specimen Sandbox icon identity (Seed Spiral · Anchored). Ink
// shifts slightly cool (#0a0a0c) to match the icon stock; cream tokens
// added to unlock the foil-stamped-specimen palette across screens.
//
// **Migration note**: app/index.tsx and app/flower-detail.tsx still use
// inline hex values matching the older `ink: #0a0a0a` baseline. Brand
// tokens here are the forward-looking source of truth; screens will be
// migrated to import from this file in a follow-up refactor. The visual
// delta between `#0a0a0a` and `#0a0a0c` is imperceptible — not blocking.

import { Platform } from "react-native";

/**
 * Surface + text colors. Two stocks:
 * - **ink**: dark plates (current home/detail screens, icon background)
 * - **cream**: foil-stamped specimen cardstock (future iridescent treatment, App B)
 */
export const PALETTE = {
	// Dark stock (matches icon background, slightly cool)
	ink: "#0a0a0c",
	inkSoft: "#1a1916",

	// Cream stock (foil-stamped specimen card, App B + future light-mode)
	cream: "#e9e3d2",
	creamHi: "#f1ecde",
	creamLo: "#ddd5c0",

	// Foreground text against ink
	paper: "#ffffff",
	paperStrong: "rgba(255,255,255,0.9)",
	paperBright: "rgba(255,255,255,0.88)",
	paperHigh: "rgba(255,255,255,0.85)",
	paperMid: "rgba(255,255,255,0.75)",
	paperSoft: "rgba(255,255,255,0.7)",
	paperDim: "rgba(255,255,255,0.68)",
	paperFaint: "rgba(255,255,255,0.6)",
	paperLow: "rgba(255,255,255,0.55)",
	paperGhost: "rgba(255,255,255,0.5)",

	// Lines
	hairline: "rgba(255,255,255,0.25)",
	hairlineInk: "rgba(10,10,12,0.35)",

	// Brand accent — pearl gradient is icon-only (radial gradient, not
	// expressible as a single hex). Single-color tokens approximate the
	// pearl's mid-tone for any UI accent that wants to nod at the icon.
	accent: "#f2b8da", // pearl mid-rose
	accentDeep: "#7e90d8", // pearl outer-blue
	accentInk: "#0a0a0c",
} as const;

/** Type stack. `serif` is the only platform-branched value. */
export const TYPE = {
	serif: Platform.select({
		ios: "Georgia",
		android: "serif",
		default: "Georgia",
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
	base: { fontSize: 11, letterSpacing: 2.4, fontWeight: "600" as const },
	small: { fontSize: 10, letterSpacing: 2.8, fontWeight: "600" as const },
	tiny: { fontSize: 9, letterSpacing: 2, fontWeight: "600" as const },
} as const;

export type Palette = typeof PALETTE;
export type Type = typeof TYPE;
export type Radius = typeof RADIUS;
