"use client";

import { EnvironmentStatusTable } from "./EnvironmentStatusTable";
import type { LaunchCheck } from "@/types/launch";

interface Props {
  checks: LaunchCheck[];
}

export function SupabaseHealthPanel({ checks }: Props) {
  return <EnvironmentStatusTable checks={checks} title="Supabase Health" />;
}
