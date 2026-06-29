import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const products = [
  {
    name: "Free Aura Score",
    price: "0",
    desc: "Quick snapshot of your first impression.",
    features: ["Single photo scan", "Basic aura score", "3 leak insights"],
    href: "/audit/new",
  },
  {
    name: "Full Aura Report",
    price: "99",
    desc: "Deep analysis with upgrade roadmap.",
    features: ["Up to 3 photos", "Full score breakdown", "Unlimited leak detection", "Priority upgrade plan"],
    href: "/products/aura-report",
    highlighted: true,
  },
  {
    name: "Dating Profile Audit",
    price: "299",
    desc: "Optimize your dating profile presentation.",
    features: ["Profile screenshot analysis", "Bio & photo coherence check", "Platform-specific tips", "Competitive signal audit"],
    href: "/products/dating-audit",
  },
  {
    name: "30-Day Glow-Up Plan",
    price: "499",
    desc: "Weekly upgrade plan with tracking.",
    features: ["Full audit every week", "Personalized upgrade tasks", "Progress tracking", "Priority support"],
    href: "/products/glowup-plan",
  },
];

export default function PricingPage() {
  return (
    <Container className="py-12">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">Choose your audit depth</h1>
        <p className="text-lg text-gray-400">Start free. Go deeper when you are ready.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Card
            key={product.name}
            className={`relative flex flex-col ${product.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
          >
            {product.highlighted && (
              <span className="absolute -top-2 right-4 inline-flex items-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2.5 py-0.5 text-xs text-purple-300">
                Popular
              </span>
            )}
            <div className="mb-1 text-xs text-gray-500">one-time</div>
            <h3 className="text-lg font-bold text-white">{product.name}</h3>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">&#8377;{product.price}</span>
            </div>
            <p className="mt-2 text-xs text-gray-400">{product.desc}</p>
            <ul className="mt-4 flex-1 space-y-2">
              {product.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-300">
                  <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Link href={product.href}>
                <Button variant={product.highlighted ? "primary" : "outline"} className="w-full text-xs" size="sm">
                  {product.price === "0" ? "Start Free" : "Learn More"}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
