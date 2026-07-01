"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { isRazorpayConfigured, getPublicRazorpayKeyId } from "@/lib/razorpay/env";
import type { ProductType } from "@/lib/payments/productCatalog";

interface RazorpayCheckoutButtonProps {
  auditId: string;
  productType: ProductType;
  productName: string;
  amount: number;
  offerCode?: string;
  customerName?: string;
  customerContact?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, handler: (...args: unknown[]) => void) => void };
  }
}

export function RazorpayCheckoutButton({
  auditId,
  productType,
  productName,
  amount,
  offerCode,
  customerName,
  customerContact,
  onSuccess,
  onError,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean | null>(null);

  const razorpayConfigured =
    typeof window !== "undefined" && !!getPublicRazorpayKeyId() && isRazorpayConfigured();

  const loadRazorpayScript = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;
    if (scriptLoaded === false) return false;

    try {
      const result = await new Promise<boolean>((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
      setScriptLoaded(result);
      return result;
    } catch {
      setScriptLoaded(false);
      return false;
    }
  }, [scriptLoaded]);

  const handlePayment = async () => {
    if (!razorpayConfigured) {
      setError("Online payment not available. Use manual UPI unlock instead.");
      onError?.("Razorpay not configured");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order
      const createRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          productType,
          offerCode: offerCode || undefined,
          customerName: customerName || undefined,
          customerContact: customerContact || undefined,
        }),
      });

      const createData = await createRes.json();

      if (!createRes.ok) {
        throw new Error(createData.error || "Failed to create order");
      }

      if (createData.freeUnlock) {
        // Offer made it free — skip Razorpay checkout
        if (onSuccess) onSuccess();
        return;
      }

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load payment gateway. Use manual UPI unlock instead.");
      }

      // Step 3: Open checkout
      const options = {
        key: createData.razorpayKeyId,
        amount: createData.amountPaise,
        currency: createData.currency || "INR",
        name: "AuraCheck",
        description: createData.productName || productName,
        order_id: createData.razorpayOrderId,
        prefill: {
          name: customerName || "",
          contact: customerContact || "",
        },
        theme: { color: "#a855f7" },
        handler: async function (response: RazorpayResponse) {
          setLoading(true);
          try {
            // Step 4: Verify payment
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appOrderId: createData.appOrderId,
                auditId,
                productType,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              throw new Error(verifyData.error || "Payment verification failed");
            }

            if (onSuccess) onSuccess();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "Verification failed";
            setError(msg);
            onError?.(msg);
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay!(options);
      rzp.open();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!razorpayConfigured) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? "Processing…" : `Pay ₹${amount} securely with Razorpay`}
      </Button>
      {error && (
        <Card className="border-red-500/20 bg-red-500/5 p-3">
          <p className="text-xs text-red-400">{error}</p>
        </Card>
      )}
      <p className="text-center text-xs text-gray-500">
        Online payments unlock automatically after verification.
      </p>
    </div>
  );
}
