// components/IridescentCard/index.tsx
import { memo, useCallback, useMemo, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
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
  const month = Number(flower.date.slice(5, 7));
  const cornerGlyph = MONTH_INITIAL[month] ?? '*';
  const frontFooter = `SPECIMEN · ${flower.latin.toUpperCase()}`;
  const backFooter = useMemo(() => {
    const n = dayOfYear(flower.date).toString().padStart(3, '0');
    return `N° ${n} / 365 — IRIDESCENT STOCK`;
  }, [flower.date]);

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

  // Flip state: 0 = front showing, 1 = back showing. Animated with a
  // Material-standard easing curve over 600ms on each tap.
  const flip = useSharedValue(0);
  const flippedRef = useRef(false);
  const onPress = useCallback(() => {
    flippedRef.current = !flippedRef.current;
    flip.value = withTiming(flippedRef.current ? 1 : 0, {
      duration: 600,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1),
    });
  }, [flip]);

  // Front: rotates 0 → 180. `backfaceVisibility: 'hidden'` (set on the
  // styled View directly) hides it once it crosses 90deg.
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: TOKENS.perspective },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${interpolate(flip.value, [0, 1], [0, 180]) + ry.value}deg` },
    ],
  }));

  // Back: pre-rotated 180 so it reads correctly when revealed. Rotates
  // 180 → 360, hidden by backfaceVisibility until the card crosses 90deg.
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: TOKENS.perspective },
      { rotateX: `${rx.value}deg` },
      { rotateY: `${interpolate(flip.value, [0, 1], [180, 360]) + ry.value}deg` },
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
      <Pressable onPress={onPress} style={styles.pressArea}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.pressArea}>
            {/* Front face */}
            <Animated.View style={[styles.cardWrap, styles.facePos, frontStyle]}>
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

            {/* Back face */}
            <Animated.View style={[styles.cardWrap, styles.facePos, backStyle]}>
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
                <CardEffects
                  width={width}
                  height={height}
                  x={x}
                  y={y}
                  hov={hov}
                />
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      </Pressable>
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
  pressArea: {
    width: '100%',
    height: '100%',
  },
  cardWrap: {
    width: '100%',
    height: '100%',
  },
  facePos: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // RN backfaceVisibility: set on the styled View directly so the back of
    // each face stays hidden as it crosses 90deg of rotation.
    backfaceVisibility: 'hidden',
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
});
