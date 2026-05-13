// components/IridescentCard/CardEffects.tsx
// Skia overlay rendering iridescent foil effects layered over the card face.
// Layer order (back → front): TBD as layers are added.
import { memo } from 'react';
import {
  Canvas,
  Group,
  RadialGradient,
  RoundedRect,
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

  return (
    <Canvas
      style={{ position: 'absolute', width, height }}
      pointerEvents="none"
    >
      <Group>
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
