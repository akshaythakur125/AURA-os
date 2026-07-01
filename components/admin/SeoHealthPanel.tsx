"use client";

import { EnvironmentStatusTable } from "./EnvironmentStatusTable";
import type { LaunchCheck } from "@/types/launch";

interface Props {
  checks: LaunchCheck[];
}

export function SeoHealthPanel({ checks }: Props) {
  return <EnvironmentStatusTable checks={checks} title="SEO & Public Pages Health" />;
}
