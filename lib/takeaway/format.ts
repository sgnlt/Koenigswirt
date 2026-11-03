export function formatEuro(cents: number) {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export function lineTitle(line: { name: string; variantLabel: string | null }) {
  return line.variantLabel ? `${line.name} (${line.variantLabel})` : line.name;
}

const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

export function weekdayName(isoWeekday: number) {
  return WEEKDAYS[isoWeekday - 1];
}
