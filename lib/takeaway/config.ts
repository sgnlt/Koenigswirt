import raw from "@/content/takeaway.json";

export type PickupWindow = {
  /** ISO weekday: 1 = Monday … 7 = Sunday. */
  weekday: number;
  /** Berlin wall-clock time, "HH:MM". */
  from: string;
  to: string;
};

export type TakeawayConfig = {
  orderableItemIds: string[];
  pickupWindows: PickupWindow[];
  leadTimeMinutes: number | null;
  maxAdvanceDays: number;
  minOrderCents: number | null;
  maxOrderCents: number | null;
  privacyNotice: string | null;
  paymentNote: string | null;
  allergenNote: string | null;
};

export const takeawayConfig = raw as TakeawayConfig;

/**
 * Every value here must come from the owner, so ordering stays off until the
 * facts it depends on are filled in. See "Takeaway ordering" in README.md.
 */
export function isOrderingOpen(config: TakeawayConfig) {
  return (
    config.orderableItemIds.length > 0 &&
    config.pickupWindows.length > 0 &&
    config.leadTimeMinutes !== null &&
    Boolean(config.privacyNotice)
  );
}
