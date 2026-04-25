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

function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function imageUrlFor(state: string, date: string = todayIso()): string {
  return `${PAGES_BASE_URL}/${state}/${date}.png`;
}

function sidecarUrlFor(state: string, date: string = todayIso()): string {
  return `${PAGES_BASE_URL}/${state}/${date}.json`;
}

export async function fetchDailyFlower(state: string, date: string = todayIso()): Promise<DailyFlower> {
  const sidecar = await fetch(sidecarUrlFor(state, date));
  if (!sidecar.ok) {
    throw new Error(
      `No flower published for ${state} on ${date} (HTTP ${sidecar.status})`,
    );
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
