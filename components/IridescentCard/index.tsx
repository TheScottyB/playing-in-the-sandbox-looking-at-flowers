// components/IridescentCard/index.tsx
import { memo } from 'react';
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

export const IridescentCard = memo(function IridescentCard({
  flower,
  width,
  height,
}: IridescentCardProps) {
  const month = Number(flower.date.slice(5, 7));
  const cornerGlyph = MONTH_INITIAL[month] ?? '*';
  const frontFooter = `SPECIMEN · ${flower.latin.toUpperCase()}`;

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
