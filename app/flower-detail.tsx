import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTH_SHORT[m - 1]} ${d} ${y}`;
}

export default function FlowerDetailScreen() {
  const router = useRouter();
  const {
    imageUri,
    common,
    latin,
    blurb,
    state: flowerState,
    date,
  } = useLocalSearchParams<{
    imageUri: string;
    common: string;
    latin: string;
    blurb: string;
    state: string;
    date: string;
  }>();

  const regionLabel =
    !flowerState || flowerState === 'default'
      ? 'YOUR AREA'
      : flowerState.toUpperCase();

  return (
    <View style={styles.root}>
      {/* Hide the native header — back gesture / zoom-out handles dismissal */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Full-bleed flower image */}
      <Image
        source={{ uri: imageUri }}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
        cachePolicy="memory-disk"
        preferHighDynamicRange
        accessibilityLabel={common}
      />

      {/* Gradient: transparent at top, deep black at bottom */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0)',
          'rgba(0,0,0,0.65)',
          'rgba(0,0,0,0.97)',
        ]}
        locations={[0, 0.38, 0.62, 1]}
        style={StyleSheet.absoluteFillObject}
        pointerEvents="none"
      />

      {/* Info panel anchored to the bottom */}
      <SafeAreaView style={styles.fill} edges={['bottom', 'left', 'right', 'top']}>
        <View style={styles.inner}>
          {/* Close button — top-left, mirrors expand button styling */}
          <Pressable
            style={styles.closeBtn}
            onPress={() => router.back()}
            accessibilityLabel="Close"
            accessibilityRole="button"
            hitSlop={12}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>

          {/* Spacer pushes info to the bottom */}
          <View style={styles.spacer} />

          <View style={styles.info}>
            <Text style={styles.eyebrow}>
              {regionLabel} · {formatDateLabel(date ?? '')}
            </Text>

            <Text style={styles.common} numberOfLines={2} adjustsFontSizeToFit selectable>
              {common}
            </Text>
            <Text style={styles.latin} selectable>{latin}</Text>

            <View style={styles.rule} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces
              style={styles.blurbScroll}
            >
              <Text style={styles.blurb} selectable>{blurb}</Text>
              {/* Bottom breathing room inside scroll */}
              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  fill: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  info: {
    paddingHorizontal: 28,
    paddingBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginBottom: 10,
  },
  common: {
    fontFamily: SERIF,
    fontSize: 40,
    lineHeight: 46,
    color: '#fff',
    letterSpacing: 0.2,
  },
  latin: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 17,
    color: 'rgba(255,255,255,0.68)',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 18,
    marginBottom: 16,
    width: 56,
  },
  blurbScroll: {
    maxHeight: 190,
  },
  blurb: {
    fontSize: 16,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.88)',
  },
  closeBtn: {
    alignSelf: 'flex-start',
    margin: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderCurve: 'continuous',
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
});
