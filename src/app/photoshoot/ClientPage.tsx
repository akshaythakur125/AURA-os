"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { FadeInView } from "@/components/ui/FadeInView";
import { PAYMENT_PRODUCTS, formatPrice } from "@/config/pricing";
import { PHOTOSHOOT_STYLES } from "@/lib/photoshoot/stylePresets";
import { getLatestAudit } from "@/lib/storage/auditStore";
import { getUnlockByAuditId } from "@/lib/storage/unlockStore";

const PRODUCT = PAYMENT_PRODUCTS.aura_photoshoot;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB — one clear front-facing selfie

type Availability = "checking" | "available" | "dormant";

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(file);
  });
}

function Flow() {
  const searchParams = useSearchParams();
  const aesthetic = searchParams.get("aesthetic") || "";

  const [availability, setAvailability] = useState<Availability>("checking");
  const [auditId, setAuditId] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [unlocked, setUnlocked] = useState(false);

  // Flow state (only meaningful once unlocked).
  const [image, setImage] = useState<string>("");
  const [styleId, setStyleId] = useState<string>(PHOTOSHOOT_STYLES[0].id);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Resolve the buyer's audit + unlock state, and whether the product is live.
  useEffect(() => {
    const id = searchParams.get("auditId") || getLatestAudit()?.id || "";
    setAuditId(id);
    if (id) {
      const rec = getUnlockByAuditId(id);
      if (rec && rec.productType === "aura_photoshoot" && rec.status === "unlocked") {
        setUnlocked(true);
        setPaymentId(rec.unlockCode || "");
      }
    }
    let alive = true;
    fetch("/api/photoshoot/status")
      .then((r) => r.json())
      .then((d) => alive && setAvailability(d?.available ? "available" : "dormant"))
      .catch(() => alive && setAvailability("dormant"));
    return () => {
      alive = false;
    };
  }, [searchParams]);

  const onPickFile = useCallback(async (file: File | undefined) => {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError("That image is over 8MB — please pick a smaller one.");
      return;
    }
    try {
      setImage(await readFileAsDataURL(file));
    } catch {
      setError("Couldn't read that file. Try another photo.");
    }
  }, []);

  const generate = useCallback(async () => {
    if (!image || !consent || busy) return;
    setBusy(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch("/api/photoshoot/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, styleId, aesthetic, consent, paymentId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const map: Record<string, string> = {
          not_configured: "The photoshoot studio is warming up — please try again shortly.",
          disabled: "The photoshoot is temporarily paused. Please try again later.",
          rate_limited: "You've generated a lot just now — take a short break and try again.",
          payment_required: "We couldn't confirm your payment. Please reload and try again.",
          image_too_large: "That image is too large — please pick a smaller selfie.",
          generation_failed: "The studio couldn't finish that set. Please try again.",
        };
        setError(map[data?.error] || "Something went wrong generating your photoshoot.");
        return;
      }
      const data = await res.json();
      const imgs: string[] = Array.isArray(data?.images) ? data.images : [];
      if (!imgs.length) {
        setError("The studio returned no images. Please try again.");
        return;
      }
      setResults(imgs);
    } catch {
      setError("Network hiccup — please try again.");
    } finally {
      setBusy(false);
    }
  }, [image, consent, busy, styleId, aesthetic, paymentId]);

  // ── Shells ────────────────────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#F2ECE1] text-[#1C1917]">
      <Container className="py-10 sm:py-14">{children}</Container>
    </div>
  );

  const Hero = () => (
    <div className="mb-8 text-center">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-red-500 text-2xl">
        📸
      </div>
      <h1 className="text-2xl font-bold sm:text-3xl">AI Glow-Up Photoshoot</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#857b6e]">
        A studio-grade shoot generated from your own selfies
        {aesthetic ? <> — in the {aesthetic.split("—")[0].trim()} aesthetic</> : null}.
      </p>
    </div>
  );

  if (availability === "checking") {
    return (
      <Shell>
        <p className="py-16 text-center text-sm text-[#857b6e]">Loading the studio…</p>
      </Shell>
    );
  }

  // Product dormant (no provider key) — never offer to charge for it.
  if (availability === "dormant") {
    return (
      <Shell>
        <Hero />
        <FadeInView>
          <div className="mx-auto max-w-md rounded-3xl border border-[#1c1917]/10 bg-white/60 p-6 text-center">
            <div className="mb-2 text-2xl">✨</div>
            <h2 className="text-lg font-bold">Coming soon</h2>
            <p className="mt-2 text-sm text-[#4a443d]">
              The AI Glow-Up Photoshoot is almost ready. It isn&apos;t open for purchase yet — check
              back shortly and you&apos;ll be able to turn your selfies into a full studio shoot.
            </p>
            <Link href="/" className="mt-5 inline-block">
              <Button variant="secondary" size="md">
                Back to your report
              </Button>
            </Link>
          </div>
        </FadeInView>
      </Shell>
    );
  }

  // Available but not yet purchased — show the offer + unlock CTA.
  if (!unlocked) {
    return (
      <Shell>
        <Hero />
        <FadeInView>
          <div className="mx-auto max-w-md rounded-3xl border border-[#1c1917]/10 bg-white/60 p-6">
            <ul className="mb-5 space-y-2.5">
              {PRODUCT.deliverables.map((d) => (
                <li key={d} className="flex items-start gap-2.5 text-sm text-[#4a443d]">
                  <span className="mt-0.5 text-amber-500">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
            <div className="mb-4 rounded-xl border border-[#1c1917]/10 bg-[#1c1917]/[0.03] p-4 text-center">
              <div className="text-3xl font-bold">{formatPrice(PRODUCT.price)}</div>
              <div className="text-[11px] text-[#857b6e]">One-time · Yours to keep · No subscription</div>
            </div>
            {auditId ? (
              <Link href={`/unlock?auditId=${auditId}&product=aura_photoshoot`} className="block">
                <Button size="lg" className="w-full text-base font-bold">
                  Unlock My Photoshoot — {formatPrice(PRODUCT.price)}
                </Button>
              </Link>
            ) : (
              <Link href="/" className="block">
                <Button size="lg" className="w-full text-base font-bold">
                  Run your free Aura check first
                </Button>
              </Link>
            )}
            <p className="mt-3 text-center text-[10px] text-[#9c9184]">
              Secure payment via Razorpay · Your photo is sent to our AI provider (Google Gemini) to
              generate your portraits — we don&apos;t sell your photos
            </p>
          </div>
        </FadeInView>
      </Shell>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────────
  if (results.length) {
    return (
      <Shell>
        <Hero />
        <FadeInView>
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-center text-lg font-bold">Your photoshoot is ready 🎉</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {results.map((src, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-[#1c1917]/10 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Portrait ${i + 1}`} className="aspect-[4/5] w-full object-cover" />
                  <a
                    href={src}
                    download={`aura-photoshoot-${styleId}-${i + 1}.png`}
                    className="block bg-[#1c1917] py-2 text-center text-xs font-semibold text-[#F2ECE1] hover:bg-[#332f2a]"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setResults([]);
                  setError("");
                }}
              >
                Generate another style
              </Button>
              <p className="text-center text-[10px] text-[#9c9184]">
                Long-press or right-click any image to save it on mobile.
              </p>
            </div>
          </div>
        </FadeInView>
      </Shell>
    );
  }

  // ── Setup (unlocked, ready to generate) ─────────────────────────────────────
  const style = PHOTOSHOOT_STYLES.find((s) => s.id === styleId)!;
  return (
    <Shell>
      <Hero />
      <FadeInView>
        <div className="mx-auto max-w-lg space-y-6">
          {/* Step 1 — upload */}
          <section className="rounded-3xl border border-[#1c1917]/10 bg-white/60 p-5">
            <h2 className="mb-1 text-sm font-bold">1 · Upload a clear selfie</h2>
            <p className="mb-3 text-xs text-[#857b6e]">
              A well-lit, front-facing photo works best. One face, no sunglasses.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onPickFile(e.target.files?.[0])}
            />
            {image ? (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="Your selfie" className="h-20 w-20 rounded-2xl object-cover" />
                <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                  Choose a different photo
                </Button>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                Choose a photo
              </Button>
            )}
          </section>

          {/* Step 2 — style */}
          <section className="rounded-3xl border border-[#1c1917]/10 bg-white/60 p-5">
            <h2 className="mb-3 text-sm font-bold">2 · Pick your look</h2>
            <div className="grid grid-cols-2 gap-2.5">
              {PHOTOSHOOT_STYLES.map((s) => {
                const active = s.id === styleId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setStyleId(s.id)}
                    className={`rounded-2xl border p-3 text-left transition ${
                      active
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-[#1c1917]/10 bg-white hover:border-[#1c1917]/25"
                    }`}
                  >
                    <div className="text-xs font-bold">{s.label}</div>
                    <div className="mt-1 text-[10px] leading-snug text-[#857b6e]">{s.blurb}</div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-[#9c9184]">Best for: {style.bestFor}</p>
          </section>

          {/* Step 3 — consent + generate */}
          <section className="rounded-3xl border border-[#1c1917]/10 bg-white/60 p-5">
            <label className="flex items-start gap-2.5 text-xs text-[#4a443d]">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                This is a photo of me (or someone who has consented). I understand it&apos;s sent to
                our AI provider, Google&apos;s Gemini AI, to generate my portraits and is processed
                under Google&apos;s terms. We don&apos;t sell your photos.{" "}
                <Link href="/privacy" className="underline hover:text-[#1c1917]">
                  How we handle your photos
                </Link>
                .
              </span>
            </label>
            {error ? <p className="mt-3 text-xs font-medium text-red-600">{error}</p> : null}
            <Button
              size="lg"
              className="mt-4 w-full text-base font-bold"
              disabled={!image || !consent || busy}
              onClick={generate}
            >
              {busy ? "Generating your shoot… (this can take a minute)" : "Generate my photoshoot"}
            </Button>
          </section>
        </div>
      </FadeInView>
    </Shell>
  );
}

export default function PhotoshootFlow() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F2ECE1]">
          <Container className="py-16 text-center">
            <p className="text-sm text-[#857b6e]">Loading…</p>
          </Container>
        </div>
      }
    >
      <Flow />
    </Suspense>
  );
}
