import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — AuraCheck",
  description: "AuraCheck refund and cancellation policy. Digital reports are one-time purchases with instant delivery; all sales are final.",
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fixmyaura.shop";

export default function RefundPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-[#1C1917]">Refund &amp; Cancellation Policy</h1>
        <p className="mb-8 text-sm text-[#857b6e]">Last updated: 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#6f675e]">
          <section className="rounded-xl border border-[#E14434]/20 bg-[#E14434]/[0.05] p-4">
            <h2 className="mb-2 text-lg font-semibold text-[#1C1917]">All sales are final — no refunds</h2>
            <p>
              AuraCheck sells one-time digital reports that are delivered
              <span className="font-semibold text-[#4a443d]"> instantly and in full </span>
              the moment your payment is confirmed. Because the product is a digital good
              with immediate access and cannot be &quot;returned&quot;, <span className="font-semibold text-[#4a443d]">all purchases are
              non-refundable</span>. Please review the free score and the sample report before you pay.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">What you&apos;re buying</h2>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>A one-time ₹21 Full Aura Report (or other listed one-time product), unlocked instantly after payment</li>
              <li>No subscriptions and no recurring billing — there is nothing to cancel later</li>
              <li>Scores and recommendations are presentation guidance, not objective truth or guaranteed outcomes</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">No cancellations</h2>
            <p>
              Since delivery is instant and each purchase is a single, completed transaction, orders
              cannot be cancelled once payment is confirmed. There are no partial refunds for reports
              you have already unlocked.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Billing errors &amp; failed delivery</h2>
            <p>
              This is not a product refund — it is correcting a payment problem. If you were charged but
              your report did <span className="font-semibold text-[#4a443d]">not</span> unlock due to a
              technical error, or you were charged more than once for the same order, email us within
              <span className="font-semibold text-[#4a443d]"> 7 days</span> with your payment reference and
              we will restore your access or reverse the erroneous charge. Payments that were declined or
              never completed are handled automatically by the payment provider and are not charges from us.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">How to reach us</h2>
            <p>
              For billing issues, email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#B23A25] underline">{SUPPORT_EMAIL}</a> with
              your Razorpay payment ID (and audit ID if you have it). We typically respond within 2–3 business days.
            </p>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/contact"><Button variant="outline" size="sm">Contact Support</Button></Link>
          <Link href="/terms"><Button variant="outline" size="sm">Terms of Service</Button></Link>
        </div>
      </div>
    </Container>
  );
}
