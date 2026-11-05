import { describe, expect, it } from "vitest";
import type { PickupWindow } from "@/lib/takeaway/config";
import { renderReservationEmail } from "./email";
import { validateReservation, type RawReservation, type ReservationValidationOptions } from "./validate";

const windows: PickupWindow[] = [{ weekday: 1, from: "11:30", to: "21:00" }];
// 12:00 in Berlin (CET, UTC+1) on Monday 2 Nov 2026.
const now = new Date("2026-11-02T11:00:00Z");

const valid: RawReservation = {
  name: "Erika Mustermann",
  email: "erika@example.com",
  phone: "+49 170 1234567",
  guests: "4",
  datetime: "2026-11-02T18:30",
  notes: "Bitte einen ruhigen Tisch am Fenster.",
};

const run = (
  patch: Partial<RawReservation>,
  options: Partial<ReservationValidationOptions> = {},
) =>
  validateReservation(
    { ...valid, ...patch },
    { windows, leadTimeMinutes: 30, maxAdvanceDays: 90, now, ...options },
  );

function errors(
  patch: Partial<RawReservation>,
  options?: Partial<ReservationValidationOptions>,
) {
  const result = run(patch, options);
  if (result.ok) throw new Error("expected rejection");
  return result.fieldErrors;
}

describe("validateReservation", () => {
  it("accepts a valid reservation request without capacity checks", () => {
    const result = run({});
    if (!result.ok) throw new Error("expected success");
    expect(result.reservation).toEqual({
      name: "Erika Mustermann",
      email: "erika@example.com",
      phone: "+49 170 1234567",
      guests: 4,
      datetime: { label: "Montag, 02.11.2026, 18:30 Uhr" },
      notes: "Bitte einen ruhigen Tisch am Fenster.",
    });
  });

  it("allows optional notes to be omitted or multiline", () => {
    const emptyNotes = run({ notes: "" });
    expect(emptyNotes.ok).toBe(true);

    const multiline = run({ notes: "Kinderstuhl\r\n1 Hund dabei" });
    if (!multiline.ok) throw new Error("expected success");
    expect(multiline.reservation.notes).toBe("Kinderstuhl\n1 Hund dabei");
  });

  it.each([
    ["empty", ""],
    ["zero", "0"],
    ["negative", "-2"],
    ["fractional", "2.5"],
    ["letters", "vier"],
    ["over max", "51"],
  ])("rejects guests: %s", (_label, guests) => {
    expect(errors({ guests }).guests).toBeTruthy();
  });

  it.each([
    ["empty", ""],
    ["missing @", "erika.example.com"],
    ["missing domain", "erika@"],
    ["spaces", "erika @example.com"],
    ["header injection", "erika@example.com\r\nBcc: evil@example.com"],
  ])("rejects email: %s", (_label, email) => {
    expect(errors({ email }).email).toBeTruthy();
  });

  it.each([
    ["past", "2026-11-02T11:30"],
    ["inside lead time", "2026-11-02T12:15"],
    ["outside opening hours", "2026-11-02T22:00"],
    ["outside opening weekday", "2026-11-03T18:30"],
    ["too far ahead", "2027-03-01T18:30"],
    ["impossible date", "2026-02-31T18:30"],
  ])("rejects datetime: %s", (_label, datetime) => {
    expect(errors({ datetime }).datetime).toBeTruthy();
  });

  it("rejects overly long or control-character notes", () => {
    expect(errors({ notes: "A".repeat(501) }).notes).toBeTruthy();
    expect(errors({ notes: "Hallo\x00Welt" }).notes).toBeTruthy();
  });
});

describe("renderReservationEmail", () => {
  it("renders reservation details in German and escapes HTML", () => {
    const result = run({
      name: '<script>alert("x")</script>',
      notes: "1 Hochstuhl & <Fensterplatz>\nDanke!",
    });
    if (!result.ok) throw new Error("expected success");
    const email = renderReservationEmail(result.reservation);

    expect(email.subject).toBe(
      "Neue Tischreservierung: Montag, 02.11.2026, 18:30 Uhr (4 Personen)",
    );
    expect(email.subject).not.toContain("script");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(email.html).toContain("1 Hochstuhl &amp; &lt;Fensterplatz&gt;<br>Danke!");
    expect(email.text).toContain("E-Mail: erika@example.com");
    expect(email.text).toContain("Telefon: +49 170 1234567");
  });
});
