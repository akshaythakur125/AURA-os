import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Contact & Support — AuraCheck",
  description: "Get in touch with AuraCheck support for payment, report, or account questions.",
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fixmyaura.shop";
const OWNER_WHATSAPP = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || "";

export default function ContactPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-[#1C1917]">Contact &amp; Support</h1>
        <p className="mb-8 text-sm text-[#857b6e]">
          Questions about a payment, your report, or your data? We&apos;re happy to help.
        </p>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#857b6e]">Email</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-1 block text-lg font-semibold text-[#1C1917] hover:text-[#B23A25]">
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-1 text-sm text-[#6f675e]">We typically respond within 2–3 business days.</p>
          </div>

          {OWNER_WHATSAPP && (
            <div className="rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#857b6e]">WhatsApp</p>
              <a
                href={`https://wa.me/${OWNER_WHATSAPP.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-lg font-semibold text-[#1C1917] hover:text-[#B23A25]"
              >
                {OWNER_WHATSAPP}
              </a>
            </div>
          )}

          <div className="rounded-2xl border border-[#1c1917]/10 bg-[#1c1917]/[0.02] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#857b6e]">For payment issues, include</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[#6f675e]">
              <li>Your Razorpay payment ID (from the confirmation)</li>
              <li>Your audit ID, if you have it</li>
              <li>A short description of what went wrong</li>
            </ul>
            <p className="mt-3 text-xs text-[#857b6e]">
              See our <Link href="/refund" className="text-[#B23A25] underline">Refund &amp; Cancellation Policy</Link> for how billing errors are handled.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/help"><Button variant="outline" size="sm">Help &amp; FAQ</Button></Link>
          <Link href="/refund"><Button variant="outline" size="sm">Refund Policy</Button></Link>
        </div>
      </div>
    </Container>
  );
}
