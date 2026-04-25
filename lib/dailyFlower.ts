/**
 * The provider interface the app talks to. Today this resolves to a static
 * GitHub Pages URL; tomorrow it can be swapped for a Cloudflare Worker
 * (on-demand generation) or on-device generation without changing callers.
 */

const PAGES_BASE_URL =
  'https://thescottyb.github.io/playing-in-the-sandbox-looking-at-flowers/daily';

export interface DailyFlower {
  imageUrl: string;
  common: string;
  latin: string;
  blurb: string;
  state: string;
  date: string;
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
    imageUrl: imageUrlFor(state, date),
    common: meta.common,
    latin: meta.latin,
    blurb: meta.blurb,
    state,
    date,
  };
}
