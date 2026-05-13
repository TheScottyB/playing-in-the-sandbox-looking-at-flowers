// components/IridescentCard/CardFace.tsx
import { memo, type ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';

import { CardFrame } from './CardFrame';
import { TOKENS } from './tokens';

export type CardFaceProps = {
  cornerGlyph: string;
  footer: string;
} & (
  | { variant: 'front'; image: ImageSourcePropType; accessibilityLabel: string }
  | { variant: 'back'; children: ReactNode }
);

export const CardFace = memo(function CardFace(props: CardFaceProps) {
  const { cornerGlyph, footer, variant } = props;

  return (
    <View style={styles.face}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <CardFrame
          cornerGlyph={cornerGlyph}
          footer={footer}
          showVignette={variant === 'front'}
        />
      </View>

      {variant === 'front' && (
        <View pointerEvents="none" style={styles.vignetteHost}>
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
      )}

      {variant === 'back' && <View style={styles.backContent}>{props.children}</View>}
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
  // Circular vignette host sized as a percentage of the card so it tracks the
  // SVG frame at any render size. Reference geometry (in the 360×540 viewBox):
  //   diameter 224 → 224/360 = 62.22% of card width
  //   center y = H/2 - 30 = 240 → top edge = (240 - 112) / 540 = 23.7%
  //   center x = W/2 → left edge = (180 - 112) / 360 = 18.89%
  // aspectRatio:1 keeps it square as the card scales, and a fat borderRadius
  // ensures a perfect circle regardless of computed dimensions.
  vignetteHost: {
    position: 'absolute',
    width: '62.22%',
    aspectRatio: 1,
    left: '18.89%',
    top: '23.7%',
    borderRadius: 9999,
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
