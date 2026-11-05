"use server";

import { headers } from "next/headers";
import { sendReservationEmail } from "@/lib/reservation/mail";
import {
  MAX_RESERVATION_ADVANCE_DAYS,
  type ReservationState,
} from "@/lib/reservation/types";
import { validateReservation } from "@/lib/reservation/validate";
import { takeawayConfig } from "@/lib/takeaway/config";
import { isRateLimited, recordAttempt } from "@/lib/takeaway/rate-limit";

export async function placeReservation(
  _previous: ReservationState,
  formData: FormData,
): Promise<ReservationState> {
  // Honeypot trap for bots.
  if (formData.get("website")) return { status: "failed" };

  const forwarded = (await headers()).get("x-forwarded-for");
  const client = forwarded?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(client)) {
    console.warn("[reservation] Reservation rejected: rate limit reached");
    return { status: "failed" };
  }

  const result = validateReservation(
    {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      guests: formData.get("guests"),
      datetime: formData.get("datetime"),
      notes: formData.get("notes"),
    },
    {
      windows: takeawayConfig.pickupWindows,
      leadTimeMinutes: takeawayConfig.leadTimeMinutes,
      maxAdvanceDays: MAX_RESERVATION_ADVANCE_DAYS,
      now: new Date(),
    },
  );
  if (!result.ok) return { status: "invalid", fieldErrors: result.fieldErrors };

  recordAttempt(client);
  return (await sendReservationEmail(result.reservation))
    ? { status: "success" }
    : { status: "failed" };
}
