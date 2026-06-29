import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default function DashboardPage() {
  return (
    <Container className="py-16">
      <SectionHeading
        title="Your Dashboard"
        subtitle="Track your audits and review past reports."
      />
      <Card className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
          <svg
            className="h-8 w-8 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="mb-2 text-lg text-gray-300">No audits yet</p>
        <p className="mb-6 text-sm text-gray-500">
          Start your first Aura Check to see your results here.
        </p>
        <Link href="/audit/new">
          <Button>Start Your First Audit</Button>
        </Link>
      </Card>
    </Container>
  );
}
