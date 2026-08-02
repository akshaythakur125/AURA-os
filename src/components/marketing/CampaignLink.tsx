"use client";

import Link, { type LinkProps } from "next/link";
import { useEffect, useState } from "react";
import type { PropsWithChildren } from "react";

const CAMPAIGN_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"];

export function CampaignLink({ href, children, ...props }: PropsWithChildren<LinkProps>) {
  const path = typeof href === "string" ? href : href.toString();
  const [campaignHref, setCampaignHref] = useState<string | LinkProps["href"]>(href);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const query = new URLSearchParams();
    for (const key of CAMPAIGN_PARAMS) {
      const value = searchParams.get(key);
      if (value) query.set(key, value);
    }
    const suffix = query.toString();
    if (suffix) setCampaignHref(`${path}${path.includes("?") ? "&" : "?"}${suffix}`);
  }, [path]);

  return <Link href={campaignHref} {...props}>{children}</Link>;
}
