"use client";

import { EnvironmentStatusTable } from "./EnvironmentStatusTable";
import type { LaunchCheck } from "@/types/launch";

interface Props {
  checks: LaunchCheck[];
}

export function PaymentHealthPanel({ checks }: Props) {
  return <EnvironmentStatusTable checks={checks} title="Payment & Unlock Health" />;
}
