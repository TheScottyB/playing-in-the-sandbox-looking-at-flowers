#!/usr/bin/env node
/**
 * Generates one flower image + sidecar JSON per state bucket for today's date
 * and writes them to docs/daily/{state}/{YYYY-MM-DD}.{webp,json}.
 *
 * Usage:
 *   GEMINI_API_KEY=... node scripts/generate-daily.mjs [--date YYYY-MM-DD] [--states AL,TX]
 *
 * Environment:
 *   GEMINI_API_KEY  Required. Google AI Studio key with Gemini 2.5 Flash access.
 *   DRY_RUN        Set to "1" to skip actual API calls (writes placeholder files).
 */

import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DOCS_DIR = join(ROOT, 'docs', 'daily');
const SPECIES_PATH = join(ROOT, 'data', 'species.json');

const GEMINI_MODEL = 'gemini-2.5-flash-preview-04-17';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Parse CLI args
const args = process.argv.slice(2);
function argVal(flag) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
}

const targetDate = argVal('--date') ?? todayIso();
const targetStates = argVal('--states')?.split(',') ?? null;

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Deterministic index — same state+date always picks the same species. */
function pickSpecies(species, state, date) {
  const month = Number(date.slice(5, 7));
  const inSeason = species.filter(s => s.bloomMonths.includes(month));
  const pool = inSeason.length > 0 ? inSeason : species;
  const hash = createHash('sha256').update(`${state}:${date}`).digest('hex');
  const idx = Number(BigInt(`0x${hash.slice(0, 8)}`) % BigInt(pool.length));
  return pool[idx];
}

async function generateImage(apiKey, species, state) {
  const month = new Date().toLocaleString('en-US', { month: 'long' });
  const prompt =
    `A beautiful, highly detailed photorealistic illustration of a ${species.common} ` +
    `(${species.latin}) in full bloom. The flower is native to the US state region associated ` +
    `with "${state}" and is blooming in ${month}. ` +
    `Soft natural lighting, botanically accurate, white or blurred outdoor background. ` +
    `No text, no watermarks, portrait orientation.`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  };

  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini image API error ${resp.status}: ${text}`);
  }

  const json = await resp.json();
  const parts = json?.candidates?.[0]?.content?.parts ?? [];

  let imageData = null;
  let blurb = `A ${species.common} (${species.latin}) blooming in ${month}.`;

  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith('image/')) {
      imageData = part.inlineData.data; // base64
    }
    if (part.text) {
      blurb = part.text.trim().slice(0, 280);
    }
  }

  if (!imageData) throw new Error('No image in Gemini response');
  return { imageData, blurb };
}

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  const dryRun = process.env.DRY_RUN === '1';

  if (!apiKey && !dryRun) {
    console.error('GEMINI_API_KEY is required (or set DRY_RUN=1)');
    process.exit(1);
  }

  const allSpecies = JSON.parse(readFileSync(SPECIES_PATH, 'utf8'));
  const states = targetStates ?? Object.keys(allSpecies);

  console.log(`Generating ${states.length} flowers for ${targetDate}${dryRun ? ' [DRY RUN]' : ''}`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (const state of states) {
    const stateDir = join(DOCS_DIR, state);
    const webpPath = join(stateDir, `${targetDate}.webp`);
    const jsonPath = join(stateDir, `${targetDate}.json`);

    if (existsSync(webpPath) && existsSync(jsonPath)) {
      console.log(`  ${state}: already exists, skipping`);
      skip++;
      continue;
    }

    const species = allSpecies[state];
    if (!species) {
      console.warn(`  ${state}: no species data, skipping`);
      skip++;
      continue;
    }

    const picked = pickSpecies(species, state, targetDate);
    console.log(`  ${state}: ${picked.common} (${picked.latin})`);

    try {
      mkdirSync(stateDir, { recursive: true });

      if (dryRun) {
        writeFileSync(webpPath, Buffer.alloc(0));
        writeFileSync(
          jsonPath,
          JSON.stringify({
            common: picked.common,
            latin: picked.latin,
            blurb: `[DRY RUN] ${picked.common} blooming today.`,
            generatedAt: new Date().toISOString(),
          }),
        );
      } else {
        const { imageData, blurb } = await generateImage(apiKey, picked, state);
        writeFileSync(webpPath, Buffer.from(imageData, 'base64'));
        writeFileSync(
          jsonPath,
          JSON.stringify({
            common: picked.common,
            latin: picked.latin,
            blurb,
            generatedAt: new Date().toISOString(),
          }),
        );
      }
      ok++;
    } catch (e) {
      console.error(`  ${state}: FAILED — ${e.message}`);
      fail++;
    }

    // Avoid hammering the free-tier rate limit (10 rpm)
    if (!dryRun) await new Promise(r => setTimeout(r, 6500));
  }

  console.log(`\nDone: ${ok} generated, ${skip} skipped, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

run();
