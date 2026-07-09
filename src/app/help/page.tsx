import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const faqs = [
  {
    q: "How does AuraCheck work?",
    a: "Upload a photo or profile screenshot and AuraCheck analyzes it using browser-based rules. You get an Aura Score, status leaks, and an upgrade plan. Everything runs locally — no image leaves your device.",
  },
  {
    q: "How does local-only storage work?",
    a: "All your data — audits, orders, analytics, and preferences — is stored in your browser's localStorage. It never leaves your device. Clearing browser data will remove it. You can export a backup from the Data Management page.",
  },
  {
    q: "How do I create an audit?",
    a: "Click 'Start Aura Check' from the header. Select your audit type (Photo, Instagram, Dating, Outfit, or Room), choose a goal and budget, personalize your preferences, upload an image, and generate your free score.",
  },
  {
    q: "How do I unlock paid reports?",
    a: "After generating a free score, visit the Unlock page. Select the product (Full Aura Report ₹99, Dating Audit ₹299, or Glow-Up Plan ₹499), send payment via UPI to the displayed ID, and contact the owner with your transaction reference to receive an unlock code.",
  },
  {
    q: "How do I get an unlock code?",
    a: "After submitting payment via UPI, contact the owner through WhatsApp (button available on the Unlock page) or email. Provide your order details. The admin will generate a unique unlock code for your product.",
  },
  {
    q: "How do I export or restore my data?",
    a: "Go to Data page. Click 'Download Backup' to export all data as JSON. To restore, select a backup file and choose Merge or Replace mode. The import validates the file structure before applying.",
  },
  {
    q: "How do I install the app on my phone?",
    a: "Open AuraCheck in Chrome on Android, tap the menu (three dots), and select 'Add to Home screen'. On iOS Safari, tap the Share button and select 'Add to Home Screen'. Desktop Chrome users can click the install icon in the address bar.",
  },
  {
    q: "I lost my reports after clearing browser data",
    a: "Reports stored in localStorage are removed when you clear browser data. Always export your data before clearing. If you have a backup file, go to Data page and import it.",
  },
  {
    q: "My unlock code is not working",
    a: "Ensure the code matches exactly (case-sensitive). Check that you are using the correct code for the specific product (AURA-xxx for Full Report, DATE-xxx for Dating Audit, GLOW-xxx for Glow-Up Plan). Contact support if issues persist.",
  },
  {
    q: "Image upload is failing",
    a: "Ensure your image is JPEG, PNG, or WebP format and under 8 MB. Try a different browser (Chrome recommended). If using iOS Safari, try taking a new photo instead of selecting from gallery.",
  },
  {
    q: "Share card is not downloading",
    a: "Share card generation uses browser canvas API. If download fails, try using Chrome on desktop or Android. On iOS, the share card may appear as a new tab instead of a direct download.",
  },
  {
    q: "UPI link is not opening",
    a: "UPI deep links may not work on all devices. Manually copy the UPI ID and send payment through your UPI app (Google Pay, PhonePe, Paytm).",
  },
  {
    q: "Data import failed",
    a: "Ensure the file is a valid JSON backup exported from AuraCheck. The file must contain the 'appName', 'version', and 'data' fields. If the file is corrupted, try restoring from an earlier backup.",
  },
];

export default function HelpPage() {
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@auracheck.in";
  const whatsapp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP;

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
            Help & Support
          </h1>
          <p className="mt-3 text-gray-400">
            Everything you need to know about using AuraCheck.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.q} className="group rounded-xl border border-white/[0.04] bg-white/[0.02]">
              <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-medium text-white hover:bg-white/[0.03]">
                <svg className="h-4 w-4 shrink-0 text-purple-400 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {faq.q}
              </summary>
              <div className="px-5 pb-4 text-sm leading-relaxed text-gray-400">
                {faq.a}
              </div>
            </details>
          ))}
        </div>

        {/* Contact */}
        <Card className="mt-10 text-center">
          <h2 className="mb-3 text-lg font-semibold text-white">Still need help?</h2>
          <p className="mb-4 text-sm text-gray-400">
            Reach out to us directly.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`mailto:${supportEmail}`} className="text-sm text-purple-400 hover:text-purple-300 underline">{supportEmail}</a>
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-emerald-400 hover:text-emerald-300 underline"
              >
                WhatsApp Owner
              </a>
            )}
          </div>
        </Card>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/data"><Button variant="outline" size="sm">Manage Data</Button></Link>
          <Link href="/privacy-center"><Button variant="outline" size="sm">Privacy Center</Button></Link>
          <Link href="/audit/new"><Button size="sm">Start Aura Check</Button></Link>
        </div>
      </div>
    </Container>
  );
}
