import { Container } from "@/components/ui/Container";

export default function PrivacyPage() {
  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Privacy Policy</h1>
      <div className="prose prose-invert max-w-3xl space-y-6 text-gray-400">
        <p>
          AuraCheck operates entirely in your browser. No data is sent to any external server.
          This page explains how your information is handled.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-white">Local Storage</h2>
          <p>
            Audit results, uploaded images (as data URLs), user preferences, and other app data
            are stored in your browser&apos;s localStorage. This data never leaves your device.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Image Processing</h2>
          <p>
            Images you upload are processed entirely on your device using your browser&apos;s canvas API.
            No image data is uploaded, transmitted, or stored on any external server.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">No External AI</h2>
          <p>
            All analysis is performed client-side using deterministic rule-based logic.
            No AI model, cloud API, or external service is used.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Payments</h2>
          <p>
            Payments are processed manually via UPI. AuraCheck does not collect, store, or process
            payment information. No financial data is transmitted through the app.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Your Rights</h2>
          <p>
            You can view, export, or delete your data at any time. Clearing your browser&apos;s
            localStorage will remove all stored information. Since no data is stored on any server,
            there is no external data to request deletion of.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Contact</h2>
          <p>
            For questions about this policy, contact the owner through the contact information
            provided on the app.
          </p>
        </section>
      </div>
    </Container>
  );
}
