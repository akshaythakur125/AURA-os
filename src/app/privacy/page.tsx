import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function PrivacyPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="Privacy Policy"
        subtitle="Last updated: 2024"
        align="left"
      />
      <div className="prose prose-invert mx-auto max-w-3xl text-gray-400">
        <p>
          AuraCheck respects your privacy. This policy explains how we handle
          your data.
        </p>
        <h3 className="mt-8 text-white">Data We Collect</h3>
        <p>
          We process images and profile data you voluntarily upload for audit
          purposes. All processing currently happens locally in your browser.
          We do not store images on any server.
        </p>
        <h3 className="mt-8 text-white">How We Use Data</h3>
        <p>
          Uploaded content is used solely to generate your Aura Score and audit
          report. We do not train models, sell data, or share personal
          information with third parties.
        </p>
        <h3 className="mt-8 text-white">Local Storage</h3>
        <p>
          Audit results and preferences are stored in your browser&apos;s
          localStorage. You can clear this data at any time.
        </p>
        <h3 className="mt-8 text-white">Contact</h3>
        <p>
          For privacy concerns, reach out to{" "}
          <span className="text-purple-300">support@auracheck.in</span>.
        </p>
      </div>
    </Container>
  );
}
