import "server-only";
import { renderReservationEmail } from "./email";
import type { ValidReservation } from "./validate";

const REQUIRED = ["ADMIN_EMAIL", "RESEND_API_KEY"] as const;
const DEFAULT_FROM = "Königswirt Reservierung <onboarding@resend.dev>";

/** Resolves only once Resend has accepted the reservation message for the admin. */
export async function sendReservationEmail(reservation: ValidReservation): Promise<boolean> {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    if (process.env.NODE_ENV === "development") {
      const mail = renderReservationEmail(reservation);
      console.info(
        `[reservation] Dev mode (no Resend env): simulated email "${mail.subject}"\n${mail.text}`,
      );
      return true;
    }
    console.error(`[reservation] Reservation not sent: missing env ${missing.join(", ")}`);
    return false;
  }

  const from = process.env.ORDER_FROM_EMAIL?.trim() || DEFAULT_FROM;
  const to = process.env.ADMIN_EMAIL!.trim();
  const { subject, text, html } = renderReservationEmail(reservation);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: reservation.email,
        subject,
        text,
        html,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      let errorName = "unknown";
      try {
        const data = (await response.json()) as { name?: string };
        if (data?.name) errorName = data.name;
      } catch {
        // Ignore JSON parse errors on non-JSON error responses.
      }
      console.error(
        `[reservation] Reservation not sent: Resend HTTP ${response.status} (${errorName})`,
      );
      return false;
    }

    return true;
  } catch (error) {
    const name = error instanceof Error ? error.name : "unknown";
    console.error(`[reservation] Reservation not sent: Resend request error (${name})`);
    return false;
  }
}
