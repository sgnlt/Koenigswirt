import "server-only";
import nodemailer from "nodemailer";
import { renderOrderEmail } from "./email";
import type { ValidOrder } from "./validate";

const REQUIRED = ["ADMIN_EMAIL", "ORDER_FROM_EMAIL", "SMTP_HOST", "SMTP_PORT"] as const;

/** Resolves only once the SMTP server has accepted the message for the admin. */
export async function sendOrderEmail(order: ValidOrder): Promise<boolean> {
  const missing = REQUIRED.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    if (process.env.NODE_ENV === "development") {
      const mail = renderOrderEmail(order);
      console.info(`[takeaway] Dev mode (no SMTP env): simulated email "${mail.subject}"\n${mail.text}`);
      return true;
    }
    console.error(`[takeaway] Order not sent: missing env ${missing.join(", ")}`);
    return false;
  }

  const port = Number(process.env.SMTP_PORT);
  const { SMTP_USER: user, SMTP_PASS: pass } = process.env;
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  try {
    const info = await transport.sendMail({
      from: process.env.ORDER_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      ...renderOrderEmail(order),
    });
    if (info.accepted.length === 0) {
      console.error("[takeaway] Order not sent: recipient rejected by SMTP server");
      return false;
    }
    return true;
  } catch (error) {
    // Codes only: a full error can echo the message, which holds customer data.
    const { code, responseCode } = error as { code?: string; responseCode?: number };
    console.error(`[takeaway] Order not sent: SMTP error code=${code} response=${responseCode}`);
    return false;
  }
}
