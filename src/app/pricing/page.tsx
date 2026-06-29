import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "99",
    description: "Quick snapshot of your first impression.",
    features: [
      "Single photo audit",
      "Basic aura score",
      "3 status leak insights",
      "5 upgrade suggestions",
    ],
    badge: null,
  },
  {
    name: "Premium",
    price: "299",
    description: "Deep analysis with actionable upgrade roadmap.",
    features: [
      "Up to 5 photos",
      "Full aura score breakdown",
      "Unlimited leak detection",
      "Priority upgrade plan",
      "Downloadable PDF report",
      "Unlock code access",
    ],
    badge: "Best Value",
    highlighted: true,
  },
];

export default function PricingPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="Simple Pricing"
        subtitle="Choose the plan that fits your needs. All prices in INR."
      />

      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col ${plan.highlighted ? "border-purple-500/30 ring-1 ring-purple-500/20" : ""}`}
          >
            {plan.badge && (
              <Badge variant="premium" className="absolute -top-2 right-4">
                {plan.badge}
              </Badge>
            )}
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">
                &#8377;{plan.price}
              </span>
              <span className="text-sm text-gray-500">one-time</span>
            </div>
            <p className="mt-3 text-sm text-gray-400">{plan.description}</p>
            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-gray-300">
                  <svg
                    className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
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
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link href={plan.highlighted ? "/unlock" : "/audit/new"}>
                <Button
                  variant={plan.highlighted ? "primary" : "outline"}
                  className="w-full"
                >
                  {plan.highlighted ? "Unlock Premium" : "Start Basic"}
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-center text-sm text-gray-600">
        Payments are processed manually via UPI. No automatic billing.
        <br />
        Your report is unlocked after payment verification.
      </p>
    </Container>
  );
}
