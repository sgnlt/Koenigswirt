export const MAX_QUANTITY_PER_LINE = 20;

export type OrderField = "name" | "phone" | "pickup" | "items";

export type OrderState =
  | { status: "idle" }
  | { status: "success" }
  /** The order was rejected, so nothing was sent. Guest can correct the input. */
  | { status: "invalid"; fieldErrors: Partial<Record<OrderField, string>> }
  /** The order could not be placed. Guest is pointed to the phone number. */
  | { status: "failed" };
