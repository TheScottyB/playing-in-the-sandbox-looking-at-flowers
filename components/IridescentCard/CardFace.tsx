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
  // Circular vignette host sized to the SVG vignette (radius 112 at center
  // x=W/2, y=H/2 - 30 in the 360×540 viewBox). marginTop of -142 lifts the
  // image 30px above the face's visual center to match that SVG geometry.
  vignetteHost: {
    position: 'absolute',
    width: 224,
    height: 224,
    left: '50%',
    top: '50%',
    marginLeft: -112,
    marginTop: -142,
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
