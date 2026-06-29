"use client";

import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function UnlockPage() {
  const [code, setCode] = useState("");

  return (
    <Container className="py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-center text-3xl font-bold text-white">Unlock Report</h1>
        <Card>
          <p className="mb-4 text-sm text-gray-400">
            Enter your unlock code to access your purchased report.
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter unlock code"
            className="mb-4 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none"
          />
          <Button className="w-full" disabled={!code.trim()}>
            Unlock
          </Button>
        </Card>
      </div>
    </Container>
  );
}
