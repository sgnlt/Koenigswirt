import type { CatalogLine } from "./catalog";
import type { TakeawayConfig } from "./config";
import { formatEuro, weekdayName, weekdayShortName } from "./format";
import { MAX_QUANTITY_PER_LINE, type OrderField } from "./types";

const MAX_LINES = 50;
const MAX_ITEMS_PAYLOAD = 5000;
const MINUTE = 60_000;

export type ValidOrder = {
  name: string;
  phone: string;
  pickup: { label: string };
  lines: { item: CatalogLine; quantity: number; lineTotalCents: number }[];
  totalCents: number;
};

export type RawOrder = { name: unknown; phone: unknown; pickup: unknown; items: unknown };

type Result =
  | { ok: true; order: ValidOrder }
  | { ok: false; fieldErrors: Partial<Record<OrderField, string>> };

type Checked<T> = { value: T; error?: undefined } | { error: string; value?: undefined };

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

// Includes line breaks, tabs and DEL, none of which belong in these fields.
const CONTROL_CHARS = /\p{Cc}/u;

function validateName(value: unknown): Checked<string> {
  const name = text(value);
  if (!name) return { error: "Bitte geben Sie Ihren Namen ein." };
  if (name.length < 2 || name.length > 100 || CONTROL_CHARS.test(name)) {
    return { error: "Bitte geben Sie einen gültigen Namen ein (2 bis 100 Zeichen)." };
  }
  return { value: name };
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

function minutesOfDay(hhmm: string) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Berlin wall clock as a UTC timestamp. Pickup input is wall-clock too, so the
 * two compare directly and windows need no time-zone conversion.
 */
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

function validatePickup(value: unknown, config: TakeawayConfig, now: Date): Checked<{ label: string }> {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(text(value));
  if (!match) return { error: "Bitte wählen Sie Datum und Uhrzeit für die Abholung." };

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const pickup = new Date(Date.UTC(year, month - 1, day, hour, minute));
  // Date.UTC rolls over impossible values such as 31 February or 25:00.
  if (
    pickup.getUTCMonth() !== month - 1 ||
    pickup.getUTCDate() !== day ||
    pickup.getUTCHours() !== hour ||
    pickup.getUTCMinutes() !== minute
  ) {
    return { error: "Bitte wählen Sie Datum und Uhrzeit für die Abholung." };
  }

  const nowWall = berlinWallClock(now);
  if (pickup.getTime() <= nowWall) {
    return { error: "Der Abholzeitpunkt muss in der Zukunft liegen." };
  }
  const lead = config.leadTimeMinutes ?? 0;
  if (pickup.getTime() < nowWall + lead * MINUTE) {
    return { error: `Bitte planen Sie mindestens ${lead} Minuten Vorlauf ein.` };
  }
  if (pickup.getTime() > nowWall + config.maxAdvanceDays * 1440 * MINUTE) {
    return { error: `Bitte wählen Sie einen Termin innerhalb der nächsten ${config.maxAdvanceDays} Tage.` };
  }

  const isoWeekday = pickup.getUTCDay() || 7;
  const minutes = hour * 60 + minute;
  const inWindow = config.pickupWindows.some(
    (window) =>
      window.weekday === isoWeekday &&
      minutes >= minutesOfDay(window.from) &&
      minutes <= minutesOfDay(window.to),
  );
  if (!inWindow) return { error: "Zu dieser Zeit ist keine Abholung möglich." };

  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    value: {
      label: `${weekdayName(isoWeekday)}, ${pad(day)}.${pad(month)}.${year}, ${pad(hour)}:${pad(minute)} Uhr`,
    },
  };
}

export type PickupDaySlots = {
  /** YYYY-MM-DD in Europe/Berlin wall-clock time */
  dateKey: string;
  /** Short human label, e.g. "Heute", "Morgen", or "Sa, 07.11." */
  shortLabel: string;
  /** Secondary date label, e.g. "Mo, 02.11." */
  dateLabel: string;
  /** Full weekday name + date, e.g. "Montag, 02.11.2026" */
  fullLabel: string;
  /** Valid 15-minute slots for this date */
  slots: {
    /** Full value for the pickup input: YYYY-MM-DDTHH:MM */
    value: string;
    /** Display time: HH:MM */
    time: string;
  }[];
};

