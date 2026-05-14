# Iridescent Card Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace `react-native-flip-card` on the daily-flower screen with a foil-stamped iridescent specimen card that responds to device tilt, touch pan, and (on web) mouse pointer — judged via `pnpm web` against the source HTML prototype at `/tmp/design-pkg/iridescent-card/project/Iridescent Card.html`.

**Architecture:** Hybrid composition — `expo-image` for the photo, `react-native-svg` for the specimen frame (keylines / corner glyphs / footer), `@shopify/react-native-skia` for the iridescent overlay layers (color-dodge / overlay / soft-light blends + radial / sweep gradients + Perlin noise grain). Animation flows from one `useCardTilt()` hook (gyro + pan + pointer) into Reanimated `SharedValue`s consumed directly by Skia worklets — no React re-renders during interaction.

**Tech Stack:** Expo SDK 55, React Native 0.83, TypeScript, `@shopify/react-native-skia`, `react-native-svg`, `react-native-reanimated` (already installed), `react-native-gesture-handler` (transitively present via reanimated; verify), `expo-sensors`.

**Verification cadence:** `pnpm typecheck` after each task (syntactic gate). `pnpm web` at marked milestones (visual gate). No unit tests — this project has none and visual fidelity isn't unit-testable. The source HTML at `/tmp/design-pkg/iridescent-card/project/Iridescent Card.html` is the reference; keep it open in a second browser tab while judging.

**Design reference:** `docs/plans/2026-05-13-iridescent-card-design.md` (in this repo).

**Commit cadence:** Every task ends with a commit. Granular history is intentional — lets us revert any single layer if a visual regression appears.

---

## Task 0: Pre-flight — verify clean state

**Step 1:** Confirm we're on the brainstormed worktree with the design doc committed.

```bash
git log --oneline -3
git status --short
```

Expected: latest commit is `docs: brainstorm design for iridescent foil-stamped specimen card`; working tree clean.

**Step 2:** Snapshot current screen so we have a "before" reference for the wire-in step.

```bash
ls app/index.tsx components/ data/
```

Expected: `app/index.tsx` exists; `components/` has `ThemedText.tsx`, `ThemedView.tsx`; `data/` has `defaults.ts`, `species.json`.

No commit — this is a check.

---

## Task 1: Install dependencies, remove FlipCard from manifest

**Files:**
- Modify: `package.json`
- Verify: `pnpm-lock.yaml` updates

**Step 1: Add the three new deps via `expo install` (picks Expo-SDK-matched versions)**

```bash
pnpm exec expo install @shopify/react-native-skia react-native-svg expo-sensors
```

Expected: three packages added, `pnpm-lock.yaml` updates, no peer-dep warnings.

**Step 2: Remove `react-native-flip-card`**

```bash
pnpm remove react-native-flip-card
```

Expected: removed cleanly.

**Step 3: Verify gesture-handler is present (Skia + reanimated assume it)**

```bash
grep -E "react-native-gesture-handler" package.json pnpm-lock.yaml | head -3
```

If gesture-handler is not in `package.json` dependencies, add it:

```bash
pnpm exec expo install react-native-gesture-handler
```

**Step 4: Typecheck**

```bash
pnpm typecheck
```

