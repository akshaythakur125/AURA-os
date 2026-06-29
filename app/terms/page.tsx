import { Container } from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Terms of Service</h1>
      <div className="prose prose-invert max-w-3xl space-y-6 text-gray-400">
        <p>
          By using AuraCheck, you agree to the following terms. AuraCheck is provided as an
          informational and entertainment tool for self-assessment purposes.
        </p>
        <section>
          <h2 className="text-lg font-semibold text-white">Use at Your Own Risk</h2>
          <p>
            AuraCheck is an MVP (Minimum Viable Product). Scores and recommendations are generated
            by rule-based logic and should be treated as guidance, not objective truth.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Prohibited Uses</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Do not use AuraCheck to harass, shame, or judge others</li>
            <li>Do not infer or assert conclusions about protected traits</li>
            <li>Do not rely on AuraCheck for professional or medical advice</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">No Guarantees</h2>
          <p>
            AuraCheck makes no guarantees about the accuracy, completeness, or usefulness of any
            scores, recommendations, or insights provided.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Local Data</h2>
          <p>
            All data is stored locally in your browser. You are responsible for backing up any
            data you wish to keep. Clearing browser data will permanently remove all information.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Limitation of Liability</h2>
          <p>
            AuraCheck and its creator are not liable for any decisions made based on the app&apos;s
            output. Use the app at your own discretion.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-white">Changes</h2>
          <p>
            These terms may be updated at any time. Continued use after changes constitutes
            acceptance of the new terms.
          </p>
        </section>
      </div>
    </Container>
  );
}