/**
 * Computes available pickup days and 15-minute time slots within `maxAdvanceDays`
 * in Europe/Berlin wall-clock time, respecting `leadTimeMinutes` and `pickupWindows`.
 */
export function getAvailablePickupDays(
  config: TakeawayConfig,
  now: Date,
): PickupDaySlots[] {
  if (config.pickupWindows.length === 0) return [];
  const nowWall = berlinWallClock(now);
  const lead = config.leadTimeMinutes ?? 0;
  const step = 15 * MINUTE;
  const earliest = Math.ceil((nowWall + Math.max(lead, 1) * MINUTE) / step) * step;
  const latest = nowWall + config.maxAdvanceDays * 1440 * MINUTE;
  const pad = (n: number) => String(n).padStart(2, "0");

  const nowDate = new Date(nowWall);
  const todayKey = `${nowDate.getUTCFullYear()}-${pad(nowDate.getUTCMonth() + 1)}-${pad(nowDate.getUTCDate())}`;
  const tomorrowDate = new Date(
    Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate() + 1),
  );
  const tomorrowKey = `${tomorrowDate.getUTCFullYear()}-${pad(tomorrowDate.getUTCMonth() + 1)}-${pad(tomorrowDate.getUTCDate())}`;

  const byDate = new Map<string, PickupDaySlots>();

  for (let ts = earliest; ts <= latest; ts += step) {
    const candidate = new Date(ts);
    const isoWeekday = candidate.getUTCDay() || 7;
    const minutes = candidate.getUTCHours() * 60 + candidate.getUTCMinutes();
    const inWindow = config.pickupWindows.some(
      (window) =>
        window.weekday === isoWeekday &&
        minutes >= minutesOfDay(window.from) &&
        minutes <= minutesOfDay(window.to),
    );
    if (!inWindow) continue;

    const year = candidate.getUTCFullYear();
    const month = pad(candidate.getUTCMonth() + 1);
    const day = pad(candidate.getUTCDate());
    const hour = pad(candidate.getUTCHours());
    const minute = pad(candidate.getUTCMinutes());
    const dateKey = `${year}-${month}-${day}`;
    const time = `${hour}:${minute}`;
    const value = `${dateKey}T${time}`;

    let group = byDate.get(dateKey);
    if (!group) {
      const shortDate = `${day}.${month}.`;
      const dateLabel = `${weekdayShortName(isoWeekday)}, ${shortDate}`;
      const shortLabel =
        dateKey === todayKey
          ? "Heute"
          : dateKey === tomorrowKey
            ? "Morgen"
            : weekdayName(isoWeekday);
      group = {
        dateKey,
        shortLabel,
        dateLabel:
          dateKey === todayKey || dateKey === tomorrowKey ? dateLabel : shortDate,
        fullLabel: `${weekdayName(isoWeekday)}, ${day}.${month}.${year}`,
        slots: [],
      };
      byDate.set(dateKey, group);
    }
    group.slots.push({ value, time });
  }

  return [...byDate.values()];
}

/**
 * Formats a `YYYY-MM-DDTHH:MM` pickup string into a readable German label
 * (e.g. "Montag, 02.11.2026 um 18:00 Uhr").
 */
