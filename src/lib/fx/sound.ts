/**
 * Tiny Web Audio sound kit — no asset files (CSP-safe), tones are synthesised.
 * Used sparingly for the paid unlock reveal. Respects a persisted mute toggle
 * and browser autoplay rules: audio only sounds once the context is unlocked by
 * a user gesture (we also resume it on the first pointer/keydown), and silently
 * no-ops otherwise. Never loops, never plays on the free experience.
 */

const MUTE_KEY = "aura_sfx_muted";
let _ctx: AudioContext | null = null;
let _unlockBound = false;

export function isMuted(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(m: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, m ? "1" : "0");
  } catch {
    /* ignore */
  }
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    if (!_ctx) _ctx = new AC();
    if (_ctx.state === "suspended") _ctx.resume().catch(() => {});
    // Resume on the first real gesture so later cues are audible.
    if (!_unlockBound) {
      _unlockBound = true;
      const resume = () => _ctx?.resume().catch(() => {});
      window.addEventListener("pointerdown", resume, { once: true, passive: true });
      window.addEventListener("keydown", resume, { once: true });
    }
    return _ctx;
  } catch {
    return null;
  }
}

function tone(freq: number, startAt: number, dur: number, gain: number, type: OscillatorType = "triangle"): void {
  const c = getCtx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  o.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + startAt;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/** A short, pleasant rising chime for the unlock reveal. */
export function playReveal(): void {
  if (isMuted()) return;
  tone(523.25, 0, 0.35, 0.12, "triangle"); // C5
  tone(659.25, 0.09, 0.35, 0.11, "triangle"); // E5
  tone(783.99, 0.18, 0.45, 0.12, "triangle"); // G5
  tone(1046.5, 0.30, 0.5, 0.05, "sine"); // C6 sparkle
}

/** A soft tick for small interactions. */
export function playTick(): void {
  if (isMuted()) return;
  tone(880, 0, 0.05, 0.05, "sine");
}
