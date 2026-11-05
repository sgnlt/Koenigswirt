import { escapeHtml } from "@/lib/takeaway/email";
import type { ValidReservation } from "./validate";

export function formatGuestsLabel(guests: number) {
  return guests === 1 ? "1 Person" : `${guests} Personen`;
}

/** Subject carries only the server-formatted date/time and guest count, never raw customer text. */
export function renderReservationEmail(reservation: ValidReservation) {
  const guestsLabel = formatGuestsLabel(reservation.guests);
  const subject = `Neue Tischreservierung: ${reservation.datetime.label} (${guestsLabel})`;

  const textLines = [
    "Neue Tischreservierungsanfrage über die Website",
    "",
    `Termin: ${reservation.datetime.label}`,
    `Personenanzahl: ${guestsLabel}`,
    `Name: ${reservation.name}`,
    `E-Mail: ${reservation.email}`,
    `Telefon: ${reservation.phone}`,
  ];
  if (reservation.notes) {
    textLines.push("", "Anmerkungen / Wünsche:", reservation.notes);
  }
  textLines.push(
    "",
    "Hinweis: Bitte bestätigen Sie die Reservierung direkt gegenüber dem Gast (z. B. per Antwort auf diese E-Mail).",
  );
  const text = textLines.join("\n");

  const notesHtml = reservation.notes
    ? `<p><strong>Anmerkungen / Wünsche:</strong><br>${escapeHtml(reservation.notes).replace(/\n/g, "<br>")}</p>`
    : "";

  const html = `<h1>Neue Tischreservierung</h1>
<p><strong>Termin:</strong> ${escapeHtml(reservation.datetime.label)}<br>
<strong>Personenanzahl:</strong> ${escapeHtml(guestsLabel)}<br>
<strong>Name:</strong> ${escapeHtml(reservation.name)}<br>
<strong>E-Mail:</strong> <a href="mailto:${escapeHtml(reservation.email)}">${escapeHtml(reservation.email)}</a><br>
<strong>Telefon:</strong> <a href="tel:${escapeHtml(reservation.phone)}">${escapeHtml(reservation.phone)}</a></p>
${notesHtml}
<p style="color:#655e57;font-size:13px">Hinweis: Bitte senden Sie dem Gast eine Reservierungsbestätigung (Sie können direkt auf diese E-Mail antworten).</p>`;

  return { subject, text, html };
}