export function formatPickupDisplay(value: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (
    dt.getUTCMonth() !== month - 1 ||
    dt.getUTCDate() !== day ||
    dt.getUTCHours() !== hour ||
    dt.getUTCMinutes() !== minute
  ) {
    return null;
  }
  const isoWeekday = dt.getUTCDay() || 7;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${weekdayName(isoWeekday)}, ${pad(day)}.${pad(month)}.${year} um ${pad(hour)}:${pad(minute)} Uhr`;
}

/**
 * Returns the earliest valid pickup slot in `YYYY-MM-DDTHH:MM` format
 * (Europe/Berlin wall-clock time, rounded up to a 15-minute step).
 */
export function suggestPickupTime(config: TakeawayConfig, now: Date): string | null {
  if (config.pickupWindows.length === 0) return null;
  const nowWall = berlinWallClock(now);
  const lead = config.leadTimeMinutes ?? 0;
  const step = 15 * MINUTE;
  const earliest = Math.ceil((nowWall + Math.max(lead, 1) * MINUTE) / step) * step;
  const latest = nowWall + config.maxAdvanceDays * 1440 * MINUTE;
  const pad = (n: number) => String(n).padStart(2, "0");

  for (let ts = earliest; ts <= latest; ts += step) {
    const candidate = new Date(ts);
    const isoWeekday = candidate.getUTCDay() || 7;
    const minutes = candidate.getUTCHours() * 60 + candidate.getUTCMinutes();
    const inWindow = config.pickupWindows.some(
      (window) =>
        window.weekday === isoWeekday &&
        minutes >= minutesOfDay(window.from) &&
        minutes <= minutesOfDay(window.to),
    );
    if (inWindow) {
      return `${candidate.getUTCFullYear()}-${pad(candidate.getUTCMonth() + 1)}-${pad(candidate.getUTCDate())}T${pad(candidate.getUTCHours())}:${pad(candidate.getUTCMinutes())}`;
    }
  }
  return null;
}

function validateItems(
  value: unknown,
  catalog: CatalogLine[],
  config: TakeawayConfig,
): Checked<{ lines: ValidOrder["lines"]; totalCents: number }> {
  const invalid = { error: "Ihr Warenkorb enthält ungültige Artikel. Bitte prüfen Sie ihn erneut." };
  if (typeof value !== "string" || value.length > MAX_ITEMS_PAYLOAD) return invalid;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return invalid;
  }
  if (!Array.isArray(parsed) || parsed.length > MAX_LINES) return invalid;
  if (parsed.length === 0) return { error: "Ihr Warenkorb ist leer." };

  // Only key and quantity are read: name, price and total always come from the menu.
  const quantities = new Map<string, number>();
  for (const entry of parsed) {
    const { key, quantity } = (entry ?? {}) as { key?: unknown; quantity?: unknown };
    if (typeof key !== "string" || !Number.isInteger(quantity)) return invalid;
    const merged = (quantities.get(key) ?? 0) + (quantity as number);
    if ((quantity as number) < 1 || merged > MAX_QUANTITY_PER_LINE) return invalid;
    quantities.set(key, merged);
  }

  const byKey = new Map(catalog.map((line) => [line.key, line]));
  const lines: ValidOrder["lines"] = [];
  for (const [key, quantity] of quantities) {
    const line = byKey.get(key);
    if (!line) return invalid;
    lines.push({ item: line, quantity, lineTotalCents: line.priceCents * quantity });
  }

  const totalCents = lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
  if (config.minOrderCents !== null && totalCents < config.minOrderCents) {
    return { error: `Der Mindestbestellwert beträgt ${formatEuro(config.minOrderCents)}.` };
  }
  if (config.maxOrderCents !== null && totalCents > config.maxOrderCents) {
    return { error: `Der maximale Bestellwert beträgt ${formatEuro(config.maxOrderCents)}.` };
  }
  return { value: { lines, totalCents } };
}

export function validateOrder(
  raw: RawOrder,
  { catalog, config, now }: { catalog: CatalogLine[]; config: TakeawayConfig; now: Date },
): Result {
  const name = validateName(raw.name);
  const phone = validatePhone(raw.phone);
  const pickup = validatePickup(raw.pickup, config, now);
  const items = validateItems(raw.items, catalog, config);

  if (name.value && phone.value && pickup.value && items.value) {
    return {
      ok: true,
      order: { name: name.value, phone: phone.value, pickup: pickup.value, ...items.value },
    };
  }
  const fieldErrors: Partial<Record<OrderField, string>> = {};
  if (name.error) fieldErrors.name = name.error;
  if (phone.error) fieldErrors.phone = phone.error;
  if (pickup.error) fieldErrors.pickup = pickup.error;
  if (items.error) fieldErrors.items = items.error;
  return { ok: false, fieldErrors };
}
