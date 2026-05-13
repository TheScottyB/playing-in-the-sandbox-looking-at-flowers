// components/IridescentCard/CardEffects.tsx
// Skia overlay scaffold for iridescent foil effects. Empty for now — layers
// (specular, iridescent radial, sweep, grain) will be added in subsequent
// commits.
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
    <Canvas
      style={{ position: 'absolute', width, height }}
      pointerEvents="none"
    >
      <RoundedRect
        x={0}
        y={0}
        width={width}
        height={height}
        r={TOKENS.cornerRadius}
        color="rgba(0,0,0,0)"
      />
    </Canvas>
  );
});
