"use server";

import { headers } from "next/headers";
import { buildCatalog } from "@/lib/takeaway/catalog";
import { isOrderingOpen, takeawayConfig } from "@/lib/takeaway/config";
import { sendOrderEmail } from "@/lib/takeaway/mail";
import { isRateLimited, recordAttempt } from "@/lib/takeaway/rate-limit";
import type { OrderState } from "@/lib/takeaway/types";
import { validateOrder } from "@/lib/takeaway/validate";

export async function placeOrder(_previous: OrderState, formData: FormData): Promise<OrderState> {
  if (!isOrderingOpen(takeawayConfig)) {
    console.error("[takeaway] Order rejected: content/takeaway.json is incomplete");
    return { status: "failed" };
  }
  // Same response as any other failure, so bots learn nothing. A real guest
  // whose browser autofilled the trap still gets the phone number.
  if (formData.get("website")) return { status: "failed" };

  const forwarded = (await headers()).get("x-forwarded-for");
  const client = forwarded?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(client)) {
    console.warn("[takeaway] Order rejected: rate limit reached");
    return { status: "failed" };
  }

  const result = validateOrder(
    {
      name: formData.get("name"),
      phone: formData.get("phone"),
      pickup: formData.get("pickup"),
      items: formData.get("items"),
    },
    { catalog: buildCatalog(takeawayConfig.orderableItemIds), config: takeawayConfig, now: new Date() },
  );
  if (!result.ok) return { status: "invalid", fieldErrors: result.fieldErrors };

  // Only valid orders count, so a guest correcting typos is never locked out.
  recordAttempt(client);
  return (await sendOrderEmail(result.order)) ? { status: "success" } : { status: "failed" };
}
