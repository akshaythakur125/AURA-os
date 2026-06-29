import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: 2024</p>

        <div className="space-y-6 text-sm leading-relaxed text-gray-400">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Data We Process</h2>
            <p>
              AuraCheck processes images and profile text that you voluntarily upload or enter for audit purposes. 
              All processing happens entirely in your browser using native JavaScript and canvas APIs.
              We do not store images on any server, transmit them over the network, or process them using external AI services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Local Storage</h2>
            <p>
              Audit results, uploaded images (as data URLs), user preferences, orders, analytics events, leads, 
              referral data, challenge entries, progress comparisons, and onboarding state are stored in your browser&apos;s 
              <span className="text-gray-300"> localStorage</span>. This data never leaves your device.
            </p>
            <p className="mt-2">
              You can view, export, or delete your data at any time from the{" "}
              <Link href="/data" className="text-purple-400 hover:underline">Data Management page</Link>.
              Clearing browser site data will also remove all stored information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Image Processing</h2>
            <p>
              When you upload an image, AuraCheck reads pixel data from a canvas element to estimate 
              lighting, clarity, contrast, saturation, composition, and background complexity scores. 
              No image data is sent to any server, API, or third party. No AI model processes your image 
              in this MVP version.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">User Consent</h2>
            <p>
              Before creating an audit, you confirm that you own the uploaded image or have permission to analyze it.
              You acknowledge that AuraCheck analyzes presentation signals only and does not measure human worth.
              You agree not to use AuraCheck to harass, shame, or publicly rank others.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Data Deletion</h2>
            <p>
              You can delete specific data types (audits, orders, analytics, etc.) or all data from the 
              Data Management page. All destructive actions require typing DELETE to confirm.
              Alternatively, clearing your browser&apos;s localStorage for this site removes all data immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Manual Payment Disclaimer</h2>
            <p>
              Premium report unlocks are handled via manual UPI transfer. AuraCheck does not automatically 
              verify payments. No payment card or bank information is collected or stored by the app.
              Payment is processed entirely through your UPI app outside of AuraCheck.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Protected Trait Analysis</h2>
            <p>
              AuraCheck does not infer, analyze, or store caste, religion, ethnicity, sexuality, health conditions, 
              exact income, or any other protected personal trait. The app is designed to analyze visual presentation 
              signals only — lighting, clarity, composition, background, outfit fit, and profile text coherence.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">No Guarantee of Outcomes</h2>
            <p>
              AuraCheck provides guidance and suggestions based on rule-based analysis. It does not guarantee 
              any social, professional, romantic, or financial outcomes. Scores are not objective truth and 
              should not be treated as professional advice.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-white">Contact</h2>
            <p>
              For privacy concerns or data requests, reach out to{" "}
              <span className="text-purple-300">{process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@auracheck.in"}</span>.
            </p>
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
