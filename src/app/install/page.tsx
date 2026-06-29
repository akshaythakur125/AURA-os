"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { trackEvent } from "@/lib/storage/analyticsStore";

export default function InstallPage() {
  useEffect(() => {
    trackEvent({ eventName: "pwa_install_page_viewed" });
  }, []);

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-2xl">
        <SectionHeading title="Install AuraCheck" subtitle="Get the app-like experience on your device." />

        <Card className="mb-8">
          <Badge variant="premium" className="mb-3">Browser Install</Badge>
          <h3 className="mb-4 text-lg font-semibold text-white">Chrome on Android</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">1</span>
              Open AuraCheck in Chrome.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">2</span>
              Tap the menu icon (three dots) in the top-right corner.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">3</span>
              Tap &quot;Add to Home screen&quot; or &quot;Install app&quot;.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">4</span>
              Follow the prompts to install.
            </li>
          </ol>
        </Card>

        <Card className="mb-8">
          <Badge variant="premium" className="mb-3">iOS / Safari</Badge>
          <h3 className="mb-4 text-lg font-semibold text-white">Safari on iPhone/iPad</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">1</span>
              Open AuraCheck in Safari.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">2</span>
              Tap the Share button (square with arrow) at the bottom.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">3</span>
              Scroll down and tap &quot;Add to Home Screen&quot;.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">4</span>
              Tap &quot;Add&quot; in the top-right corner.
            </li>
          </ol>
        </Card>

        <Card className="mb-8">
          <Badge variant="premium" className="mb-3">Desktop</Badge>
          <h3 className="mb-4 text-lg font-semibold text-white">Chrome / Edge on Desktop</h3>
          <ol className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">1</span>
              Open AuraCheck in Chrome or Edge.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">2</span>
              Look for the install icon in the address bar (or menu).
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] text-purple-300">3</span>
              Click &quot;Install&quot; to add AuraCheck as a standalone app.
            </li>
          </ol>
        </Card>

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-center text-xs text-gray-600">
          <p>AuraCheck is a progressive web app. Once installed, it works like a native app on your device.</p>
          <p className="mt-1">Your data remains local in your browser. No uploads, no servers.</p>
        </div>
      </div>
    </Container>
  );
}
