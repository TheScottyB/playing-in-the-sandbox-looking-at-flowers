// components/IridescentCard/CardEffects.tsx
// Skia overlay rendering iridescent foil effects layered over the card face.
// Layer order (back → front): TBD as layers are added.
import { memo } from 'react';
import {
  Blur,
  Canvas,
  Group,
  RadialGradient,
  RoundedRect,
  SweepGradient,
  Turbulence,
  vec,
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
  // Pointer position in pixel space — drives gradient centers.
  const cx = useDerivedValue(() => x.value * width);
  const cy = useDerivedValue(() => y.value * height);
  const center = useDerivedValue(() => vec(cx.value, cy.value));

  // Specular: bright white radial bloom that follows the pointer. SoftLight
  // blend means it lifts midtones / brightens highlights without blowing out.
  const specularRadius = useDerivedValue(
    () => Math.max(width, height) * TOKENS.specularSize,
  );
  const specularOpacity = useDerivedValue(
    () => (0.55 + hov.value * 0.45) * TOKENS.specularIntensity,
  );

  // Iridescent primary: 5-stop HSL radial gradient that hue-cycles with the
  // pointer position. ColorDodge brightens underlying tones where the
  // gradient is light — gives the foil-rainbow effect.
  const hue = useDerivedValue(
    () =>
      (TOKENS.hueOffset +
        x.value * TOKENS.hueSpread +
        y.value * TOKENS.hueSpread * 0.4) %
      360,
  );
  const iridescentColors = useDerivedValue(() => {
    const h = hue.value;
    const i = TOKENS.iridescenceIntensity;
    return [
      `hsla(${h.toFixed(0)}, 100%, 70%, ${(0.55 * i).toFixed(3)})`,
      `hsla(${((h + 60) % 360).toFixed(0)}, 100%, 60%, ${(0.45 * i).toFixed(3)})`,
      `hsla(${((h + 130) % 360).toFixed(0)}, 100%, 55%, ${(0.4 * i).toFixed(3)})`,
      `hsla(${((h + 220) % 360).toFixed(0)}, 100%, 60%, ${(0.35 * i).toFixed(3)})`,
      `hsla(${((h + 310) % 360).toFixed(0)}, 100%, 65%, ${(0.3 * i).toFixed(3)})`,
    ];
  });
  const iridescentRadius = useDerivedValue(
    () => Math.max(width, height) * 1.1,
  );
  const iridescentOpacity = useDerivedValue(() => 0.25 + hov.value * 0.85);

  // Sweep (conic) iridescent: rendered behind the primary radial. Cycles
  // through 6 hue offsets and is softened by a 2px blur to mimic the
  // prototype's banded foil sheen.
  const sweepColors = useDerivedValue(() => {
    const h = hue.value;
    const a = (0.22 * TOKENS.iridescenceIntensity).toFixed(3);
    return [
      `hsla(${h.toFixed(0)}, 100%, 60%, ${a})`,
      `hsla(${((h + 60) % 360).toFixed(0)}, 100%, 60%, ${a})`,
      `hsla(${((h + 140) % 360).toFixed(0)}, 100%, 60%, ${a})`,
      `hsla(${((h + 220) % 360).toFixed(0)}, 100%, 60%, ${a})`,
      `hsla(${((h + 300) % 360).toFixed(0)}, 100%, 60%, ${a})`,
      `hsla(${((h + 360) % 360).toFixed(0)}, 100%, 60%, ${a})`,
    ];
  });
  const sweepOpacity = useDerivedValue(() => 0.15 + hov.value * 0.55);

  return (
    <Canvas
      style={{ position: 'absolute', width, height }}
      pointerEvents="none"
    >
      <Group>
        {/* Sweep iridescent — conic overlay (rendered behind the primary) */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={TOKENS.cornerRadius}
          opacity={sweepOpacity}
          blendMode="overlay"
        >
          <SweepGradient c={center} colors={sweepColors} />
          <Blur blur={2} />
        </RoundedRect>

        {/* Iridescent primary — radial HSL color-dodge */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={TOKENS.cornerRadius}
          opacity={iridescentOpacity}
          blendMode="colorDodge"
        >
          <RadialGradient
            c={center}
            r={iridescentRadius}
            colors={iridescentColors}
            positions={[0, 0.22, 0.42, 0.65, 1]}
          />
        </RoundedRect>

        {/* Perlin grain — micro-texture that breaks up the gradients and
            adds tactile foil feel. Static (no animation) — drawn between
            iridescent layers and specular so it modulates both. */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={TOKENS.cornerRadius}
          opacity={TOKENS.noiseOpacity}
          blendMode="overlay"
        >
          <Turbulence
            freqX={TOKENS.noiseScale}
            freqY={TOKENS.noiseScale}
            octaves={2}
            seed={7}
          />
        </RoundedRect>

        {/* Specular highlight — radial white bloom */}
        <RoundedRect
          x={0}
          y={0}
          width={width}
          height={height}
          r={TOKENS.cornerRadius}
          opacity={specularOpacity}
          blendMode="softLight"
        >
          <RadialGradient
            c={center}
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
