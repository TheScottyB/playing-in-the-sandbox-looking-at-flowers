// components/IridescentCard/index.tsx
import { memo, useCallback } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { type DailyFlower } from '@/lib/dailyFlower';

import { CardEffects } from './CardEffects';
import { CardFace } from './CardFace';
import { CardGlow } from './CardGlow';
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

export const IridescentCard = memo(function IridescentCard({
  flower,
  width,
  height,
}: IridescentCardProps) {
  const month = Number(flower.date.slice(5, 7));
  const cornerGlyph = MONTH_INITIAL[month] ?? '*';
  const frontFooter = `SPECIMEN · ${flower.latin.toUpperCase()}`;

  const { x, y, hov, panGesture, onLayoutSize, bindPointer } = useCardTilt();

  // rx/ry derive 3D rotation in degrees from normalized x/y. Faded by hov so
  // the card sits flat when not interacted with. Y maps to rotateX (pitch
  // around horizontal axis) with sign flip — cursor at top tilts the top
  // *toward* the viewer.
  const rx = useDerivedValue(
    () => interpolate(y.value, [0, 1], [TOKENS.tiltAmount, -TOKENS.tiltAmount]) * hov.value,
  );
  const ry = useDerivedValue(
    () => interpolate(x.value, [0, 1], [-TOKENS.tiltAmount, TOKENS.tiltAmount]) * hov.value,
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: TOKENS.perspective },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${ry.value}deg` },
    ],
  }));

  const onHostLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width: w, height: h } = e.nativeEvent.layout;
      onLayoutSize(w, h);
    },
    [onLayoutSize],
  );

  const webRef = useCallback(
    (node: View | null) => {
      if (Platform.OS !== 'web') return;
      // On web, react-native-web renders View as a DOM element; the ref is
      // the underlying HTMLElement.
      bindPointer(node as unknown as HTMLElement | null);
    },
    [bindPointer],
  );

  return (
    <View
      style={[styles.host, { width, height }]}
      ref={webRef}
      onLayout={onHostLayout}
    >
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CardGlow width={width} height={height} x={x} y={y} hov={hov} />
      </View>
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
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <CardEffects
              width={width}
              height={height}
              x={x}
              y={y}
              hov={hov}
            />
          </View>
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
