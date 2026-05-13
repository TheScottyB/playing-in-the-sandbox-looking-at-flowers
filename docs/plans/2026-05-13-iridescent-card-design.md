# Iridescent Card — Design

_Brainstormed 2026-05-13. Source design: Anthropic Design API package `iridescent-card` (Specimen 01 · Iridescent stock, foil-stamped)._

## Intent

Replace the existing `react-native-flip-card` on the daily flower screen with a foil-stamped iridescent specimen card. The daily flower **is** the specimen. The card behaves like a physical object printed on iridescent stock — gently parallaxing on device tilt, tracking touch with smooth pointer-style following, and color-shifting through a full hue spread as it moves.

Both sides of the flip are iridescent. Front holds the flower image inset in a specimen frame; back holds the serif species panel on the same cream cardstock.

## Scoping decisions

| Decision | Choice | Rationale |
|---|---|---|
| Integration | Replace `<FlipCard>` in `app/index.tsx` | Strongest narrative — daily flower becomes the foil-stamped collector card. |
| Fidelity | `@shopify/react-native-skia` for effects | The prototype's blend modes (`color-dodge`, `overlay`, `soft-light`) and gradient types (radial, conic/sweep, repeating-linear) are not supported in plain RN. Skia is GPU-accelerated and works on web via CanvasKit. |
| Interaction | Device tilt (idle) + pan (touch) + pointer (web desktop) | "Always alive on display" feeling with full interactive control. Three input signals, single source of motion. |
| Flip | Keep flip via Reanimated `rotateY`; both sides iridescent | Preserves discovery moment; foil treatment continues to the back. |
| Framing | Full specimen treatment | Double keyline + corner letters + footer baseline mirror the prototype vocabulary. Matches the app's existing "SPECIMEN" eyebrow language. |
| Composition | Hybrid — `expo-image` photo + `react-native-svg` frame + Skia effects overlay | Clear separation, easy to debug per-layer, preserves `expo-image` caching. |

## Component tree

```
components/IridescentCard/
├── index.tsx              // <IridescentCard flower={DailyFlower} /> — public component, owns flip state
├── CardFrame.tsx          // SVG keyline borders + corner letters + specimen footer
├── CardFace.tsx           // One face: frame + content slot, flippable container
├── CardEffects.tsx        // Skia <Canvas> with all iridescent layers
├── useCardTilt.ts         // gyro + pan + pointer → SharedValue<{x, y, hov}>
└── tokens.ts              // sizes, colors, blend params — mirrors prototype TWEAK_DEFAULTS
```

`app/index.tsx` drops `react-native-flip-card`, swaps the FlipCard block for `<IridescentCard flower={state.flower} />`. Loading/error states and nav row unchanged.

`package.json`:
- Add: `@shopify/react-native-skia`, `react-native-svg`, `expo-sensors`
- Remove: `react-native-flip-card`

Untouched: `lib/dailyFlower.ts`, `lib/region.ts`, `defaults.ts`, `species.json`, `app/_layout.tsx`.

## Animation data flow

```
useCardTilt()
  └── SharedValue<{ x, y, hov }>     // x,y in [0..1], hov in [0..1]
       ↑ input sources, last-touched wins for ~600ms then gyro resumes
       ├── DeviceMotion (expo-sensors)           — idle drift
       ├── Gesture.Pan() (gesture-handler)        — touch + drag
       └── PointerEvents (web only)               — mouse on desktop
```

- Smoothing: `useFrameCallback` worklet lerping `current → target` at `ease=0.14`, `easeHov=0.08`, matching prototype.
- Derived inside Skia worklets (no re-renders): `rx = (0.5 - y) * tilt * hov * 2`, `ry = (x - 0.5) * tilt * hov * 2`, `hue = (hueOffset + x*hueSpread + y*hueSpread*0.4) % 360`.
- 3D transform applied to outer `Animated.View`: `perspective(1400) rotateX(rx) rotateY(ry)`.

## Visual spec

**Card**: 360 × 540 base, scaled to `Math.min(winW - 48, 360)` width on screen, 3:2 aspect preserved, 22px corner radius.

