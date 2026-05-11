/**
 * The provider interface the app talks to. Today this resolves to a static
 * GitHub Pages URL; tomorrow it can be swapped for a Cloudflare Worker
 * (on-demand generation) or on-device generation without changing callers.
 */

import type { ImageSourcePropType } from 'react-native';

import { DEFAULT_FLOWER, pickVariant, type TimeOfDay } from '@/data/defaults';

const PAGES_BASE_URL =
  'https://thescottyb.github.io/playing-in-the-sandbox-staring-at-flowers/daily';

export interface DailyFlower {
  /** Accepts both `{ uri }` and `require(...)` so a single field covers
   *  remote and bundled images. */
  imageSource: ImageSourcePropType;
  common: string;
  latin: string;
  blurb: string;
  state: string;
  date: string;
  /** Set when this entry came from the bundled fallback, not the CDN. */
  isDefault?: boolean;
  /** Only present for fallback entries. */
  timeOfDay?: TimeOfDay;
}

export interface DailyFlowerSidecar {
  common: string;
  latin: string;
  blurb: string;
  generatedAt: string;
}

/** Tagged error so callers can distinguish 404 ("coming soon") from 5xx
 *  ("service trouble") without parsing strings. Network failures (offline,
 *  DNS, etc.) surface as the original TypeError from fetch and don't reach
 *  this class. */
export class FlowerFetchError extends Error {
  readonly status: number;
  constructor(state: string, date: string, status: number) {
    super(`No flower for ${state} on ${date} (HTTP ${status})`);
    this.name = 'FlowerFetchError';
    this.status = status;
  }
}

export function todayLocalIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function imageUrlFor(state: string, date: string = todayLocalIso()): string {
  return `${PAGES_BASE_URL}/${state}/${date}.png`;
}

function sidecarUrlFor(state: string, date: string = todayLocalIso()): string {
  return `${PAGES_BASE_URL}/${state}/${date}.json`;
}

export async function fetchDailyFlower(state: string, date: string = todayLocalIso()): Promise<DailyFlower> {
  const sidecar = await fetch(sidecarUrlFor(state, date));
  if (!sidecar.ok) {
    throw new FlowerFetchError(state, date, sidecar.status);
  }
  const meta = (await sidecar.json()) as DailyFlowerSidecar;
  return {
    imageSource: { uri: imageUrlFor(state, date) },
    common: meta.common,
    latin: meta.latin,
    blurb: meta.blurb,
    state,
    date,
  };
}

/**
 * Returns a bundled fallback flower whose variant matches the local hour.
 * Used when the CDN is unreachable or hasn't published yet.
 */
export function getDefaultFlower(date: string = todayLocalIso()): DailyFlower {
  const variant = pickVariant();
  return {
    imageSource: variant.image,
    common: DEFAULT_FLOWER.common,
    latin: DEFAULT_FLOWER.latin,
    blurb: DEFAULT_FLOWER.blurb,
    state: 'default',
    date,
    isDefault: true,
    timeOfDay: variant.time,
  };
}
