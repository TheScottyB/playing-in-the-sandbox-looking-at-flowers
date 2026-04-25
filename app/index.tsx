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

import { fetchDailyFlower, type DailyFlower } from '@/lib/dailyFlower';
import { getRegion } from '@/lib/region';

type State =
  | { status: 'loading' }
  | { status: 'ok'; flower: DailyFlower }
  | { status: 'error'; message: string };

function offsetDate(base: string, days: number): string {
  const d = new Date(base + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function HomeScreen() {
  const [state, setState] = useState<State>({ status: 'loading' });
  const [dayOffset, setDayOffset] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState({ status: 'loading' });
      try {
        const region = await getRegion();
        const today = new Date().toISOString().slice(0, 10);
        const date = offsetDate(today, dayOffset);
        const flower = await fetchDailyFlower(region, date);
        if (!cancelled) setState({ status: 'ok', flower });
      } catch (e) {
        if (!cancelled)
          setState({ status: 'error', message: String(e) });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dayOffset]);

  return (
    <SafeAreaView style={styles.root}>
      {state.status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      )}

      {state.status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorText}>No flower today</Text>
          <Text style={styles.errorSub}>{state.message}</Text>
          <Pressable style={styles.retryBtn} onPress={() => setDayOffset(0)}>
            <Text style={styles.retryLabel}>Try again</Text>
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
            <Text style={styles.meta}>
              {state.flower.state} · {state.flower.date}
            </Text>
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
  card: { flex: 1 },
  image: { flex: 1 },
  info: {
    padding: 20,
    gap: 4,
  },
  common: { fontSize: 26, fontWeight: '700', color: '#1a1a1a' },
  latin: { fontSize: 16, fontStyle: 'italic', color: '#555' },
  blurb: { fontSize: 15, color: '#333', marginTop: 8, lineHeight: 22 },
  meta: { fontSize: 12, color: '#999', marginTop: 8 },
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
  errorText: { fontSize: 20, fontWeight: '600', color: '#333' },
  errorSub: { fontSize: 13, color: '#999', marginTop: 8, textAlign: 'center' },
  retryBtn: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  retryLabel: { color: '#fff', fontWeight: '600' },
});
