"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/storage/analyticsStore";
import { useEffectOnce } from "@/lib/utils/effectOnce";
import Link from "next/link";

export default function InstallPage() {
  useEffectOnce(() => {
    trackEvent("pwa_install_page_viewed");
  });

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Install AuraCheck</h1>
          <p className="text-lg text-gray-400">Add AuraCheck to your home screen for quick access.</p>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Chrome on Android</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-300">
              <li>Open AuraCheck in Chrome.</li>
              <li>Tap the <strong className="text-white">menu icon</strong> (three dots) in the top-right corner.</li>
              <li>Tap <strong className="text-white">Add to Home screen</strong>.</li>
              <li>Tap <strong className="text-white">Add</strong> in the dialog.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Safari on iPhone / iPad</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-300">
              <li>Open AuraCheck in Safari.</li>
              <li>Tap the <strong className="text-white">Share icon</strong> (square with arrow) at the bottom.</li>
              <li>Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.</li>
              <li>Tap <strong className="text-white">Add</strong> in the top-right corner.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Desktop Chrome / Edge</h2>
            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-300">
              <li>Open AuraCheck in Chrome or Edge.</li>
              <li>Look for the <strong className="text-white">install icon</strong> (monitor with arrow) in the address bar.</li>
              <li>Click <strong className="text-white">Install</strong>.</li>
              <li>Open AuraCheck from your desktop or start menu.</li>
            </ol>
          </Card>

          <Card className="border-amber-500/20">
            <h2 className="mb-3 text-sm font-semibold text-amber-400">Note</h2>
            <p className="text-sm text-gray-400">
              AuraCheck works entirely in your browser. Installing it as a PWA gives you a dedicated app-like experience, but all data still stays on your device.
            </p>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
