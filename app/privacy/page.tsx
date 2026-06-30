import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

const supportEmail = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPPORT_EMAIL : undefined;

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Privacy Policy</h1>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Local-Only Operation</h2>
            <p className="text-sm text-gray-300">
              AuraCheck operates entirely in your browser. No data is sent to any external server. Audit results, uploaded images (as data URLs), user preferences, payment requests, challenge entries, progress comparisons, and other app data are stored in your browser&apos;s localStorage. This data never leaves your device.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Image Processing</h2>
            <p className="text-sm text-gray-300">
              Images you upload are processed entirely on your device using your browser&apos;s Canvas API. No image data is uploaded, transmitted, or stored on any external server. Pixel data is analyzed locally using TypeScript-based rules. No AI model, cloud API, or external service is used.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">User Consent</h2>
            <p className="text-sm text-gray-300">
              By using AuraCheck, you confirm that you own the images you upload or have permission to use them. You understand that scores and recommendations are guidance, not objective truth, and that all analysis is for self-improvement and presentation guidance purposes.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">No Protected Trait Analysis</h2>
            <p className="text-sm text-gray-300">
              AuraCheck analyzes presentation signals such as lighting, clarity, composition, grooming, outfit, and background. It does not infer or judge caste, religion, ethnicity, race, sexuality, gender identity, health, fitness, exact income, intelligence, morality, character, or any other protected trait.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">No Outcome Guarantees</h2>
            <p className="text-sm text-gray-300">
              AuraCheck provides presentation guidance for self-improvement and entertainment. It does not guarantee dating success, social outcomes, career results, or any other real-world outcomes. Profile guidance is for presentation clarity, not dating guarantees. Glow-up plans are self-improvement guidance, not a guarantee of social outcomes.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Manual Payment Disclaimer</h2>
            <p className="text-sm text-gray-300">
              The current MVP uses a manual UPI payment flow. AuraCheck does not automatically verify payments. Payment records are stored locally and are used to facilitate manual unlock by the owner/admin. No financial data is transmitted through the app. No automatic payment gateway integration exists in this MVP.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Data Deletion</h2>
            <p className="text-sm text-gray-300">
              You can delete your data at any time through the <Link href="/data" className="text-purple-400 hover:underline">Data page</Link>. Clearing your browser&apos;s localStorage will also remove all stored information. Since no data is stored on any server, there is no external data to request deletion of.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Data Export</h2>
            <p className="text-sm text-gray-300">
              You can export all your AuraCheck data as a JSON file from the <Link href="/data" className="text-purple-400 hover:underline">Data page</Link>. This backup can be reimported later to restore your data.
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Contact</h2>
            <p className="text-sm text-gray-300">
              For questions about this policy, contact the owner{supportEmail ? ` at ` : "."}
              {supportEmail && <a href={`mailto:${supportEmail}`} className="text-purple-400 hover:underline">{supportEmail}</a>}
            </p>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/privacy-center" className="text-sm text-purple-400 hover:underline">View Privacy Center &rarr;</Link>
        </div>
      </div>
    </Container>
  );
}
