"use client";

import { getAudits } from "@/lib/storage/auditStore";
import { getOrders } from "@/lib/storage/orderStore";
import { getLeads } from "@/lib/storage/leadStore";
import { getEvents } from "@/lib/storage/analyticsStore";
import { getAnonymousId } from "@/lib/identity/anonymousId";

export interface MigrationPreview {
  auditsCount: number;
  ordersCount: number;
  leadsCount: number;
  analyticsCount: number;
  auditsWithImages: number;
}

export function getMigrationPreview(): MigrationPreview {
  const audits = getAudits();
  return {
    auditsCount: audits.length,
    ordersCount: getOrders().length,
    leadsCount: getLeads().length,
    analyticsCount: getEvents().length,
    auditsWithImages: audits.filter((a) => a.imageDataUrl).length,
  };
}

export async function migrateAudits(): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  const audits = getAudits();

  for (const audit of audits) {
    try {
      // Check if already exists in Supabase
      const checkRes = await fetch(`/api/audits/${audit.id}`);
      if (checkRes.ok) {
        success++;
        continue; // Skip duplicates
      }

      // Upload image first if exists
      let imagePath = "";
      if (audit.imageDataUrl) {
        const imgRes = await fetch("/api/storage/upload-audit-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageDataUrl: audit.imageDataUrl,
            anonymousId: getAnonymousId(),
            fileName: `migration-${audit.id.slice(0, 8)}`,
          }),
        });
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          imagePath = imgData.imagePath;
        }
      }

      // Create audit in Supabase
      const auditRes = await fetch("/api/audits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          anonymousId: getAnonymousId(),
          auditType: audit.auditType,
          goal: audit.goal,
          budgetRange: audit.budgetRange,
          imagePath: imagePath || undefined,
          imageMeta: audit.imageMeta,
          deepInput: audit.deepInput,
          personalization: audit.personalization,
          profileTextInput: audit.profileTextInput,
        }),
      });

      if (!auditRes.ok) {
        failed++;
        continue;
      }

      const { audit: createdAudit } = await auditRes.json();
      const supabaseId = (createdAudit as Record<string, unknown>).id as string;

      // Update with score and report data
      if (audit.freeResult || audit.freeScore !== undefined) {
        await fetch(`/api/audits/${supabaseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            freeScore: audit.freeScore,
            freeResult: audit.freeResult,
            reportStatus: audit.reportStatus,
            unlockedProducts: audit.unlockedProducts,
            fullReport: audit.fullReport,
            quickFixReport: audit.quickFixReport,
            datingProfileReport: audit.datingProfileReport,
            glowupPlan: audit.glowupPlan,
          }),
        });
      }

      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

export async function migrateOrders(): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  const orders = getOrders();

  for (const order of orders) {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId: order.auditId,
          productType: order.productType,
          productName: order.productName,
          originalAmount: order.originalAmount || order.amount,
          discountCode: order.discountCode,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount || order.amount,
          status: order.status,
          customerName: order.customerName,
          customerContact: order.customerContact,
          upiTransactionRef: order.upiTransactionRef,
        }),
      });

      if (res.ok) success++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

export async function migrateLeads(): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  const leads = getLeads();

  for (const lead of leads) {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          contact: lead.contact,
          interestProduct: lead.interestProduct,
          note: lead.note,
          source: lead.source,
        }),
      });

      if (res.ok) success++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}

export async function migrateAnalytics(): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;
  const events = getEvents();

  for (const event of events) {
    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventName: event.event,
          ...(event.metadata || {}),
        }),
      });

      if (res.ok) success++;
      else failed++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}
