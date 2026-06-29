import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const plans = [
  {
    name: "Free Aura Score",
    price: "0",
    tagline: "Quick snapshot of your first impression.",
    features: [
      "Basic aura score out of 100",
      "Your single biggest status leak",
      "Quick-fix suggestions",
      "Local-only result — stays in your browser",
    ],
    href: "/audit/new",
  },
  {
    name: "Full Aura Report",
    price: "99",
    tagline: "Deep analysis with a clear upgrade roadmap.",
    features: [
      "Up to 3 photos analyzed",
      "Detailed visual breakdown per photo",
      "Status leak explanation with severity",
      "Budget upgrade plan ranked by cost",
      "What to fix before spending more on anything",
    ],
    href: "/products/aura-report",
    highlighted: true,
  },
  {
    name: "Dating / Profile Audit",
    price: "299",
    tagline: "Optimize how you present yourself on dating apps and social profiles.",
    features: [
      "Profile screenshot analysis",
      "Bio and prompt guidance",
      "Photo order strategy",
      "Red-flag cleanup suggestions",
      "Platform-specific tips (Hinge, Bumble, Instagram)",
    ],
    href: "/products/dating-audit",
    disclaimer: "No dating guarantees. AuraCheck analyzes presentation, not outcomes.",
  },
  {
    name: "30-Day Glow-Up Plan",
    price: "499",
    tagline: "A structured month-long roadmap for your visual upgrade.",
    features: [
      "4-week plan with weekly focus areas",
      "Daily missions and habit trackers",
      "Budget roadmap from free to high-impact",
      "Full presentation system",
      "Before/after comparison support",
    ],
    href: "/products/glowup-plan",
    disclaimer: "No transformation guarantees. Results depend on individual effort and consistency.",
  },
];

const faqs = [
  {
    q: "Can I try before paying?",
    a: "Yes. The free Aura Score gives you a baseline assessment. You only pay if you want deeper analysis.",
  },
  {
    q: "How do I pay?",
    a: "Payments are manual via UPI in the current MVP. After payment, you will receive an unlock code to access your report.",
  },
  {
    q: "Is my image stored on a server?",
    a: "No. All processing is local. No image is uploaded to any external server.",
  },
  {
    q: "What if I am not satisfied?",
    a: "Since the entire analysis runs locally in your browser, we encourage you to test the free tier first before purchasing a deeper audit.",
  },
];

export default function PricingPage() {
  return (
    <Container className="py-12">
      {/* ─── Header ─── */}
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">
          Choose your audit depth
        </h1>
        <p className="text-lg text-gray-400">
          Start free. Go deeper when you are ready. All prices are one-time.
        </p>
      </div>

      {/* ─── Plans Grid ─── */}
      <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${plan.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
          >
            {plan.highlighted && (
              <Badge variant="premium" className="absolute -top-2 right-4">
                Popular
              </Badge>
            )}
            <div className="mb-1 text-xs text-gray-500">one-time</div>
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">
                &#8377;{plan.price}
              </span>
              {plan.price !== "0" && (
                <span className="text-xs text-gray-500">only</span>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-400">{plan.tagline}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {plan.disclaimer && (
              <p className="mt-3 text-[10px] leading-relaxed text-gray-600">
                {plan.disclaimer}
              </p>
            )}
            <div className="mt-6">
              <Link href={plan.href}>
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full text-xs"
                  size="sm"
                >
                  {plan.price === "0" ? "Start Free" : "Learn More"}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* ─── Comparison Table ─── */}
      <div className="mx-auto mb-16 max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          Compare what you get
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.03]">
                <th className="px-4 py-3 font-semibold text-white">Feature</th>
                <th className="px-4 py-3 text-center text-xs text-gray-400">Free</th>
                <th className="px-4 py-3 text-center text-xs text-purple-300">Aura Report</th>
                <th className="px-4 py-3 text-center text-xs text-gray-400">Dating Audit</th>
                <th className="px-4 py-3 text-center text-xs text-gray-400">Glow-Up Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {[
                { label: "Score out of 100", values: ["Basic", "Detailed", "Detailed", "Detailed"] },
                { label: "Photos analyzed", values: ["1", "Up to 3", "Up to 3", "Up to 3"] },
                { label: "Status leak detection", values: ["Top 1", "Unlimited", "Unlimited", "Unlimited"] },
                { label: "Budget upgrade plan", values: ["—", "✓", "✓", "✓"] },
                { label: "Profile text analysis", values: ["—", "—", "✓", "—"] },
                { label: "30-day roadmap", values: ["—", "—", "—", "✓"] },
                { label: "Before/after tracking", values: ["—", "—", "—", "✓"] },
              ].map((row) => (
                <tr key={row.label} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-2.5 text-gray-300">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="px-4 py-2.5 text-center text-xs">
                      {v === "✓" ? (
                        <span className="text-emerald-400">✓</span>
                      ) : v === "—" ? (
                        <span className="text-gray-600">—</span>
                      ) : (
                        <span className="text-gray-400">{v}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">
          Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.q}>
              <h3 className="mb-2 text-sm font-semibold text-white">{faq.q}</h3>
              <p className="text-sm text-gray-400">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* ─── Final CTA ─── */}
      <div className="mt-16 text-center">
        <h2 className="mb-4 text-2xl font-bold text-white">
          Not sure where to start?
        </h2>
        <p className="mb-6 text-gray-400">
          Begin with the free Aura Score. It takes two minutes and tells you
          your biggest status leak at no cost.
        </p>
        <Link href="/audit/new">
          <Button size="lg">Start Free Aura Check</Button>
        </Link>
      </div>
    </Container>
  );
}
