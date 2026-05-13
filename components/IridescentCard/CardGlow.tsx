// components/IridescentCard/CardGlow.tsx
// Outer hue-cycling glow rendered BEHIND the card. A soft radial gradient
// follows the pointer and intensifies with hov, painted onto a padded
// transparent canvas so the blur halo extends past the card edges.
import { memo } from 'react';
import {
  Blur,
  Canvas,
  RadialGradient,
  RoundedRect,
  vec,
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
  const center = useDerivedValue(() => vec(cx.value, cy.value));
  const glowOpacity = useDerivedValue(
    () => hov.value * TOKENS.glowIntensity,
  );
  const hue = useDerivedValue(
    () =>
      (TOKENS.hueOffset +
        x.value * TOKENS.hueSpread +
        y.value * TOKENS.hueSpread * 0.4) %
      360,
  );
  const colors = useDerivedValue(() => {
    const h = hue.value;
    return [
      `hsla(${h.toFixed(0)}, 95%, 65%, 0.9)`,
      `hsla(${((h + 60) % 360).toFixed(0)}, 95%, 60%, 0.6)`,
      'rgba(0,0,0,0)',
    ];
  });

  const totalWidth = width + PAD * 2;
  const totalHeight = height + PAD * 2;

  return (
    <Canvas
      style={{
        position: 'absolute',
        left: -PAD,
        top: -PAD,
        width: totalWidth,
        height: totalHeight,
      }}
      pointerEvents="none"
    >
      <RoundedRect
        x={0}
        y={0}
        width={totalWidth}
        height={totalHeight}
        r={32}
        opacity={glowOpacity}
      >
        <RadialGradient
          c={center}
          r={TOKENS.glowSize}
          colors={colors}
          positions={[0, 0.35, 0.75]}
        />
        <Blur blur={18} />
      </RoundedRect>
    </Canvas>
  );
});
