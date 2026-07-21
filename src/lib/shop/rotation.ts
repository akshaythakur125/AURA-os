/**
 * 72-hour catalog rotation.
 *
 * The catalog is deterministic (same 923 looks every load), so "freshness"
 * comes from *which* looks surface first. We derive a rotation seed from a
 * fixed 72-hour epoch: every visitor inside the same 72h window sees the same
 * order (stable, no hydration drift), and the whole grid re-orders when the
 * window rolls over. No backend, no fake "live" prices — just an honest,
 * predictable rotation every 72 hours.
 *
 * The rotation only changes ORDER. Each look keeps its own matched image,
 * retailer links and price, so rotation can never introduce a mismatch.
 */

export const ROTATION_HOURS = 72;
const ROTATION_MS = ROTATION_HOURS * 60 * 60 * 1000;

/** Which 72-hour window we're in (integer that ticks up every 72h). */
export function getRotationEpoch(now: number = Date.now()): number {
  return Math.floor(now / ROTATION_MS);
}

/** Start instant of the current 72-hour window. */
export function getRotationStart(now: number = Date.now()): Date {
  return new Date(getRotationEpoch(now) * ROTATION_MS);
}

/** Instant the catalog next rotates. */
export function getNextRotation(now: number = Date.now()): Date {
  return new Date((getRotationEpoch(now) + 1) * ROTATION_MS);
}

/** Whole hours remaining until the next rotation (>= 0). */
export function hoursUntilNextRotation(now: number = Date.now()): number {
  return Math.max(0, Math.ceil((getNextRotation(now).getTime() - now) / 3_600_000));
}

/** Deterministic PRNG (mulberry32) — same seed always yields the same stream. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Returns a copy of `items` re-ordered for the given 72-hour epoch.
 * Deterministic Fisher–Yates seeded by the epoch: identical for everyone in
 * the window, fully re-shuffled when the window advances.
 */
export function rotateLooks<T>(items: T[], epoch: number = getRotationEpoch()): T[] {
  const rng = mulberry32((epoch * 2654435761 + 0x9e3779b9) | 0);
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
