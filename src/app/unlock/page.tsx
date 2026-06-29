import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { config } from "@/config";

export default function UnlockPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="Unlock Your Premium Report"
        subtitle="Complete your manual payment to access the full report."
      />

      <div className="mx-auto grid max-w-3xl gap-8 lg:grid-cols-2">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-white">
            How It Works
          </h3>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">
                1
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  Complete your audit
                </p>
                <p className="text-xs text-gray-500">
                  Run a free Aura Check first to generate your report ID.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">
                2
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  Send payment via UPI
                </p>
                <p className="text-xs text-gray-500">
                  Transfer &#8377;{config.pricing.premium} to{" "}
                  <span className="font-mono text-purple-300">
                    {config.payments.upiId || "auracheck@upi"}
                  </span>
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">
                3
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  Enter transaction ID
                </p>
                <p className="text-xs text-gray-500">
                  Paste your UPI transaction reference and submit.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-xs text-purple-300">
                4
              </span>
              <div>
                <p className="text-sm font-medium text-white">
                  Receive unlock code
                </p>
                <p className="text-xs text-gray-500">
                  Admin verifies and sends your unlock code within 24 hours.
                </p>
              </div>
            </li>
          </ol>
        </Card>

        <Card>
          <h3 className="mb-4 text-lg font-semibold text-white">
            Enter Unlock Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Audit ID
              </label>
              <input
                type="text"
                placeholder="e.g. a1b2c3d4-..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                UPI Transaction ID
              </label>
              <input
                type="text"
                placeholder="e.g. UPI123456789"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">
                Email (for unlock code)
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
              />
            </div>
            <Button className="w-full" disabled>
              Submit & Request Unlock
            </Button>
            <p className="text-center text-xs text-gray-600">
              Manual processing — unlock typically within 24 hours.
            </p>
          </div>
        </Card>
      </div>

      <Card className="mx-auto mt-8 max-w-lg text-center">
        <h4 className="mb-2 text-sm font-medium text-white">
          Already have an unlock code?
        </h4>
        <p className="mb-4 text-xs text-gray-500">
          Enter your code to instantly access premium content.
        </p>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter unlock code"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
          <Button variant="secondary" disabled>
            Redeem
          </Button>
        </div>
      </Card>
    </Container>
  );
}
