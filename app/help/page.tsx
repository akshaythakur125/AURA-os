"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const supportEmail = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_SUPPORT_EMAIL : undefined;
const ownerWhatsApp = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_OWNER_WHATSAPP : undefined;

export default function HelpPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Help &amp; Support</h1>

        <div className="space-y-6">
          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How AuraCheck Works</h2>
            <p className="text-sm text-gray-300">AuraCheck analyzes your uploaded photo using browser-based rules. It evaluates lighting, clarity, composition, background, grooming, and outfit to give you a presentation score and identify status leaks — small mismatches between how you present and how others perceive you. All processing is local. No image leaves your device.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How Local-Only Storage Works</h2>
            <p className="text-sm text-gray-300">All data — audits, reports, payment requests, challenge entries — is stored in your browser&apos;s localStorage. This means:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-gray-300">
              <li>Your data stays on your device</li>
              <li>No account or login is needed</li>
              <li>Clearing browser data will erase your AuraCheck data</li>
              <li>Use the <Link href="/data" className="text-purple-400 hover:underline">Data page</Link> to export or restore data</li>
            </ul>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Create an Audit</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
              <li>Go to <Link href="/audit/new" className="text-purple-400 hover:underline">Start Aura Check</Link>.</li>
              <li>Upload a photo (1&ndash;3 images).</li>
              <li>Select your goal (dating, Instagram, college, office, glow-up).</li>
              <li>Select your budget range.</li>
              <li>Click &quot;Analyze&quot; to generate your free Aura Score.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Unlock Paid Reports (Manual UPI)</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
              <li>Create an audit and generate a free score first.</li>
              <li>Go to the <Link href="/unlock" className="text-purple-400 hover:underline">Unlock page</Link> with your audit ID and product.</li>
              <li>Pay the amount via UPI to the displayed UPI ID.</li>
              <li>Submit your payment details (name, contact, UPI reference).</li>
              <li>Send the payment summary to the owner/admin.</li>
              <li>Once verified, you will receive an unlock code to access your report.</li>
            </ol>
            <p className="mt-3 text-xs text-amber-400">Note: This is a manual MVP flow. Payment is not automatically verified.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Get an Unlock Code</h2>
            <p className="text-sm text-gray-300">After submitting payment details, copy the payment summary and send it to the owner/admin via WhatsApp or email. The owner will generate an unlock code and share it with you. Enter the code on the unlock page to access your report.</p>
            <p className="mt-2 text-sm text-gray-300">For testing, use the demo code shown on the unlock page.</p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Export/Restore Data</h2>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
              <li>Go to the <Link href="/data" className="text-purple-400 hover:underline">Data page</Link>.</li>
              <li>Click &quot;Export as JSON&quot; to download a backup.</li>
              <li>To restore, click &quot;Choose File&quot; and select your backup JSON.</li>
              <li>Preview the data and choose merge or replace mode.</li>
              <li>Click &quot;Confirm Import&quot; to restore.</li>
            </ol>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">How to Install the App on Your Phone</h2>
            <p className="text-sm text-gray-300">AuraCheck can be installed as a Progressive Web App (PWA) on your phone or desktop for a dedicated app-like experience.</p>
            <div className="mt-3">
              <Button asChild variant="outline" size="sm"><Link href="/install">View Install Instructions</Link></Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Troubleshooting</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Lost report after clearing browser data</h3>
                <p className="text-xs text-gray-400">AuraCheck stores data in localStorage. If you clear browser data, your audits are removed. Always export a backup from the Data page before clearing browser data.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Unlock code not working</h3>
                <p className="text-xs text-gray-400">Ensure you are using the correct code for the specific product and audit. Codes are case-sensitive. If it still fails, contact the owner with your audit ID.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Image upload failing</h3>
                <p className="text-xs text-gray-400">Make sure the image is under 10 MB and in JPG, PNG, or WebP format. Try a different browser if the issue persists.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Share card not downloading</h3>
                <p className="text-xs text-gray-400">Share card download uses canvas-to-image conversion. Some browsers may block downloads in certain contexts. Try using a different browser or disabling popup blockers.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">UPI link not opening</h3>
                <p className="text-xs text-gray-400">The UPI deep link opens the default UPI app on your phone. On desktop, it may not work. Manually copy the UPI ID and amount to your phone and pay from there.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">Data import failed</h3>
                <p className="text-xs text-gray-400">Ensure the file is a valid JSON backup exported from AuraCheck. If the file is corrupt, try an earlier backup or contact support.</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-white">Still Need Help?</h2>
            <p className="mb-4 text-sm text-gray-300">If you couldn&apos;t find an answer above, reach out to the owner directly.</p>
            <div className="flex flex-wrap gap-3">
              {supportEmail && <a href={`mailto:${supportEmail}`}><Button variant="outline" size="sm">Email Support</Button></a>}
              {ownerWhatsApp && <a href={`https://wa.me/${ownerWhatsApp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">WhatsApp</Button></a>}
              <Button asChild variant="ghost" size="sm"><Link href="/privacy-center">Privacy Center</Link></Button>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}
