"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  return (
    <Container className="py-12">
      <h1 className="mb-8 text-3xl font-bold text-white">Dashboard</h1>
      <Card>
        <p className="text-gray-400">
          Your audits and progress will appear here. Start by creating your first audit.
        </p>
        <div className="mt-4">
          <Link href="/audit/new">
            <Button>Start Aura Check</Button>
          </Link>
        </div>
      </Card>
    </Container>
  );
}
