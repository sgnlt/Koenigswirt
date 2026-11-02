import { formatEuro, lineTitle } from "./format";
import type { ValidOrder } from "./validate";

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Subject carries only the server-formatted pickup time, never customer input. */
export function renderOrderEmail(order: ValidOrder) {
  const subject = `Neue Abholbestellung: ${order.pickup.label}`;

  const text = [
    "Neue Abholbestellung über die Website",
    "",
    `Name: ${order.name}`,
    `Telefon: ${order.phone}`,
    `Abholung: ${order.pickup.label}`,
    "",
    "Bestellung:",
    ...order.lines.map(
      (line) =>
        `${line.quantity} x ${lineTitle(line.item)} à ${formatEuro(line.item.priceCents)} = ${formatEuro(line.lineTotalCents)}`,
    ),
    "",
    `Gesamt: ${formatEuro(order.totalCents)}`,
  ].join("\n");

  const rows = order.lines
    .map(
      (line) =>
        `<tr><td>${line.quantity} x</td><td>${escapeHtml(lineTitle(line.item))}</td><td align="right">${formatEuro(line.item.priceCents)}</td><td align="right">${formatEuro(line.lineTotalCents)}</td></tr>`,
    )
    .join("");

  const html = `<h1>Neue Abholbestellung</h1>
<p><strong>Name:</strong> ${escapeHtml(order.name)}<br>
<strong>Telefon:</strong> ${escapeHtml(order.phone)}<br>
<strong>Abholung:</strong> ${escapeHtml(order.pickup.label)}</p>
<table cellpadding="4"><thead><tr><th align="left">Menge</th><th align="left">Gericht</th><th align="right">Einzelpreis</th><th align="right">Summe</th></tr></thead><tbody>${rows}</tbody></table>
<p><strong>Gesamt: ${formatEuro(order.totalCents)}</strong></p>`;

  return { subject, text, html };
}
