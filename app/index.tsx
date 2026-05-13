import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import {
  fetchDailyFlower,
  FlowerFetchError,
  getDefaultFlower,
  todayLocalIso,
  type DailyFlower,
} from '@/lib/dailyFlower';
import { getRegion, getRegionWithStatus, resetRegion } from '@/lib/region';
import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

// CanvasKit (Skia's WASM blob) lives at /canvaskit.wasm on the web build —
// copied there by the `postinstall` script from the canvaskit-wasm package so
// the loader always finds a version-matched WASM, offline-safe and without a
// third-party CDN round-trip. The `/` prefix means Expo Router serves it from
// the public/ folder at the site root.
const SKIA_OPTS = {
  locateFile: (file: string) => `/${file}`,
};

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

export default function HomeScreen() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [dayOffset, setDayOffset] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);

  const { width: winW, height: winH } = useWindowDimensions();
  // Portrait card sized to the screen: leaves room for the eyebrow at the top
  // and the nav row at the bottom. Caps width on tablets/desktop.
  const cardW = Math.min(winW - 48, 440);
  const cardH = Math.min(cardW * 1.35, winH - 220);

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
        // 404 is a legitimate "coming soon" — keep the error treatment so the
        // user knows we don't have a flower for that exact date. For service
        // outages and network failures, fall through to the bundled default
        // so the app always shows something instead of an error wall.
        if (e instanceof FlowerFetchError && e.status === 404) {
          setState({ status: 'error', kind: 'unpublished', message: ERROR_COPY.unpublished.sub });
        } else {
          setState({ status: 'ok', flower: getDefaultFlower(date) });
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dayOffset, reloadKey]);

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
        <View style={styles.topBar}>
          <Text style={styles.eyebrow}>
            {eyebrowRegion} · {dateLabel}
          </Text>
        </View>

        <View style={styles.stage}>
          {state.status === 'loading' && (
            <View style={[styles.placeholder, { width: cardW, height: cardH }]}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
              <Text style={styles.loadingLabel}>FINDING TODAY'S BLOOM</Text>
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
            <WithSkiaWeb
              getComponent={async () => {
                const mod = await import('@/components/IridescentCard');
                return { default: mod.IridescentCard };
              }}
              opts={SKIA_OPTS}
              componentProps={{
                flower: state.flower,
                width: cardW,
                height: cardH,
              }}
              fallback={
                <View style={[styles.placeholder, { width: cardW, height: cardH }]} />
              }
            />
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
});
