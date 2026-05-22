import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import FlipCard from 'react-native-flip-card';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import {
  fetchDailyFlower,
  FlowerFetchError,
  getCachedFlower,
  getDefaultFlower,
  todayLocalIso,
  type DailyFlower,
} from '@/lib/dailyFlower';
import { getRegion, getRegionWithStatus, resetRegion, getRegionOverride, setRegionOverride } from '@/lib/region';
import { useOnline } from '@/hooks/useOnline';

type ErrorKind = 'unpublished' | 'service' | 'network';

type State =
  | { status: 'loading' }
  | { status: 'ok'; flower: DailyFlower }
  | { status: 'error'; kind: ErrorKind; message: string };

const ERROR_COPY: Record<ErrorKind, { title: string; sub: string }> = {
  unpublished: {
    title: 'Coming soon to your area',
    sub: 'No flower has been published for this date yet. It usually arrives by 4 a.m. Pacific.',
  },
  service: {
    title: 'The flower service is having trouble',
    sub: 'Please try again in a moment.',
  },
  network: {
    title: "Couldn't reach the flower service",
    sub: 'Check your connection, then tap Try again.',
  },
};

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const MONTH_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

/**
 * Add `days` to a `YYYY-MM-DD` string in the user's local calendar (anchored
 * at noon to dodge DST shifts).
 */
