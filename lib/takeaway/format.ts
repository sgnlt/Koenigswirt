import type { PickupWindow } from "./config";

export function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export function lineTitle(line: { name: string; variantLabel: string | null }) {
  return line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name;
}

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function weekdayName(isoWeekday: number) {
  return WEEKDAYS[isoWeekday - 1];
}

export function weekdayShortName(isoWeekday: number) {
  return WEEKDAYS_SHORT[isoWeekday - 1];
}

/**
 * Summarizes pickup windows concisely in German, grouping consecutive days
 * that share identical hours (e.g. "Täglich 11:30–21:00 Uhr").
 */
export function formatPickupWindowsSummary(windows: PickupWindow[]): string {
  if (windows.length === 0) return "";

  const byDay = new Map<number, string>();
  for (const w of windows) {
    const existing = byDay.get(w.weekday);
    const range = `${w.from}–${w.to} Uhr`;
    byDay.set(w.weekday, existing ? `${existing}, ${range}` : range);
  }

  const sortedDays = [...byDay.entries()].sort((a, b) => a[0] - b[0]);
  if (
    sortedDays.length === 7 &&
    sortedDays.every(([, hours]) => hours === sortedDays[0][1])
  ) {
    return `Täglich ${sortedDays[0][1]}`;
  }

  const groups: { startDay: number; endDay: number; hours: string }[] = [];
  for (const [day, hours] of sortedDays) {
    const prev = groups[groups.length - 1];
    if (prev && prev.endDay === day - 1 && prev.hours === hours) {
      prev.endDay = day;
    } else {
      groups.push({ startDay: day, endDay: day, hours });
    }
  }

  return groups
    .map((g) =>
      g.startDay === g.endDay
        ? `${weekdayName(g.startDay)} ${g.hours}`
        : `${weekdayName(g.startDay)}–${weekdayName(g.endDay)} ${g.hours}`,
    )
    .join(", ");
}
