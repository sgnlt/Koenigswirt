export const MAX_RESERVATION_GUESTS = 50;
export const MAX_RESERVATION_ADVANCE_DAYS = 90;

export type ReservationField = "name" | "email" | "phone" | "guests" | "datetime" | "notes";

export type ReservationState =
  | { status: "idle" }
  | { status: "success" }
  /** The reservation was rejected by validation; guest can correct the highlighted fields. */
  | { status: "invalid"; fieldErrors: Partial<Record<ReservationField, string>> }
  /** The reservation email could not be sent; guest is pointed to the phone number. */
  | { status: "failed" };