function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${MONTH_SHORT[m - 1]} ${d} ${y}`;
}

function IridescentOverlay({ subtle }: { subtle?: boolean }) {
  const alpha = subtle ? 0.55 : 1.0;
  const phase = useSharedValue(0);

  useEffect(() => {
    phase.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
    );
  }, [phase]);

  const iri1 = useAnimatedStyle(() => {
    'worklet';
    const p = phase.value * Math.PI * 2;
    return {
      opacity: (0.18 + Math.sin(p) * 0.12) * alpha,
      transform: [
        { translateX: Math.sin(p) * 50 },
        { translateY: Math.cos(p * 0.7) * 30 },
      ],
    };
  });

  const iri2 = useAnimatedStyle(() => {
    'worklet';
    const p = phase.value * Math.PI * 2 + (Math.PI * 2) / 3;
    return {
      opacity: (0.15 + Math.sin(p) * 0.10) * alpha,
      transform: [
        { translateX: Math.cos(p) * 45 },
        { translateY: Math.sin(p * 1.3) * 25 },
      ],
    };
  });

  const iri3 = useAnimatedStyle(() => {
    'worklet';
    const p = phase.value * Math.PI * 2 + (Math.PI * 4) / 3;
    return {
      opacity: (0.12 + Math.sin(p) * 0.08) * alpha,
      transform: [
        { translateX: Math.sin(p * 1.1) * 55 },
        { translateY: Math.cos(p) * 35 },
      ],
    };
  });

  const specular = useAnimatedStyle(() => {
    'worklet';
    const p = phase.value * Math.PI * 2 * 0.6;
    return {
      opacity: (0.12 + Math.sin(p) * 0.08) * alpha,
      transform: [
        { translateX: Math.cos(p) * 70 },
        { translateY: Math.sin(p * 0.8) * 40 },
      ],
    };
  });

  const edgeSheen = useAnimatedStyle(() => {
    'worklet';
    const p = phase.value * Math.PI * 2 * 0.5;
    return {
      borderColor: `rgba(255,255,255,${(0.12 + Math.sin(p) * 0.08) * alpha})`,
    };
  });

  return (
    <View style={iriStyles.container} pointerEvents="none">
      <Animated.View style={[iriStyles.layer, iri1]}>
        <LinearGradient
          colors={['rgba(100,140,255,0.35)', 'rgba(200,100,255,0.20)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View style={[iriStyles.layer, iri2]}>
        <LinearGradient
          colors={['rgba(255,100,200,0.30)', 'rgba(255,180,100,0.15)', 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View style={[iriStyles.layer, iri3]}>
        <LinearGradient
          colors={['rgba(100,255,200,0.25)', 'rgba(100,200,255,0.15)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View style={[iriStyles.specular, specular]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.28)', 'transparent']}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.7, y: 0.7 }}
          style={StyleSheet.absoluteFillObject}
        />
      </Animated.View>
      <Animated.View style={[iriStyles.edge, edgeSheen]} />
    </View>
  );
}

const iriStyles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    borderRadius: 18,
  },
  layer: {
    position: 'absolute',
    top: -60,
    left: -60,
    right: -60,
    bottom: -60,
  },
  specular: {
    position: 'absolute',
    top: -80,
    left: -80,
    right: -80,
    bottom: -80,
  },
  edge: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
});

export default function HomeScreen() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [dayOffset, setDayOffset] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [, setEyebrowTaps] = useState(0);
  const [devMenuVisible, setDevMenuVisible] = useState(false);
  const [activeOverride, setActiveOverride] = useState<string | null>(null);
  const [customCode, setCustomCode] = useState('');
  const online = useOnline();

  const { width: winW, height: winH } = useWindowDimensions();
  // Portrait card sized to the screen: leaves room for the eyebrow at the top
  // and the nav row at the bottom. Caps width on tablets/desktop.
  const cardW = Math.min(winW - 48, 440);
  const cardH = Math.min(cardW * 1.35, winH - 220);

  // Extract a plain URI string from imageSource (only set for CDN flowers,
  // not for bundled require() fallbacks — those can't be serialised as a param).
  const detailImageUri =
    state.status === 'ok' &&
    state.flower.imageSource != null &&
    typeof state.flower.imageSource === 'object' &&
    'uri' in (state.flower.imageSource as Record<string, unknown>)
      ? (state.flower.imageSource as { uri: string }).uri
      : null;

  useEffect(() => {
    async function checkOverride() {
      const over = await getRegionOverride();
      setActiveOverride(over);
    }
    checkOverride();
  }, [devMenuVisible]);

  function handleEyebrowPress() {
    setEyebrowTaps(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setDevMenuVisible(true);
        return 0;
      }
      return next;
    });
  }

  async function applyOverride(regionCode: string | null) {
    await setRegionOverride(regionCode);
    setActiveOverride(regionCode);
    setDevMenuVisible(false);
    setDayOffset(0);
    setReloadKey(k => k + 1);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading' });
      const date = offsetDate(todayLocalIso(), dayOffset);
      try {
        const region = await getRegion();
        const flower = await fetchDailyFlower(region, date);
        if (!cancelled) setState({ status: 'ok', flower });
      } catch (e) {
        if (cancelled) return;
        console.error('Flower fetch failed:', e);

        if (e instanceof FlowerFetchError && e.status === 404) {
          // 404 is a legitimate "coming soon" — keep the error treatment so
          // the user knows we don't have a flower for that exact date.
          setState({ status: 'error', kind: 'unpublished', message: ERROR_COPY.unpublished.sub });
        } else if (!online) {
          // Network down: prefer the last successfully fetched flower from
          // AsyncStorage; fall through to the bundled default if nothing's cached.
          const cached = await getCachedFlower();
          if (cancelled) return;
          setState({
            status: 'ok',
            flower: cached
              ? { ...cached, isDefault: true }
              : { ...getDefaultFlower(date), isDefault: true },
          });
        } else {
          // 5xx or other: retry once with backoff before falling through.
          await new Promise((r) => setTimeout(r, 1500));
          if (cancelled) return;
          try {
            const region = await getRegion();
            const flower = await fetchDailyFlower(region, date);
            if (!cancelled) setState({ status: 'ok', flower });
          } catch {
            if (cancelled) return;
            const cached = await getCachedFlower();
            if (cancelled) return;
            setState({
              status: 'ok',
              flower: cached ? { ...cached, isDefault: true } : getDefaultFlower(date),
            });
          }
        }
      }
    }

    load();
    return () => { cancelled = true; };
    // `online` is intentionally in the deps: when network state flips, we
    // want to refetch — coming back online should refresh today's flower
    // instead of leaving the user looking at the fallback.
  }, [dayOffset, reloadKey, online]);

  async function handleUpdateLocation() {
    await resetRegion();
    const { permissionDenied } = await getRegionWithStatus();
    if (permissionDenied) {
      Alert.alert(
        'Location access is off',
        'To show flowers native to your area, enable location access in Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    setDayOffset(0);
    setReloadKey(k => k + 1);
  }

  const dateLabel = useMemo(() => {
    if (state.status === 'ok') return formatDateLabel(state.flower.date);
    return formatDateLabel(offsetDate(todayLocalIso(), dayOffset));
  }, [state, dayOffset]);

  const eyebrowRegion =
    state.status === 'ok'
      ? state.flower.state === 'default' ? 'YOUR AREA' : state.flower.state
      : 'YOUR AREA';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.fill}>
        <Pressable onPress={handleEyebrowPress} style={styles.topBar}>
          <Text style={styles.eyebrow}>
            {eyebrowRegion} · {dateLabel}
          </Text>
        </Pressable>

        <View style={styles.stage}>
          {state.status === 'loading' && (
            <View style={[styles.placeholder, { width: cardW, height: cardH }]}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
              <Text style={styles.loadingLabel}>FINDING TODAY&apos;S BLOOM</Text>
            </View>
          )}

          {state.status === 'error' && (
            <View style={[styles.placeholder, { width: cardW, height: cardH }]}>
              <Text style={styles.errorTitle}>{ERROR_COPY[state.kind].title}</Text>
              <Text style={styles.errorSub}>{state.message}</Text>
              <Pressable
                style={styles.primaryBtn}
                onPress={() => setReloadKey(k => k + 1)}
              >
                <Text style={styles.primaryBtnLabel}>Try again</Text>
              </Pressable>
            </View>
          )}

          {state.status === 'ok' && (
            <View style={styles.cardWrap}>
              <View style={styles.glow} />
              <FlipCard
                key={state.flower.date + ':' + state.flower.state}
                style={{ width: cardW, height: cardH }}
                friction={6}
                perspective={1000}
                flipHorizontal
                flipVertical={false}
                clickable
                useNativeDriver={process.env.EXPO_OS !== 'web'}
              >
                {/* Front: image */}
                <View style={styles.face}>
                  <Image
                    source={state.flower.imageSource}
                    style={[StyleSheet.absoluteFillObject, styles.imageRadius]}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    transition={400}
                    preferHighDynamicRange
                    accessibilityLabel={state.flower.common}
                  />
                  {state.flower.isDefault && (
                    <View style={styles.fallbackBadge}>
                      <Text style={styles.fallbackBadgeText}>OFFLINE · ARCHIVE</Text>
                    </View>
                  )}
                  <IridescentOverlay subtle />
                  <LinearGradient
                    pointerEvents="none"
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.55)']}
                    style={styles.hintScrim}
                  />
                  <Text style={styles.hint}>TAP TO READ</Text>

                  {/* Expand button — zoom-transitions to the full-screen detail view.
                      Only shown when we have a real CDN URI (not a bundled fallback). */}
                  {detailImageUri != null && (
                    <Link
                      href={{
                        pathname: '/flower-detail',
                        params: {
                          imageUri: detailImageUri,
                          common: state.flower.common,
                          latin: state.flower.latin,
                          blurb: state.flower.blurb,
                          state: state.flower.state,
                          date: state.flower.date,
                        },
                      }}
                      asChild
                    >
                      <Link.Trigger withAppleZoom>
                        <Pressable
                          style={styles.expandBtn}
                          accessibilityLabel="View full screen"
                          accessibilityRole="button"
                        >
                          <Text style={styles.expandIcon}>↗</Text>
                        </Pressable>
                      </Link.Trigger>
                    </Link>
                  )}
                </View>

                {/* Back: serif info panel */}
                <View style={styles.face}>
                  <LinearGradient
                    colors={['#1a1a1a', '#0a0a0a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.back, styles.imageRadius]}
                  >
                    <IridescentOverlay />
                    <Text style={styles.backEyebrow}>SPECIES</Text>
                    <Text style={styles.common} selectable>{state.flower.common}</Text>
                    <Text style={styles.latin} selectable>{state.flower.latin}</Text>
                    <View style={styles.rule} />
                    <Text style={styles.blurb} selectable>{state.flower.blurb}</Text>
                    <Text style={[styles.hint, styles.hintBack]}>TAP TO FLIP BACK</Text>
                  </LinearGradient>
                </View>
              </FlipCard>
            </View>
          )}
        </View>

        <View style={styles.nav}>
          <Pressable
            style={[styles.navBtn, dayOffset <= -6 && styles.navBtnDisabled]}
            onPress={() => setDayOffset(d => Math.max(d - 1, -6))}
            disabled={dayOffset <= -6}
            hitSlop={8}
          >
            <Text style={styles.navLabel}>← Yesterday</Text>
          </Pressable>

          {dayOffset < 0 ? (
            <Pressable
              style={styles.navBtn}
              onPress={() => setDayOffset(0)}
              hitSlop={8}
            >
              <Text style={styles.navLabel}>Today →</Text>
            </Pressable>
          ) : (
            <Pressable onPress={handleUpdateLocation} hitSlop={8}>
              <Text style={styles.navSubtle}>Update location</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <Modal
        visible={devMenuVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDevMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Dev Controls</Text>
            
            <Text style={styles.overrideLabel}>Active Location:</Text>
            <Text style={styles.overrideStatus}>
              {activeOverride ? activeOverride : 'Real System Location (No Override)'}
            </Text>

            <Text style={styles.sectionTitle}>Quick Select</Text>
            <ScrollView
              contentContainerStyle={styles.chipContainer}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 150 }}
            >
              {[
                { code: null, label: 'System' },
                { code: 'default', label: 'Default' },
                { code: 'MX', label: 'MX (Mexico)' },
                { code: 'IS', label: 'IS (Iceland)' },
                { code: 'RU', label: 'RU (Russia)' },
                { code: 'CN', label: 'CN (China)' },
                { code: 'CA-ON', label: 'CA-ON (Ontario)' },
                { code: 'CA-BC', label: 'CA-BC' },
                { code: 'CA', label: 'CA (California)' },
                { code: 'NY', label: 'NY (New York)' },
                { code: 'TX', label: 'TX (Texas)' },
              ].map((item) => {
                const isSelected = activeOverride === item.code;
                return (
                  <Pressable
                    key={String(item.code)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => applyOverride(item.code)}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Custom Code</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. CA-QC, AL, WY"
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={customCode}
                onChangeText={setCustomCode}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <Pressable
                style={styles.applyBtn}
                onPress={() => {
                  const trimmed = customCode.trim().toUpperCase();
                  if (!trimmed) {
                    Alert.alert('Invalid Code', 'Please enter a region code.');
                    return;
                  }
                  applyOverride(trimmed);
                }}
              >
                <Text style={styles.applyBtnText}>Apply</Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.dismissBtn}
              onPress={() => setDevMenuVisible(false)}
            >
              <Text style={styles.dismissBtnText}>Dismiss</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  fill: { flex: 1 },

  topBar: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },

  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  cardWrap: {
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 28,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(120,140,255,0.8)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
      },
      android: {
        elevation: 16,
      },
      default: {},
    }),
  },
  face: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: 18,
    borderCurve: 'continuous',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    boxShadow: '0px 16px 28px rgba(0,0,0,0.45)',
  },
  imageRadius: {
    borderRadius: 18,
    borderCurve: 'continuous',
  },
  hintScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
  },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    letterSpacing: 2.8,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 18,
  },
  hintBack: {
    position: 'relative',
    marginTop: 'auto',
    paddingTop: 24,
  },
  expandBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
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
  expandIcon: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
  },
  fallbackBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  fallbackBadgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '600',
  },

  back: {
    flex: 1,
    padding: 26,
    justifyContent: 'flex-start',
  },
  backEyebrow: {
    fontSize: 10,
    letterSpacing: 2.8,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    marginBottom: 12,
  },
  common: {
    fontFamily: SERIF,
    fontSize: 32,
    lineHeight: 38,
    color: '#fff',
    letterSpacing: 0.2,
  },
  latin: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginTop: 18,
    marginBottom: 16,
    width: 56,
  },
  blurb: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.88)',
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 12,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.45)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  navBtnDisabled: { opacity: 0.25 },
  navLabel: {
    fontSize: 13,
    color: '#fff',
    letterSpacing: 0.3,
  },
  navSubtle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },

  placeholder: {
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  loadingLabel: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: '600',
  },
  errorTitle: {
    fontFamily: SERIF,
    fontSize: 22,
    lineHeight: 28,
    color: '#fff',
    textAlign: 'center',
  },
  errorSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  primaryBtn: {
    marginTop: 22,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  primaryBtnLabel: {
    color: '#0a0a0a',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#161616',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: '100%',
    maxWidth: 400,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
    textAlign: 'center',
  },
  overrideLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    marginBottom: 4,
  },
  overrideStatus: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipSelected: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: '#111',
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 14,
  },
  applyBtn: {
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  dismissBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissBtnText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
