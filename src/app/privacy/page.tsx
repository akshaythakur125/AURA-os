import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Privacy Policy — AuraCheck",
  description: "AuraCheck privacy policy. How we handle your photos, audit data, and personal information. Your images stay in your browser.",
};

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-[#1C1917]">Privacy Policy</h1>
        <p className="mb-8 text-sm text-[#857b6e]">Last updated: 2024</p>

        <div className="space-y-6 text-sm leading-relaxed text-[#6f675e]">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Data We Process</h2>
            <p>
              AuraCheck processes images and profile text that you voluntarily upload or enter for audit purposes. 
              All processing happens entirely in your browser using native JavaScript and canvas APIs.
              We do not store images on any server, transmit them over the network, or process them using external AI services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Local Storage</h2>
            <p>
              Audit results, uploaded images (as data URLs), user preferences, orders, analytics events, leads, 
              referral data, challenge entries, progress comparisons, and onboarding state are stored in your browser&apos;s 
              <span className="text-[#4a443d]"> localStorage</span>. This data never leaves your device.
            </p>
            <p className="mt-2">
              You can view, export, or delete your data at any time from the{" "}
              <Link href="/data" className="text-red-400 hover:underline">Data Management page</Link>.
              Clearing browser site data will also remove all stored information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Image Processing</h2>
            <p>
              When you upload an image, AuraCheck reads pixel data from a canvas element to estimate 
              lighting, clarity, contrast, saturation, composition, and background complexity scores. 
              No image data is sent to any server, API, or third party. No AI model processes your image 
              in this MVP version.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">User Consent</h2>
            <p>
              Before creating an audit, you confirm that you own the uploaded image or have permission to analyze it.
              You acknowledge that AuraCheck analyzes presentation signals only and does not measure human worth.
              You agree not to use AuraCheck to harass, shame, or publicly rank others.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Data Deletion</h2>
            <p>
              You can delete specific data types (audits, orders, analytics, etc.) or all data from the 
              Data Management page. All destructive actions require typing DELETE to confirm.
              Alternatively, clearing your browser&apos;s localStorage for this site removes all data immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Manual Payment Disclaimer</h2>
            <p>
              Premium report unlocks are handled via manual UPI transfer. AuraCheck does not automatically 
              verify payments. No payment card or bank information is collected or stored by the app.
              Payment is processed entirely through your UPI app outside of AuraCheck.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Protected Trait Analysis</h2>
            <p>
              AuraCheck does not infer, analyze, or store caste, religion, ethnicity, sexuality, health conditions, 
              exact income, or any other protected personal trait. The app is designed to analyze visual presentation 
              signals only — lighting, clarity, composition, background, outfit fit, and profile text coherence.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">No Guarantee of Outcomes</h2>
            <p>
              AuraCheck provides guidance and suggestions based on rule-based analysis. It does not guarantee 
              any social, professional, romantic, or financial outcomes. Scores are not objective truth and 
              should not be treated as professional advice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[#1C1917]">Contact</h2>
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ? (
              <p>
                For privacy concerns or data requests, reach out to{" "}
                <span className="text-red-300">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL}</span>.
              </p>
            ) : (
              <p>
                Your data lives only in your browser. To export or permanently delete it, use the{" "}
                <a href="/privacy-center" className="text-red-300 underline">Privacy Center</a>.
              </p>
            )}
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/privacy-center"><Button variant="outline" size="sm">Privacy Center</Button></Link>
          <Link href="/data"><Button variant="outline" size="sm">Manage Data</Button></Link>
        </div>
      </div>
    </Container>
  );
}