**Frame** (`CardFrame.tsx`, react-native-svg, both faces, identical):
- Cream cardstock fill `#e9e3d2`
- Outer keyline: 10px inset, 1px stroke, `rgba(10,10,12,0.85)`
- Inner keyline: 16px inset, 0.5px stroke, `rgba(10,10,12,0.35)`
- Corner glyph: day initial (e.g. "M" for May), 34px Inter Tight 600, with a small pip below; mirrored 180° in opposite corner
- Front footer (monospace, letter-spacing 0.4em, 7.5px): `SPECIMEN · {LATIN_NAME}`
- Back footer: `N° {dayOfYear} / 365 — IRIDESCENT STOCK`

**Front content**: flower image (`expo-image`) inset as a 224×224 circular vignette centered on the card's 112-radius zone, with 1.25px keyline ring around it. Tight bloom crop. Below: small "SPECIMEN · {COMMON}" caption.

**Back content**: serif species panel on cream cardstock — `flower.common` in Georgia 32, `flower.latin` italic, hairline divider, `flower.blurb` at 15/23. Ink color `#0a0a0c`. "TAP TO FLIP BACK" hint at bottom.

**Iridescent layers** (Skia `<Canvas>` overlay, in order, both faces):
1. **Glow** — behind card, radial gradient via `Shader.MakeRadialGradient`, hue cycles with x. Blur 18px, saturation 140%. Opacity tied to `hov`.
2. **Iridescence primary** — radial HSL gradient (5 stops), `BlendMode.ColorDodge`, contrast 1.4×. Center follows `(mx, my)`.
3. **Iridescence secondary** — sweep gradient (Skia equivalent of conic), `BlendMode.Overlay`, blur 2px.
4. **Specular** — radial white bloom, `BlendMode.SoftLight`. Center follows pointer.
5. **Grain** — `Shader.MakePerlinNoiseTurbulence` baseFreq 1.6, `BlendMode.Overlay`, opacity 0.22.
6. **Edge sheen** — linear gradient masked to inner border only, `BlendMode.Screen`. Angle driven by x.
7. **Stroke** — crisp 0.5px inner stroke (drawn as SVG, not Skia) for the final hard edge.

Tokens (`tokens.ts`):

```ts
export const TOKENS = {
  tiltAmount: 18,
  perspective: 1400,
  iridescenceIntensity: 0.95,
  iridescenceContrast: 1.4,
  hueOffset: 200,
  hueSpread: 320,
  specularIntensity: 0.9,
  specularSize: 0.55,
  noiseOpacity: 0.22,
  noiseScale: 1.4,
  glowIntensity: 0.7,
  glowSize: 80,
  edgeSheen: 0.55,
  cardWidth: 360,
  cardHeight: 540,
  cornerRadius: 22,
} as const;
```

## Flip mechanic

`IridescentCard` owns a Reanimated `SharedValue<number>` for flip progress (0 → 1). Tap toggles. Both faces are children of an `Animated.View` with `rotateY` interpolation `0 → 180deg`. Back face is rotated 180° at rest. CSS `backfaceVisibility: hidden` on each face. The iridescent overlay sits on the currently visible face only (toggled at 0.5 progress).

## Web build verification

Run `pnpm web` → opens in browser. We judge fidelity against the prototype HTML side-by-side. Specifically check:

- Iridescence color shift across full pointer travel
- Specular bloom following pointer smoothly
- Tilt response on pointer movement (gyro absent on desktop)
- Frame keylines render crisp at the target size
- Grain visible but not overpowering
- Flip animation smooth at 60fps (or close on web)

## Risks

| Risk | Mitigation |
|---|---|
| Skia web bundle (~2-3MB WASM) | Acceptable for design judging. Can lazy-load or code-split later. |
| Reanimated worklets on web (~50fps) | Acceptable for judging. Native target later will be 60fps. |
| Gyro permission on iOS Safari | Pointer fallback always present; no hard dependency on gyro. |
| Skia + Reanimated + RN 0.83 version compat | Use `expo install` for version selection; pin in `package.json`. |
| Native iOS rebuild still blocked by iOS 26.5 SDK | Out of scope for this design — web build sidesteps it. |

## Out of scope

- Tweaks panel from the prototype (designer tool, not user-facing). Tokens file is enough.
- Multiple card art variants (`ace`, `monogram`, `compass`, `grid`). We use one treatment: photo-as-specimen.
- Sound, haptics on flip.
- Persisting flip state across sessions.
- Native iOS verification (blocked by SDK; revisit after `xcodebuild -downloadPlatform iOS`).
