import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  fetchDailyFlower,
  FlowerFetchError,
  todayLocalIso,
  type DailyFlower,
} from '@/lib/dailyFlower';
import { getRegion, getRegionWithStatus, resetRegion } from '@/lib/region';

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

/**
 * Stacked-view gradient scrim. expo-linear-gradient isn't installed and we
 * don't need the dep for a single static fade — a handful of semi-transparent
 * slabs approximate it well enough at this scale.
 */
function ScrimBottom() {
  const stops = [0, 0.04, 0.1, 0.2, 0.34, 0.5, 0.66, 0.82];
  return (
    <View pointerEvents="none" style={styles.scrimBottom}>
      {stops.map((opacity, i) => (
        <View
          key={i}
          style={{ flex: 1, backgroundColor: `rgba(0,0,0,${opacity})` }}
        />
      ))}
      <View style={{ height: 240, backgroundColor: 'rgba(0,0,0,0.88)' }} />
    </View>
  );
}

function ScrimTop() {
  const stops = [0.55, 0.32, 0.16, 0.06, 0];
  return (
    <View pointerEvents="none" style={styles.scrimTop}>
      {stops.map((opacity, i) => (
        <View
          key={i}
          style={{ flex: 1, backgroundColor: `rgba(0,0,0,${opacity})` }}
        />
      ))}
    </View>
  );
}

export default function HomeScreen() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [dayOffset, setDayOffset] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading' });
      try {
        const region = await getRegion();
        const date = offsetDate(todayLocalIso(), dayOffset);
        const flower = await fetchDailyFlower(region, date);
        if (!cancelled) setState({ status: 'ok', flower });
      } catch (e) {
        if (cancelled) return;
        console.error('Flower fetch failed:', e);
        if (e instanceof FlowerFetchError) {
          const kind: ErrorKind = e.status === 404 ? 'unpublished' : 'service';
          setState({ status: 'error', kind, message: ERROR_COPY[kind].sub });
        } else {
          setState({
            status: 'error',
            kind: 'network',
            message: ERROR_COPY.network.sub,
          });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dayOffset, reloadKey]);

  async function handleChangeRegion() {
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

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {state.status === 'loading' && (
        <SafeAreaView style={styles.fill}>
          <View style={styles.center}>
            <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
            <Text style={styles.loadingLabel}>FINDING TODAY'S BLOOM</Text>
          </View>
        </SafeAreaView>
      )}

      {state.status === 'error' && (
        <SafeAreaView style={styles.fill}>
          <View style={styles.center}>
            <Text style={styles.errorTitle}>{ERROR_COPY[state.kind].title}</Text>
            <Text style={styles.errorSub}>{state.message}</Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => setReloadKey(k => k + 1)}
            >
              <Text style={styles.primaryBtnLabel}>Try again</Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} onPress={handleChangeRegion}>
              <Text style={styles.ghostBtnLabel}>Change region</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      {state.status === 'ok' && (
        <>
          <Image
            source={{ uri: state.flower.imageUrl }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />

          <ScrimTop />
          <ScrimBottom />

          <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
            <View style={styles.topBar}>
              <Text style={styles.eyebrow}>
                {(state.flower.state === 'default' ? 'YOUR AREA' : state.flower.state)} · {dateLabel}
              </Text>
            </View>

            <View style={styles.bottomPanel}>
              <Text style={styles.common}>{state.flower.common}</Text>
              <Text style={styles.latin}>{state.flower.latin}</Text>
              <View style={styles.rule} />
              <Text style={styles.blurb}>{state.flower.blurb}</Text>

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
                  <Pressable onPress={handleChangeRegion} hitSlop={8}>
                    <Text style={styles.navSubtle}>Change region</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </SafeAreaView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  fill: { flex: 1 },

  scrimTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
  },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
    justifyContent: 'flex-end',
  },

  topBar: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 2.4,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },

  bottomPanel: {
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  common: {
    fontFamily: SERIF,
    fontSize: 36,
    lineHeight: 42,
    color: '#fff',
    letterSpacing: 0.2,
  },
  latin: {
    fontFamily: SERIF,
    fontStyle: 'italic',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginTop: 18,
    marginBottom: 16,
    width: 56,
  },
  blurb: {
    fontSize: 15,
    lineHeight: 23,
    color: 'rgba(255,255,255,0.9)',
  },

  nav: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingLabel: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    letterSpacing: 2.4,
    fontWeight: '600',
  },
  errorTitle: {
    fontFamily: SERIF,
    fontSize: 24,
    lineHeight: 30,
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
    marginTop: 28,
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
  ghostBtn: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 12 },
  ghostBtnLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
});
