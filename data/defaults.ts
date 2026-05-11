/**
 * Bundled default flowers, used as an offline fallback when the GitHub Pages
 * CDN is unreachable or hasn't published today's set yet.
 *
 * The variant array represents one species captured at four times of day so
 * the displayed image matches the user's daylight. `pickByHour` chooses the
 * closest variant for the current local hour.
 *
 * Replace the placeholder PNGs in `assets/defaults/` with curated images
 * (suggested 1024×1024, sRGB, ≤200 KB each) before shipping.
 */

import type { ImageSourcePropType } from 'react-native';

export type TimeOfDay = 'sunrise' | 'midday' | 'sunset' | 'dusk';

export interface DefaultFlowerVariant {
  time: TimeOfDay;
  // Hour the variant *starts* covering (local 24h). Wraps midnight.
  fromHour: number;
  image: ImageSourcePropType;
}

export interface DefaultFlower {
  common: string;
  latin: string;
  blurb: string;
  variants: DefaultFlowerVariant[];
}

const placeholder = require('../assets/defaults/midday.png');

export const DEFAULT_FLOWER: DefaultFlower = {
  common: 'California Poppy',
  latin: 'Eschscholzia californica',
  blurb:
    'A drought-tolerant bloom whose vivid orange petals close at night and on cloudy days. State flower of California; reseeds itself across the western US.',
  variants: [
    { time: 'sunrise', fromHour: 5, image: placeholder },
    { time: 'midday', fromHour: 10, image: placeholder },
    { time: 'sunset', fromHour: 17, image: placeholder },
    { time: 'dusk', fromHour: 20, image: placeholder },
  ],
};

export function pickVariant(now: Date = new Date()): DefaultFlowerVariant {
  const hour = now.getHours();
  const variants = DEFAULT_FLOWER.variants;
  // Find the latest variant whose fromHour we have already reached.
  let pick = variants[variants.length - 1]; // overnight wraps to dusk
  for (const v of variants) {
    if (hour >= v.fromHour) pick = v;
  }
  return pick;
}
