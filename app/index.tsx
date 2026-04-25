import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  fetchDailyFlower,
  FlowerFetchError,
  todayLocalIso,
  type DailyFlower,
} from '@/lib/dailyFlower';
import { getRegion, resetRegion } from '@/lib/region';

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

/**
 * Add `days` to a `YYYY-MM-DD` string in the user's local calendar (anchored
 * at noon to dodge DST shifts). The original implementation used toISOString,
 * which silently shifted the date by a day for users east of UTC.
 */
function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T12:00:00');
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function HomeScreen() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [dayOffset, setDayOffset] = useState(0);
  // Bumped to force the load effect to re-run after the user clears their
  // cached region (re-prompts for location on the next call).
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
        // Keep the technical detail in the console for debug, show the user
        // a friendly message based on what kind of failure happened.
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
    setDayOffset(0);
    setReloadKey(k => k + 1);
  }

  return (
    <SafeAreaView style={styles.root}>
      {state.status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingLabel}>Finding flowers in your area…</Text>
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{ERROR_COPY[state.kind].title}</Text>
          <Text style={styles.errorSub}>{state.message}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => setReloadKey(k => k + 1)}
          >
            <Text style={styles.retryLabel}>Try again</Text>
          </Pressable>
          <Pressable
            style={styles.linkBtn}
            onPress={handleChangeRegion}
          >
            <Text style={styles.linkLabel}>Change region</Text>
          </Pressable>
        </View>
      )}

      {state.status === 'ok' && (
        <View style={styles.card}>
          <Image
            source={{ uri: state.flower.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.info}>
            <Text style={styles.common}>{state.flower.common}</Text>
            <Text style={styles.latin}>{state.flower.latin}</Text>
            <Text style={styles.blurb}>{state.flower.blurb}</Text>
            <View style={styles.metaRow}>
              <Text style={styles.meta}>
                {state.flower.state} · {state.flower.date}
              </Text>
              <Pressable onPress={handleChangeRegion} hitSlop={8}>
                <Text style={styles.metaLink}>Change region</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.nav}>
            <Pressable
              style={[styles.navBtn, dayOffset <= -6 && styles.navBtnDisabled]}
              onPress={() => setDayOffset(d => Math.max(d - 1, -6))}
              disabled={dayOffset <= -6}
            >
              <Text style={styles.navLabel}>← Yesterday</Text>
            </Pressable>
            {dayOffset < 0 && (
              <Pressable style={styles.navBtn} onPress={() => setDayOffset(0)}>
                <Text style={styles.navLabel}>Today →</Text>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loadingLabel: { marginTop: 16, color: '#666', fontSize: 14 },
  card: { flex: 1 },
  image: { flex: 1 },
  info: {
    padding: 20,
    gap: 4,
  },
  common: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  latin: { fontSize: 16, fontStyle: 'italic', color: '#555' },
  blurb: { fontSize: 15, color: '#333', marginTop: 8, lineHeight: 22 },
  meta: { fontSize: 12, color: '#999' },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLink: { fontSize: 12, color: '#4CAF50', fontWeight: '600' },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  navBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  navBtnDisabled: { opacity: 0.3 },
  navLabel: { fontSize: 14, color: '#333' },
  errorText: { fontSize: 20, fontWeight: '600', color: '#333', textAlign: 'center' },
  errorSub: { fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center', lineHeight: 18 },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  retryLabel: { color: '#fff', fontWeight: '600' },
  linkBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 12 },
  linkLabel: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
});
