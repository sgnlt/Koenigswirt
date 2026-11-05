import type { PickupWindow } from "@/lib/takeaway/config";
import { weekdayName } from "@/lib/takeaway/format";
import {
  MAX_RESERVATION_ADVANCE_DAYS,
  MAX_RESERVATION_GUESTS,
  type ReservationField,
} from "./types";

const MINUTE = 60_000;
const MAX_NOTES_LENGTH = 500;

export type ValidReservation = {
  name: string;
  email: string;
  phone: string;
  guests: number;
  datetime: { label: string };
  notes: string;
};

export type RawReservation = {
  name: unknown;
  email: unknown;
  phone: unknown;
  guests: unknown;
  datetime: unknown;
  notes?: unknown;
};

export type ReservationValidationOptions = {
  windows: PickupWindow[];
  leadTimeMinutes: number | null;
  maxAdvanceDays?: number;
  now: Date;
};

type Result =
  | { ok: true; reservation: ValidReservation }
  | { ok: false; fieldErrors: Partial<Record<ReservationField, string>> };

type Checked<T> = { value: T; error?: undefined } | { error: string; value?: undefined };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

// Includes line breaks, tabs and DEL, none of which belong in single-line fields.
const CONTROL_CHARS = /\p{Cc}/u;
// Allows \n and \t in multi-line notes after \r\n normalization, rejects other control chars.
const MULTILINE_CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/;

function validateName(value: unknown): Checked<string> {
  const name = text(value);
  if (!name) return { error: "Bitte geben Sie Ihren Namen ein." };
  if (name.length < 2 || name.length > 100 || CONTROL_CHARS.test(name)) {
    return { error: "Bitte geben Sie einen gültigen Namen ein (2 bis 100 Zeichen)." };
  }
  return { value: name };
}

function validateEmail(value: unknown): Checked<string> {
  const email = text(value);
  if (!email) return { error: "Bitte geben Sie Ihre E-Mail-Adresse ein." };
  if (
    email.length > 254 ||
    CONTROL_CHARS.test(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
  ) {
    return { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." };
  }
  return { value: email };
}

function validatePhone(value: unknown): Checked<string> {
  const phone = text(value);
  if (!phone) return { error: "Bitte geben Sie Ihre Telefonnummer ein." };
  const digits = phone.replace(/\D/g, "").length;
  if (!/^\+?[0-9][0-9 ()/.-]*$/.test(phone) || digits < 6 || digits > 15) {
    return { error: "Bitte geben Sie eine gültige Telefonnummer ein." };
  }
  return { value: phone };
}

function validateGuests(value: unknown): Checked<number> {
  const raw = typeof value === "number" ? String(value) : text(value);
  if (!raw) return { error: "Bitte geben Sie die Personenanzahl an." };
  if (!/^\d+$/.test(raw)) {
    return { error: `Bitte wählen Sie eine gültige Personenanzahl (1 bis ${MAX_RESERVATION_GUESTS}).` };
  }
  const count = Number(raw);
  if (!Number.isInteger(count) || count < 1 || count > MAX_RESERVATION_GUESTS) {
    return { error: `Bitte wählen Sie eine Personenanzahl zwischen 1 und ${MAX_RESERVATION_GUESTS}.` };
  }
  return { value: count };
}

function validateNotes(value: unknown): Checked<string> {
  if (value === undefined || value === null || value === "") return { value: "" };
  if (typeof value !== "string") return { error: "Ungültige Eingabe bei den Anmerkungen." };
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (normalized.length > MAX_NOTES_LENGTH) {
    return { error: `Ihre Anmerkung darf maximal ${MAX_NOTES_LENGTH} Zeichen lang sein.` };
  }
  if (MULTILINE_CONTROL_CHARS.test(normalized)) {
    return { error: "Ihre Anmerkung enthält ungültige Zeichen." };
  }
  return { value: normalized };
}

function minutesOfDay(hhmm: string) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

function berlinWallClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    hourCycle: "h23",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(now);
  const part = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(part("year"), part("month") - 1, part("day"), part("hour"), part("minute"));
}

function validateDatetime(
  value: unknown,
  options: ReservationValidationOptions,
): Checked<{ label: string }> {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text(value));
  if (!match) return { error: "Bitte wählen Sie Datum und Uhrzeit für Ihre Reservierung." };

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const target = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    target.getUTCMonth() !== month - 1 ||
    target.getUTCDate() !== day ||
    target.getUTCHours() !== hour ||
    target.getUTCMinutes() !== minute
  ) {
    return { error: "Bitte wählen Sie ein gültiges Datum und eine gültige Uhrzeit." };
  }

  const nowWall = berlinWallClock(options.now);
  if (target.getTime() <= nowWall) {
    return { error: "Der Reservierungszeitpunkt muss in der Zukunft liegen." };
  }
  const lead = options.leadTimeMinutes ?? 0;
  if (target.getTime() < nowWall + lead * MINUTE) {
    return { error: `Bitte planen Sie mindestens ${lead} Minuten Vorlauf ein.` };
  }
  const maxDays = options.maxAdvanceDays ?? MAX_RESERVATION_ADVANCE_DAYS;
  if (target.getTime() > nowWall + maxDays * 1440 * MINUTE) {
    return { error: `Bitte wählen Sie einen Termin innerhalb der nächsten ${maxDays} Tage.` };
  }

  const isoWeekday = target.getUTCDay() || 7;
  const minutes = hour * 60 + minute;
  if (options.windows.length > 0) {
    const inWindow = options.windows.some(
      (window) =>
        window.weekday === isoWeekday &&
        minutes >= minutesOfDay(window.from) &&
        minutes <= minutesOfDay(window.to),
    );
    if (!inWindow) {
      return { error: "Zu dieser Uhrzeit ist leider keine Reservierung möglich." };
    }
  }

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    value: {
      label: `${weekdayName(isoWeekday)}, ${pad(day)}.${pad(month)}.${year}, ${pad(hour)}:${pad(minute)} Uhr`,
    },
  };
}

export function validateReservation(
  raw: RawReservation,
  options: ReservationValidationOptions,
): Result {
  const name = validateName(raw.name);
  const email = validateEmail(raw.email);
  const phone = validatePhone(raw.phone);
  const guests = validateGuests(raw.guests);
  const datetime = validateDatetime(raw.datetime, options);
  const notes = validateNotes(raw.notes);

  if (
    name.value !== undefined &&
    email.value !== undefined &&
    phone.value !== undefined &&
    guests.value !== undefined &&
    datetime.value !== undefined &&
    notes.value !== undefined
  ) {
    return {
      ok: true,
      reservation: {
        name: name.value,
        email: email.value,
        phone: phone.value,
        guests: guests.value,
        datetime: datetime.value,
        notes: notes.value,
      },
    };
  }

  const fieldErrors: Partial<Record<ReservationField, string>> = {};
  if (name.error) fieldErrors.name = name.error;
  if (email.error) fieldErrors.email = email.error;
  if (phone.error) fieldErrors.phone = phone.error;
  if (guests.error) fieldErrors.guests = guests.error;
  if (datetime.error) fieldErrors.datetime = datetime.error;
  if (notes.error) fieldErrors.notes = notes.error;
  return { ok: false, fieldErrors };
}