Expected: passes. (The `react-native-flip-card` import in `app/index.tsx` will now be broken — we accept this temporarily; we'll fix it in Task 7.) If typecheck fails on that import, comment out the FlipCard block in `app/index.tsx` and stub it with a placeholder `<View />` for now. Do not delete the block — Task 7 needs the surrounding context.

**Step 5: Web smoke — does the app still boot?**

```bash
pnpm exec expo start --web --port 8081 &
EXPO_PID=$!
sleep 25
curl -sf http://localhost:8081 > /dev/null && echo "OK" || echo "FAIL"
kill $EXPO_PID 2>/dev/null
```

Expected: `OK`. If `FAIL`, surface the dev-server logs and fix before continuing.

**Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml app/index.tsx
git commit -m "build: swap react-native-flip-card for skia + svg + sensors"
```

---

## Task 2: Tokens module

**Files:**
- Create: `components/IridescentCard/tokens.ts`

**Step 1: Write the file**

```ts
// components/IridescentCard/tokens.ts
// Mirrors prototype TWEAK_DEFAULTS. Normalized: percentages → 0..1, others as-is.
// Reference: /tmp/design-pkg/iridescent-card/project/Iridescent Card.html lines 31-54

export const TOKENS = {
  // Card geometry
  cardWidth: 360,
  cardHeight: 540,
  cornerRadius: 22,

  // Pose
  tiltAmount: 18,           // degrees, max rotation per axis
  perspective: 1400,        // px

  // Iridescence
  iridescenceIntensity: 0.95,
  iridescenceContrast: 1.4, // 0.4 + 0.7*1.4 from prototype derived formula
  hueOffset: 200,           // degrees
  hueSpread: 320,           // degrees

  // Specular
  specularIntensity: 0.9,
  specularSize: 0.55,       // fraction of card width for radial extent

  // Grain
  noiseOpacity: 0.22,
  noiseScale: 1.4,          // baseFrequency for Perlin

  // Glow (outer)
  glowIntensity: 0.7,
  glowSize: 80,             // px radius

  // Edge sheen
  edgeSheen: 0.55,

  // Cardstock colors
  cardstock: '#e9e3d2',
  ink: '#0a0a0c',
  inkSoft: 'rgba(10,10,12,0.35)',
  inkLine: 'rgba(10,10,12,0.85)',
} as const;

export type Tokens = typeof TOKENS;
```

**Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 3: Commit**

```bash
git add components/IridescentCard/tokens.ts
git commit -m "feat(iridescent-card): add visual tokens mirroring prototype defaults"
```

---

## Task 3: SVG card frame (no interactivity yet)

**Files:**
- Create: `components/IridescentCard/CardFrame.tsx`

**Step 1: Write the file**

```tsx
// components/IridescentCard/CardFrame.tsx
import { memo } from 'react';
import Svg, {
  Circle,
  G,
  Line,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { TOKENS } from './tokens';

export type CardFrameProps = {
  /** Single character displayed top-left and (rotated 180°) bottom-right. */
  cornerGlyph: string;
  /** Monospace footer baseline, e.g. "SPECIMEN · ROSA RUBIGINOSA" */
  footer: string;
  /** Whether the front-side circular vignette is drawn. Back side passes false. */
  showVignette?: boolean;
};

const W = TOKENS.cardWidth;
const H = TOKENS.cardHeight;
const R = TOKENS.cornerRadius;

const Corner = ({ glyph, flip = false }: { glyph: string; flip?: boolean }) => (
  <G transform={flip ? `translate(${W} ${H}) rotate(180)` : 'translate(0 0)'}>
    <SvgText
      x={22}
      y={44}
      fontFamily='"Inter Tight", Helvetica, sans-serif'
      fontWeight="600"
      fontSize={34}
      letterSpacing={-0.7}
      fill={TOKENS.ink}
    >
      {glyph}
    </SvgText>
    {/* Small compass-pip beneath the glyph */}
    <G transform="translate(34 70) scale(0.55)">
      <Path />
    </G>
  </G>
);

const Path = () => (
  <G>
    <SvgPath
      d="M0 -18 L4 -4 L18 0 L4 4 L0 18 L-4 4 L-18 0 L-4 -4 Z"
      fill={TOKENS.ink}
    />
    <Circle r={3.2} fill="rgba(0,0,0,0.55)" />
  </G>
);

// Import Path as SvgPath separately to avoid name shadow
import { Path as SvgPath } from 'react-native-svg';

export const CardFrame = memo(function CardFrame({
  cornerGlyph,
  footer,
  showVignette = true,
}: CardFrameProps) {
  return (
    <Svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      {/* Cream cardstock body */}
      <Rect x={0} y={0} width={W} height={H} rx={R} ry={R} fill={TOKENS.cardstock} />

      {/* Outer keyline */}
      <Rect
        x={10}
        y={10}
        width={W - 20}
        height={H - 20}
        rx={16}
        ry={16}
        fill="none"
        stroke={TOKENS.inkLine}
        strokeWidth={1}
      />
      {/* Inner keyline */}
      <Rect
        x={16}
        y={16}
        width={W - 32}
        height={H - 32}
        rx={12}
        ry={12}
        fill="none"
        stroke={TOKENS.inkSoft}
        strokeWidth={0.5}
      />

      <Corner glyph={cornerGlyph} />
      <Corner glyph={cornerGlyph} flip />

      {showVignette && (
        <G transform={`translate(${W / 2} ${H / 2 - 30})`}>
          <Circle r={112} fill="none" stroke={TOKENS.inkLine} strokeWidth={1.25} />
          <Circle r={92} fill="none" stroke={TOKENS.inkSoft} strokeWidth={0.5} />
        </G>
      )}

      {/* Footer baseline */}
      <G transform={`translate(${W / 2} ${H - 40})`}>
        <Line x1={-120} y1={0} x2={120} y2={0} stroke="rgba(10,10,12,0.55)" strokeWidth={0.5} />
        <SvgText
          y={15}
          textAnchor="middle"
          fontFamily="Menlo, ui-monospace, monospace"
          fontSize={7.5}
          letterSpacing={3.4}
          fill="rgba(10,10,12,0.7)"
        >
          {footer}
        </SvgText>
      </G>
    </Svg>
  );
});
```

**Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 3: Commit**

```bash
git add components/IridescentCard/CardFrame.tsx
git commit -m "feat(iridescent-card): SVG specimen frame (keylines + corners + footer)"
```

---

## Task 4: CardFace shell — frame + image slot, no effects yet

**Files:**
- Create: `components/IridescentCard/CardFace.tsx`

**Step 1: Write the file**

```tsx
// components/IridescentCard/CardFace.tsx
import { type ReactNode, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image, type ImageSource } from 'expo-image';

import { CardFrame } from './CardFrame';
import { TOKENS } from './tokens';

export type CardFaceProps = {
  cornerGlyph: string;
  footer: string;
} & (
  | { variant: 'front'; image: ImageSource | number; accessibilityLabel: string }
  | { variant: 'back'; children: ReactNode }
);

export const CardFace = memo(function CardFace(props: CardFaceProps) {
  return (
    <View style={styles.face}>
      <View style={StyleSheet.absoluteFill}>
        <CardFrame
          cornerGlyph={props.cornerGlyph}
          footer={props.footer}
          showVignette={props.variant === 'front'}
        />
      </View>

      {props.variant === 'front' ? (
        <View style={styles.vignetteHost} pointerEvents="none">
          <Image
            source={props.image}
            style={styles.vignetteImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={400}
            preferHighDynamicRange
            accessibilityLabel={props.accessibilityLabel}
          />
        </View>
      ) : (
        <View style={styles.backContent}>{props.children}</View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  face: {
    width: '100%',
    height: '100%',
    backgroundColor: TOKENS.cardstock,
    borderRadius: TOKENS.cornerRadius,
    overflow: 'hidden',
  },
  vignetteHost: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 224,
    height: 224,
    marginLeft: -112,
    marginTop: -142, // pulls vignette slightly above center to leave room for footer
    borderRadius: 112,
    overflow: 'hidden',
  },
  vignetteImage: {
    width: '100%',
    height: '100%',
  },
  backContent: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: 60,
    bottom: 60,
  },
});
```

**Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 3: Commit**

```bash
git add components/IridescentCard/CardFace.tsx
git commit -m "feat(iridescent-card): CardFace shell with front-image vignette and back slot"
```

---

## Task 5: IridescentCard public component (static — no tilt, no effects, no flip yet)

This is the first task that renders to the screen. We're building bottom-up; at the end of this task, swap `app/index.tsx` to render `<IridescentCard>` instead of FlipCard so we have a visual checkpoint to judge.

**Files:**
- Create: `components/IridescentCard/index.tsx`
- Modify: `app/index.tsx` (replace FlipCard block)

**Step 1: Write the static IridescentCard**

```tsx
// components/IridescentCard/index.tsx
import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { type DailyFlower } from '@/lib/dailyFlower';
import { CardFace } from './CardFace';
import { TOKENS } from './tokens';

export type IridescentCardProps = {
  flower: DailyFlower;
  width: number;
  height: number;
};

const MONTH_INITIAL: Record<number, string> = {
  1: 'J', 2: 'F', 3: 'M', 4: 'A', 5: 'M', 6: 'J',
  7: 'J', 8: 'A', 9: 'S', 10: 'O', 11: 'N', 12: 'D',
};

function dayOfYear(iso: string): number {
  const d = new Date(iso + 'T12:00:00');
  const start = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / 86_400_000);
}

export const IridescentCard = memo(function IridescentCard({
  flower,
  width,
  height,
}: IridescentCardProps) {
  const month = Number(flower.date.slice(5, 7));
  const cornerGlyph = MONTH_INITIAL[month] ?? '*';
  const frontFooter = `SPECIMEN · ${flower.latin.toUpperCase()}`;
  const backFooter = useMemo(() => {
    const n = dayOfYear(flower.date).toString().padStart(3, '0');
    return `N° ${n} / 365 — IRIDESCENT STOCK`;
  }, [flower.date]);

  return (
    <View style={[styles.host, { width, height }]}>
      <View style={[styles.shadow, { borderRadius: TOKENS.cornerRadius }]} />
      <CardFace
        variant="front"
        image={flower.imageSource}
        accessibilityLabel={flower.common}
        cornerGlyph={cornerGlyph}
        footer={frontFooter}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    alignSelf: 'center',
  },
  shadow: {
    position: 'absolute',
    inset: 0,
    boxShadow:
      '0px 30px 60px rgba(0,0,0,0.65), 0px 12px 24px rgba(0,0,0,0.55)',
  },
});
```

**Step 2: Wire into `app/index.tsx`**

Open `app/index.tsx` and locate the block starting `{state.status === 'ok' && (` containing `<FlipCard>`. Replace that entire block (FlipCard with its two `<View style={styles.face}>` children) with:

```tsx
{state.status === 'ok' && (
  <IridescentCard
    flower={state.flower}
    width={cardW}
    height={cardH}
  />
)}
```

At the top of `app/index.tsx`:
- Remove: `import FlipCard from 'react-native-flip-card';`
- Add: `import { IridescentCard } from '@/components/IridescentCard';`
- Remove unused imports if any: `LinearGradient` may now be unused — verify with typecheck.

**Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 4: 🟢 VISUAL MILESTONE 1 — boot web and judge**

```bash
pnpm exec expo start --web --port 8081
```

Manually open `http://localhost:8081` in a browser. Expected to see:

- Cream cardstock card centered on dark background
- Double keyline borders
- "M" in upper-left, rotated "M" in lower-right
- Flower image in circular vignette, centered
- "SPECIMEN · {LATIN NAME}" footer
- No iridescence yet — that's correct

Compare side-by-side with `/tmp/design-pkg/iridescent-card/project/Iridescent Card.html` (open it directly in another browser tab — it's self-contained). The card should match the prototype's static state (no hover).

If layout is off, fix `CardFace.tsx` / `CardFrame.tsx` before continuing. Stop the dev server with `Ctrl+C`.

**Step 5: Commit**

```bash
git add components/IridescentCard/index.tsx app/index.tsx
git commit -m "feat(iridescent-card): static front face wired into home screen"
```

---

## Task 6: useCardTilt hook — gyro + pan + pointer → SharedValue

**Files:**
- Create: `components/IridescentCard/useCardTilt.ts`

**Step 1: Write the hook**

```ts
// components/IridescentCard/useCardTilt.ts
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { DeviceMotion } from 'expo-sensors';

export type TiltValues = {
  /** Pointer x in [0..1] — left to right across the card. */
  x: import('react-native-reanimated').SharedValue<number>;
  /** Pointer y in [0..1] — top to bottom. */
  y: import('react-native-reanimated').SharedValue<number>;
  /** Hover/active state in [0..1] — eased toward 1 when touching, 0 otherwise. */
  hov: import('react-native-reanimated').SharedValue<number>;
  /** Gesture to attach to the card's GestureDetector. */
  panGesture: ReturnType<typeof Gesture.Pan>;
};

/**
 * Three input signals → one set of normalized shared values.
 * Last-touched wins for ~600ms after touch end, then gyro takes over.
 * On web desktop, pointer events drive `x`/`y` directly via {@link bindPointer}.
 */
export function useCardTilt(): TiltValues & {
  bindPointer: (host: HTMLElement | null) => void;
} {
  const x = useSharedValue(0.5);
  const y = useSharedValue(0.5);
  const hov = useSharedValue(0);
  // Used to suppress gyro briefly after a touch release
  const touchLockUntil = useSharedValue(0);

  // ── Pan (touch) ───────────────────────────────────────────
  const panGesture = Gesture.Pan()
    .onBegin(() => {
      hov.value = withTiming(1, { duration: 120 });
    })
    .onUpdate((e) => {
      'worklet';
      // We can't know the card's bounding rect inside the worklet without
      // measuring upstream; consumer of the hook is responsible for setting
      // initial size via x/y normalization. Here, e.x and e.y are local to
      // the GestureDetector, so we normalize against shared size set below.
      const w = panSize.value.w || 1;
      const h = panSize.value.h || 1;
      x.value = Math.max(0, Math.min(1, e.x / w));
      y.value = Math.max(0, Math.min(1, e.y / h));
    })
    .onEnd(() => {
      hov.value = withTiming(0, { duration: 400 });
      touchLockUntil.value = Date.now() + 600;
      // Drift back toward center
      x.value = withTiming(0.5, { duration: 400 });
      y.value = withTiming(0.5, { duration: 400 });
    });

  // Shared values mutated by the consumer via `onLayout`
  const panSize = useSharedValue({ w: 1, h: 1 });

  // Attach a layout setter to the gesture by closure
  (panGesture as unknown as { _setSize?: (w: number, h: number) => void })._setSize =
    (w, h) => {
      panSize.value = { w, h };
    };

  // ── Gyro (idle) ───────────────────────────────────────────
  useEffect(() => {
    if (Platform.OS === 'web') return; // pointer handles web
    let sub: { remove: () => void } | undefined;
    let mounted = true;
    (async () => {
      const available = await DeviceMotion.isAvailableAsync();
      if (!available || !mounted) return;
      DeviceMotion.setUpdateInterval(60);
      sub = DeviceMotion.addListener((data) => {
        if (Date.now() < touchLockUntil.value) return;
        const tilt = data.rotation;
        if (!tilt) return;
        // β = pitch (front-back), γ = roll (left-right)
        // Map ±π/4 → [0..1]
        const QUARTER = Math.PI / 4;
        const nx = 0.5 + Math.max(-1, Math.min(1, (tilt.gamma ?? 0) / QUARTER)) * 0.5;
        const ny = 0.5 + Math.max(-1, Math.min(1, (tilt.beta ?? 0) / QUARTER)) * 0.5;
        x.value = withTiming(nx, { duration: 200 });
        y.value = withTiming(ny, { duration: 200 });
      });
    })();
    return () => {
      mounted = false;
      sub?.remove();
    };
  }, [touchLockUntil, x, y]);

  // ── Pointer (web only) ────────────────────────────────────
  const bindPointer = (host: HTMLElement | null) => {
    if (Platform.OS !== 'web') return;
    if (!host) return;
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x.value = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      y.value = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
    };
    const onEnter = () => {
      hov.value = withTiming(1, { duration: 200 });
    };
    const onLeave = () => {
      hov.value = withTiming(0, { duration: 400 });
      x.value = withTiming(0.5, { duration: 400 });
      y.value = withTiming(0.5, { duration: 400 });
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerenter', onEnter);
    host.addEventListener('pointerleave', onLeave);
    // Caller must manually unbind by passing null on unmount; we keep
    // this hook return small. For now, leaks are acceptable on web
    // since the host is the long-lived screen.
  };

  return { x, y, hov, panGesture, bindPointer };
}
```

**Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes. If `react-native-gesture-handler` types are missing, install: `pnpm add -D @types/react-native-gesture-handler` (likely not needed; the package ships its own types).

**Step 3: Commit**

```bash
git add components/IridescentCard/useCardTilt.ts
git commit -m "feat(iridescent-card): useCardTilt hook (gyro + pan + web pointer)"
```

---

## Task 7: Apply 3D tilt transform to the card

**Files:**
- Modify: `components/IridescentCard/index.tsx`

**Step 1: Update `IridescentCard` to use the hook and animate transform**

Replace the entire contents of `components/IridescentCard/index.tsx` with:

```tsx
// components/IridescentCard/index.tsx
import { memo, useCallback, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';

import { type DailyFlower } from '@/lib/dailyFlower';
import { CardFace } from './CardFace';
import { TOKENS } from './tokens';
import { useCardTilt } from './useCardTilt';

export type IridescentCardProps = {
  flower: DailyFlower;
  width: number;
  height: number;
};

const MONTH_INITIAL: Record<number, string> = {
  1: 'J', 2: 'F', 3: 'M', 4: 'A', 5: 'M', 6: 'J',
  7: 'J', 8: 'A', 9: 'S', 10: 'O', 11: 'N', 12: 'D',
};

function dayOfYear(iso: string): number {
  const d = new Date(iso + 'T12:00:00');
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86_400_000);
}

export const IridescentCard = memo(function IridescentCard({
  flower,
  width,
  height,
}: IridescentCardProps) {
  const { x, y, hov, panGesture, bindPointer } = useCardTilt();

  const month = Number(flower.date.slice(5, 7));
  const cornerGlyph = MONTH_INITIAL[month] ?? '*';
  const frontFooter = `SPECIMEN · ${flower.latin.toUpperCase()}`;
  const backFooter = useMemo(() => {
    const n = dayOfYear(flower.date).toString().padStart(3, '0');
    return `N° ${n} / 365 — IRIDESCENT STOCK`;
  }, [flower.date]);

  // Derived tilt angles
  const rx = useDerivedValue(() => interpolate(y.value, [0, 1], [TOKENS.tiltAmount, -TOKENS.tiltAmount]) * hov.value);
  const ry = useDerivedValue(() => interpolate(x.value, [0, 1], [-TOKENS.tiltAmount, TOKENS.tiltAmount]) * hov.value);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: TOKENS.perspective },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
    ],
  }));

  // Web pointer binding (no-op on native)
  const hostRef = useRef<View | null>(null);
  const onHostLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width: w, height: h } = e.nativeEvent.layout;
      // Tell pan gesture about size
      (panGesture as unknown as { _setSize?: (w: number, h: number) => void })._setSize?.(w, h);
    },
    [panGesture],
  );
  const webRef = useCallback(
    (node: View | null) => {
      hostRef.current = node;
      if (Platform.OS === 'web' && node) {
        bindPointer(node as unknown as HTMLElement);
      }
    },
    [bindPointer],
  );

  return (
    <View style={[styles.host, { width, height }]} ref={webRef} onLayout={onHostLayout}>
      <View style={[styles.shadow, { borderRadius: TOKENS.cornerRadius }]} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.cardWrap, animatedStyle]}>
          <CardFace
            variant="front"
            image={flower.imageSource}
            accessibilityLabel={flower.common}
            cornerGlyph={cornerGlyph}
            footer={frontFooter}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    alignSelf: 'center',
  },
  shadow: {
    position: 'absolute',
    inset: 0,
    boxShadow:
      '0px 30px 60px rgba(0,0,0,0.65), 0px 12px 24px rgba(0,0,0,0.55)',
  },
  cardWrap: {
    width: '100%',
    height: '100%',
  },
});
```

**Step 2: Ensure `GestureHandlerRootView` wraps the app**

Open `app/_layout.tsx` and verify it has `GestureHandlerRootView` at the root. If not, modify:

```tsx
// app/_layout.tsx — add this import
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Wrap the existing ThemeProvider tree:
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="+not-found" options={{ headerShown: true }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

**Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 4: 🟢 VISUAL MILESTONE 2 — tilt only**

```bash
pnpm exec expo start --web --port 8081
```

Move the mouse over the card on web. Expected:
- Card tilts toward / away from the cursor (3D perspective)
- Smooth easing on enter/leave
- No iridescence yet

If tilt doesn't track or feels wrong, debug before continuing. Stop server.

**Step 5: Commit**

```bash
git add components/IridescentCard/index.tsx app/_layout.tsx
git commit -m "feat(iridescent-card): 3D tilt via pan + web pointer + reanimated"
```

---

## Task 8: Skia overlay scaffold — empty canvas on top of card

This task wires up Skia without drawing anything yet — just to confirm the canvas is positioned correctly and doesn't break the build.

**Files:**
- Create: `components/IridescentCard/CardEffects.tsx`
- Modify: `components/IridescentCard/index.tsx`

**Step 1: Create the Skia canvas component**

```tsx
// components/IridescentCard/CardEffects.tsx
import { memo } from 'react';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import { type SharedValue } from 'react-native-reanimated';

import { TOKENS } from './tokens';

export type CardEffectsProps = {
  width: number;
  height: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  hov: SharedValue<number>;
};

export const CardEffects = memo(function CardEffects({
  width,
  height,
}: CardEffectsProps) {
  return (
    <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
      {/* Placeholder: confirms canvas renders inside card bounds */}
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={height}
        r={TOKENS.cornerRadius}
        color="rgba(255,0,0,0.0)"
      />
    </Canvas>
  );
});
```

**Step 2: Mount it inside the CardFace stack** — modify `components/IridescentCard/index.tsx`, adding the Skia overlay inside the `<Animated.View>`:

```tsx
// Inside the GestureDetector → Animated.View, AFTER <CardFace ... />:
<View style={StyleSheet.absoluteFill} pointerEvents="none">
  <CardEffects width={width} height={height} x={x} y={y} hov={hov} />
</View>
```

Import at top: `import { CardEffects } from './CardEffects';`

**Step 3: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 4: 🟢 VISUAL MILESTONE 3 — Skia present, no regressions**

```bash
pnpm exec expo start --web --port 8081
```

Expected: card still renders identically; first-load may pause briefly while CanvasKit WASM loads (~2-3MB). Open DevTools Network tab to confirm CanvasKit loads without 404. Tilt still works.

Stop server.

**Step 5: Commit**

```bash
git add components/IridescentCard/CardEffects.tsx components/IridescentCard/index.tsx
git commit -m "feat(iridescent-card): mount empty Skia canvas overlay"
```

---

## Task 9: Skia layer 1 — Specular highlight (radial white bloom)

We add the easiest layer first to validate the Skia + Reanimated wiring, then build up.

**Files:**
- Modify: `components/IridescentCard/CardEffects.tsx`

**Step 1: Add specular layer**

Replace `CardEffects.tsx` with:

```tsx
import { memo } from 'react';
import {
  Canvas,
  RoundedRect,
  Group,
  RadialGradient,
  vec,
  BlendMode,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { TOKENS } from './tokens';

export type CardEffectsProps = {
  width: number;
  height: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  hov: SharedValue<number>;
};

export const CardEffects = memo(function CardEffects({
  width,
  height,
  x,
  y,
  hov,
}: CardEffectsProps) {
  const cx = useDerivedValue(() => x.value * width);
  const cy = useDerivedValue(() => y.value * height);
  const specularRadius = useDerivedValue(
    () => Math.max(width, height) * TOKENS.specularSize,
  );
  const specularOpacity = useDerivedValue(
    () => (0.55 + hov.value * 0.45) * TOKENS.specularIntensity,
  );

  return (
    <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
      <Group
        layer
        clip={
          <RoundedRect x={0} y={0} width={width} height={height} r={TOKENS.cornerRadius} />
        }
      >
        {/* Specular highlight — radial white bloom, soft-light blend */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={TOKENS.cornerRadius}
          opacity={specularOpacity}
          blendMode={BlendMode.SoftLight}
        >
          <RadialGradient
            c={vec(cx, cy)}
            r={specularRadius}
            colors={[
              'rgba(255,255,255,0.95)',
              'rgba(255,255,255,0.55)',
              'rgba(255,255,255,0.18)',
              'rgba(255,255,255,0)',
            ]}
            positions={[0, 0.1, 0.28, 0.6]}
          />
        </RoundedRect>
      </Group>
    </Canvas>
  );
});
```

**Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes. Skia type names (`vec`, `BlendMode`) verified against the v2 API.

**Step 3: 🟢 VISUAL MILESTONE 4 — specular visible**

```bash
pnpm exec expo start --web --port 8081
```

Move the mouse around the card. Expected:
- A soft white bloom follows the cursor
- The bloom is subtle on the dark image areas, brighter on cream cardstock
- The bloom intensifies on hover (driven by `hov`)

Stop server.

**Step 4: Commit**

```bash
git add components/IridescentCard/CardEffects.tsx
git commit -m "feat(iridescent-card): specular highlight layer (soft-light radial bloom)"
```

---

## Task 10: Skia layer 2 — Iridescent primary (radial HSL color-dodge)

**Files:**
- Modify: `components/IridescentCard/CardEffects.tsx`

**Step 1: Add iridescent primary layer**

Add **before** the specular RoundedRect inside the `<Group>` block:

```tsx
// Need to add imports at top:
// import { Skia } from '@shopify/react-native-skia';

// Hue cycle from pointer position
const hue = useDerivedValue(
  () =>
    (TOKENS.hueOffset + x.value * TOKENS.hueSpread + y.value * TOKENS.hueSpread * 0.4) % 360,
);

// Derived colors — 5 stops with shifted hue
const iridescentColors = useDerivedValue(() => {
  const h = hue.value;
  const i = TOKENS.iridescenceIntensity;
  return [
    `hsla(${h.toFixed(0)}, 100%, 70%, ${0.55 * i})`,
    `hsla(${((h + 60) % 360).toFixed(0)}, 100%, 60%, ${0.45 * i})`,
    `hsla(${((h + 130) % 360).toFixed(0)}, 100%, 55%, ${0.40 * i})`,
    `hsla(${((h + 220) % 360).toFixed(0)}, 100%, 60%, ${0.35 * i})`,
    `hsla(${((h + 310) % 360).toFixed(0)}, 100%, 65%, ${0.30 * i})`,
  ];
});
const iridescentRadius = useDerivedValue(() => Math.max(width, height) * 1.1);
const iridescentOpacity = useDerivedValue(() => 0.25 + hov.value * 0.85);

// In JSX, BEFORE specular:
<RoundedRect
  x={0}
  y={0}
  width={width}
  height={height}
  r={TOKENS.cornerRadius}
  opacity={iridescentOpacity}
  blendMode={BlendMode.ColorDodge}
>
  <RadialGradient
    c={vec(cx, cy)}
    r={iridescentRadius}
    colors={iridescentColors}
    positions={[0, 0.22, 0.42, 0.65, 1]}
  />
</RoundedRect>
```

**Step 2: Typecheck**

```bash
pnpm typecheck
```

Expected: passes.

**Step 3: 🟢 VISUAL MILESTONE 5 — iridescent color shift**

```bash
pnpm exec expo start --web --port 8081
```

Move mouse around. Expected:
- Cream cardstock now shimmers with cyan/magenta/gold hues
- Hue shifts as cursor moves
- Effect is most visible on the bright (light) areas — color-dodge has no effect on pure black
- Specular bloom still visible on top

If hues look wrong or banding is harsh, adjust stops/opacities in `TOKENS` rather than the component.

Stop server.

**Step 4: Commit**

```bash
git add components/IridescentCard/CardEffects.tsx
git commit -m "feat(iridescent-card): iridescent radial layer (color-dodge HSL)"
```

---

## Task 11: Skia layer 3 — Iridescent secondary (sweep / conic)

**Files:**
- Modify: `components/IridescentCard/CardEffects.tsx`

**Step 1: Add sweep gradient layer**

Add imports: `SweepGradient`. Then add **before** primary iridescent (so it renders behind):

```tsx
const sweepColors = useDerivedValue(() => {
  const h = hue.value;
  const i = TOKENS.iridescenceIntensity;
  return [
    `hsla(${h.toFixed(0)}, 100%, 70%, ${0.22 * i})`,
    `hsla(${((h + 60) % 360).toFixed(0)}, 100%, 65%, ${0.22 * i})`,
    `hsla(${((h + 140) % 360).toFixed(0)}, 100%, 60%, ${0.22 * i})`,
    `hsla(${((h + 220) % 360).toFixed(0)}, 100%, 65%, ${0.22 * i})`,
    `hsla(${((h + 300) % 360).toFixed(0)}, 100%, 70%, ${0.22 * i})`,
    `hsla(${((h + 360) % 360).toFixed(0)}, 100%, 70%, ${0.22 * i})`,
  ];
});
const sweepOpacity = useDerivedValue(() => 0.15 + hov.value * 0.55);

// In JSX, BEFORE primary iridescent:
<RoundedRect
  x={0}
  y={0}
  width={width}
  height={height}
  r={TOKENS.cornerRadius}
  opacity={sweepOpacity}
  blendMode={BlendMode.Overlay}
>
  <SweepGradient c={vec(cx, cy)} colors={sweepColors} />
</RoundedRect>
```

**Step 2: Typecheck + visual**

```bash
pnpm typecheck && pnpm exec expo start --web --port 8081
```

🟢 **VISUAL MILESTONE 6** — expect spectral arc as you move the cursor around the card. Stop server.

**Step 3: Commit**

```bash
git add components/IridescentCard/CardEffects.tsx
git commit -m "feat(iridescent-card): sweep iridescent layer (conic overlay)"
```

---

## Task 12: Skia layer 4 — Perlin noise film grain

**Files:**
- Modify: `components/IridescentCard/CardEffects.tsx`

**Step 1: Add Perlin grain layer**

Import: `Turbulence`, `Shader`. Add **after** all iridescent layers but **before** specular:

```tsx
<RoundedRect
  x={0}
  y={0}
  width={width}
  height={height}
  r={TOKENS.cornerRadius}
  opacity={TOKENS.noiseOpacity}
  blendMode={BlendMode.Overlay}
>
  <Turbulence
    freqX={TOKENS.noiseScale}
    freqY={TOKENS.noiseScale}
    octaves={2}
    seed={7}
  />
</RoundedRect>
```

**Step 2: Typecheck + visual**

🟢 **VISUAL MILESTONE 7** — expect subtle film-grain texture across the card surface. Should not feel noisy — it's a finishing layer, ~22% opacity. Stop server.

**Step 3: Commit**

```bash
git add components/IridescentCard/CardEffects.tsx
git commit -m "feat(iridescent-card): Perlin turbulence grain layer"
```

---

## Task 13: Outer glow behind card

**Files:**
- Modify: `components/IridescentCard/index.tsx` — add Skia canvas behind the card for the glow

**Step 1: Create a separate Skia canvas for the outer glow**

Add a new component `components/IridescentCard/CardGlow.tsx`:

```tsx
import { memo } from 'react';
import {
  Canvas,
  RoundedRect,
  RadialGradient,
  vec,
  Blur,
} from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { TOKENS } from './tokens';

export type CardGlowProps = {
  width: number;
  height: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
  hov: SharedValue<number>;
};

const PAD = 40;

export const CardGlow = memo(function CardGlow({
  width,
  height,
  x,
  y,
  hov,
}: CardGlowProps) {
  const cx = useDerivedValue(() => x.value * width + PAD);
  const cy = useDerivedValue(() => y.value * height + PAD);
  const glowOpacity = useDerivedValue(() => hov.value * TOKENS.glowIntensity);
  const hue = useDerivedValue(
    () =>
      (TOKENS.hueOffset + x.value * TOKENS.hueSpread + y.value * TOKENS.hueSpread * 0.4) % 360,
  );
  const colors = useDerivedValue(() => {
    const h = hue.value;
    return [
      `hsla(${h.toFixed(0)}, 95%, 65%, 0.9)`,
      `hsla(${((h + 60) % 360).toFixed(0)}, 95%, 60%, 0.6)`,
      'rgba(0,0,0,0)',
    ];
  });

  return (
    <Canvas
      style={{
        position: 'absolute',
        left: -PAD,
        top: -PAD,
        width: width + PAD * 2,
        height: height + PAD * 2,
      }}
      pointerEvents="none"
    >
      <RoundedRect
        x={0}
        y={0}
        width={width + PAD * 2}
        height={height + PAD * 2}
        r={32}
        opacity={glowOpacity}
      >
        <RadialGradient
          c={vec(cx, cy)}
          r={TOKENS.glowSize}
          colors={colors}
          positions={[0, 0.35, 0.75]}
        />
        <Blur blur={18} />
      </RoundedRect>
    </Canvas>
  );
});
```

**Step 2: Mount glow BEHIND the card** in `IridescentCard/index.tsx`:

```tsx
// At the top of return, BEFORE the shadow:
<View style={StyleSheet.absoluteFill} pointerEvents="none">
  <CardGlow width={width} height={height} x={x} y={y} hov={hov} />
</View>
```

Import: `import { CardGlow } from './CardGlow';`

**Step 3: Typecheck + visual**

🟢 **VISUAL MILESTONE 8** — expect a soft, hue-cycling glow halo behind the card when the cursor is over it. Stop server.

**Step 4: Commit**

```bash
git add components/IridescentCard/CardGlow.tsx components/IridescentCard/index.tsx
git commit -m "feat(iridescent-card): outer hue-cycling glow behind card"
```

---

## Task 14: Flip mechanic + back face

**Files:**
- Modify: `components/IridescentCard/index.tsx`
- Optional: extract back content into its own component if it grows.

**Step 1: Add flip state and second face**

Modify `IridescentCard/index.tsx`:

```tsx
// Add to imports:
import { Pressable, Text } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Inside the component, alongside the tilt hook:
const flip = useSharedValue(0); // 0 = front, 1 = back
const flipped = useRef(false);
const onPress = useCallback(() => {
  flipped.current = !flipped.current;
  flip.value = withTiming(flipped.current ? 1 : 0, {
    duration: 600,
    easing: Easing.bezier(0.4, 0.0, 0.2, 1),
  });
}, [flip]);

// Front face style — visible when flip < 0.5
const frontStyle = useAnimatedStyle(() => ({
  transform: [
    { perspective: TOKENS.perspective },
    { rotateX: `${rx.value}deg` },
    { rotateY: `${interpolate(flip.value, [0, 1], [0, 180]) + ry.value}deg` },
  ],
  opacity: flip.value < 0.5 ? 1 : 0,
}));

// Back face — pre-rotated 180°, visible when flip > 0.5
const backStyle = useAnimatedStyle(() => ({
  transform: [
    { perspective: TOKENS.perspective },
    { rotateX: `${rx.value}deg` },
    { rotateY: `${interpolate(flip.value, [0, 1], [180, 360]) + ry.value}deg` },
  ],
  opacity: flip.value >= 0.5 ? 1 : 0,
}));
```

**Step 2: Update render** — replace the single Animated.View with a Pressable wrapping both faces:

```tsx
<Pressable onPress={onPress} style={{ width: '100%', height: '100%' }}>
  <GestureDetector gesture={panGesture}>
    <View style={{ width: '100%', height: '100%' }}>
      {/* Front face */}
      <Animated.View style={[styles.cardWrap, frontStyle, { backfaceVisibility: 'hidden' }]}>
        <CardFace
          variant="front"
          image={flower.imageSource}
          accessibilityLabel={flower.common}
          cornerGlyph={cornerGlyph}
          footer={frontFooter}
        />
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <CardEffects width={width} height={height} x={x} y={y} hov={hov} />
        </View>
      </Animated.View>

      {/* Back face */}
      <Animated.View style={[styles.cardWrap, styles.cardWrapAbs, backStyle, { backfaceVisibility: 'hidden' }]}>
        <CardFace
          variant="back"
          cornerGlyph={cornerGlyph}
          footer={backFooter}
        >
          <Text style={styles.backCommon}>{flower.common}</Text>
          <Text style={styles.backLatin}>{flower.latin}</Text>
          <View style={styles.backDivider} />
          <Text style={styles.backBlurb}>{flower.blurb}</Text>
        </CardFace>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <CardEffects width={width} height={height} x={x} y={y} hov={hov} />
        </View>
      </Animated.View>
    </View>
  </GestureDetector>
</Pressable>
```

Add styles:

```ts
cardWrapAbs: {
  position: 'absolute',
  inset: 0,
},
backCommon: {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  fontSize: 28,
  color: TOKENS.ink,
  lineHeight: 34,
},
backLatin: {
  fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }),
  fontStyle: 'italic',
  fontSize: 14,
  color: 'rgba(10,10,12,0.65)',
  marginTop: 4,
},
backDivider: {
  width: 56,
  height: StyleSheet.hairlineWidth,
  backgroundColor: 'rgba(10,10,12,0.35)',
  marginVertical: 14,
},
backBlurb: {
  fontSize: 14,
  lineHeight: 21,
  color: 'rgba(10,10,12,0.88)',
},
```

**Step 3: Typecheck + visual**

🟢 **VISUAL MILESTONE 9** — tap the card; it should flip with a smooth Y-axis rotation. Back side shows serif species info on the same cream cardstock with full iridescent treatment. Stop server.

**Step 4: Commit**

```bash
git add components/IridescentCard/index.tsx
git commit -m "feat(iridescent-card): tap-to-flip with iridescent back face"
```

---

## Task 15: Final pass — judge against prototype, tune tokens

**Files:**
- Modify: `components/IridescentCard/tokens.ts` (only if needed)

**Step 1: Side-by-side comparison**

Open in two browser windows:
1. Our app: `pnpm exec expo start --web --port 8081` → `http://localhost:8081`
2. Prototype: `open '/tmp/design-pkg/iridescent-card/project/Iridescent Card.html'`

Move cursor over both at the same position. Compare:

- [ ] Tilt range looks similar (not too aggressive, not too subtle)
- [ ] Iridescent color travel covers similar hue arc
- [ ] Specular bloom is the right size and softness
- [ ] Grain is barely-noticeable, not gritty
- [ ] Glow behind card has hue cycling
- [ ] Edge feels foil-stamped, not flat

**Step 2: Adjust tokens** only — do NOT change layer code. Increment / decrement values in `tokens.ts` and reload.

**Step 3: Final commit** (if any token changes)

```bash
git add components/IridescentCard/tokens.ts
git commit -m "feat(iridescent-card): final token tuning to match prototype"
```

**Step 4: Verify final state**

```bash
pnpm typecheck
git log --oneline | head -20
```

Expected: clean typecheck, ~15 commits since the design doc.

---

## Done criteria

- [ ] `pnpm typecheck` passes
- [ ] `pnpm web` boots and the home screen renders the iridescent card
- [ ] Card responds to pointer / pan / gyro (on supported targets)
- [ ] Tap flips to species info on the same iridescent stock
- [ ] Visual fidelity is judged "close enough" to the prototype HTML
- [ ] All commits land in granular, revertable chunks

## Out of scope (for follow-up)

- Native iOS build (blocked by iOS 26.5 SDK install)
- Tweaks panel UI for live token adjustment
- Multiple card art variants (`ace`, `monogram`, `compass`, `grid`)
- Performance profiling on low-end Android
- Web bundle size optimization (Skia WASM is ~2.5 MB)
