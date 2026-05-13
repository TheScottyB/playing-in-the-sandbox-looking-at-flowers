// components/IridescentCard/useCardTilt.ts
// Unified tilt input: pan gesture (touch) + device motion (gyro) + pointer (web).
// Three signals, single source of motion truth (x/y/hov shared values).
//
// Priority: while panning, pan drives x/y; for 600ms after pan ends, gyro is
// suppressed (touchLockUntil) so the card doesn't snap back into a gyro pose
// the moment the user lifts. On web, pointer move drives x/y; touch isn't used
// in the browser so the pan/gyro paths are inert there.

import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { DeviceMotion, type DeviceMotionMeasurement } from 'expo-sensors';
import type { SharedValue } from 'react-native-reanimated';

const HOVER_IN_MS = 180;
const HOVER_OUT_MS = 260;
const DRIFT_BACK_MS = 380;
const TOUCH_LOCK_MS = 600;
const GYRO_HZ = 60;
const GYRO_RANGE = Math.PI / 4; // ±45° maps to [0..1]

export type UseCardTiltReturn = {
  x: SharedValue<number>;
  y: SharedValue<number>;
  hov: SharedValue<number>;
  panGesture: ReturnType<typeof Gesture.Pan>;
  /** Caller invokes when card size is known (onLayout) to enable pan normalization. */
  onLayoutSize: (width: number, height: number) => void;
  /** Web only: attach pointer listeners. Pass null to detach. */
  bindPointer: (host: HTMLElement | null) => void;
};

export function useCardTilt(): UseCardTiltReturn {
  const x = useSharedValue(0.5);
  const y = useSharedValue(0.5);
  const hov = useSharedValue(0);

  // Size of the card host in pixels — pan gesture worklet reads this to
  // normalize touch coords into [0..1].
  const panSize = useSharedValue({ w: 1, h: 1 });

  // Timestamp (ms) until which gyro updates should be ignored after a touch.
  const touchLockUntil = useSharedValue(0);

  // Track the currently-bound host element so we can detach cleanly. Stored in
  // a ref (not state) — pointer binding is a side-effect, not render data.
  const pointerHostRef = useRef<HTMLElement | null>(null);
  const pointerHandlersRef = useRef<{
    move: (e: PointerEvent) => void;
    enter: () => void;
    leave: () => void;
  } | null>(null);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      'worklet';
      hov.value = withTiming(1, { duration: HOVER_IN_MS });
    })
    .onUpdate((e) => {
      'worklet';
      const { w, h } = panSize.value;
      if (w <= 0 || h <= 0) return;
      const nx = Math.min(1, Math.max(0, e.x / w));
      const ny = Math.min(1, Math.max(0, e.y / h));
      x.value = nx;
      y.value = ny;
    })
    .onEnd(() => {
      'worklet';
      touchLockUntil.value = Date.now() + TOUCH_LOCK_MS;
      hov.value = withTiming(0, { duration: HOVER_OUT_MS });
      x.value = withTiming(0.5, { duration: DRIFT_BACK_MS });
      y.value = withTiming(0.5, { duration: DRIFT_BACK_MS });
    })
    .onFinalize(() => {
      'worklet';
      // Safety net: if the gesture is cancelled mid-stream (e.g. parent
      // scroll wins the race), still release hover/lock so we don't get stuck.
      if (hov.value !== 0) {
        hov.value = withTiming(0, { duration: HOVER_OUT_MS });
      }
    });

  // --- Device motion (native only) ---
  useEffect(() => {
    if (Platform.OS === 'web') return;
    let subscription: { remove: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const available = await DeviceMotion.isAvailableAsync();
        if (!available || cancelled) return;
        DeviceMotion.setUpdateInterval(1000 / GYRO_HZ);
        subscription = DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
          if (Date.now() < touchLockUntil.value) return;
          const rotation = data.rotation;
          if (!rotation) return;
          // beta = pitch (front/back tilt) → maps to y axis
          // gamma = roll (left/right tilt) → maps to x axis
          const ny = clamp01(0.5 + rotation.beta / (2 * GYRO_RANGE));
          const nx = clamp01(0.5 + rotation.gamma / (2 * GYRO_RANGE));
          x.value = nx;
          y.value = ny;
          // Gyro always shows the card "lit" — pin hover at 1 while a device
          // is producing motion. This matches the prototype's idle-on-device
          // behaviour where the card is permanently alive on phones.
          if (hov.value < 1) {
            hov.value = withTiming(1, { duration: HOVER_IN_MS });
          }
        });
      } catch {
        // Sensor unavailable; silently no-op.
      }
    })();
    return () => {
      cancelled = true;
      if (subscription) subscription.remove();
    };
  }, [hov, touchLockUntil, x, y]);

  // --- onLayoutSize: consumer reports the card host's pixel size ---
  const onLayoutSize = (width: number, height: number) => {
    panSize.value = { w: width, h: height };
  };

  // --- Web pointer binding ---
  const bindPointer = (host: HTMLElement | null) => {
    if (Platform.OS !== 'web') return;

    // Detach prior host if different (or null = explicit detach).
    if (pointerHostRef.current && pointerHostRef.current !== host) {
      const prev = pointerHostRef.current;
      const handlers = pointerHandlersRef.current;
      if (handlers) {
        prev.removeEventListener('pointermove', handlers.move);
        prev.removeEventListener('pointerenter', handlers.enter);
        prev.removeEventListener('pointerleave', handlers.leave);
      }
      delete prev.dataset.iridescentBound;
      pointerHostRef.current = null;
      pointerHandlersRef.current = null;
    }

    if (!host) return;
    // Idempotency guard — StrictMode invokes callback refs twice on mount.
    if (host.dataset.iridescentBound === 'true' && pointerHostRef.current === host) {
      return;
    }

    const move = (e: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = clamp01((e.clientX - rect.left) / rect.width);
      const ny = clamp01((e.clientY - rect.top) / rect.height);
      x.value = nx;
      y.value = ny;
    };
    const enter = () => {
      hov.value = withTiming(1, { duration: HOVER_IN_MS });
    };
    const leave = () => {
      hov.value = withTiming(0, { duration: HOVER_OUT_MS });
      x.value = withTiming(0.5, { duration: DRIFT_BACK_MS });
      y.value = withTiming(0.5, { duration: DRIFT_BACK_MS });
    };

    host.addEventListener('pointermove', move);
    host.addEventListener('pointerenter', enter);
    host.addEventListener('pointerleave', leave);
    host.dataset.iridescentBound = 'true';
    pointerHostRef.current = host;
    pointerHandlersRef.current = { move, enter, leave };
  };

  // Clean up pointer listeners on unmount.
  useEffect(() => {
    return () => {
      const host = pointerHostRef.current;
      const handlers = pointerHandlersRef.current;
      if (host && handlers) {
        host.removeEventListener('pointermove', handlers.move);
        host.removeEventListener('pointerenter', handlers.enter);
        host.removeEventListener('pointerleave', handlers.leave);
        delete host.dataset.iridescentBound;
      }
      pointerHostRef.current = null;
      pointerHandlersRef.current = null;
    };
  }, []);

  return { x, y, hov, panGesture, onLayoutSize, bindPointer };
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}
