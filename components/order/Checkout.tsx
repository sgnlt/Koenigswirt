"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { placeOrder } from "@/app/bestellung/actions";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";
import type { CatalogLine } from "@/lib/takeaway/catalog";
import { clearCart, setQuantity, useCart } from "@/lib/takeaway/cart-store";
import { takeawayConfig } from "@/lib/takeaway/config";
import { formatEuro, lineTitle } from "@/lib/takeaway/format";
import { MAX_QUANTITY_PER_LINE, type OrderField, type OrderState } from "@/lib/takeaway/types";
import {
  formatPickupDisplay,
  getAvailablePickupDays,
  suggestPickupTime,
  type PickupDaySlots,
} from "@/lib/takeaway/validate";

const INITIAL: OrderState = { status: "idle" };
const inputClass =
  "h-12 w-full rounded-xl border border-border bg-cream px-4 text-base text-ink placeholder:text-muted transition-colors focus:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine aria-[invalid=true]:border-accent aria-[invalid=true]:bg-accent/5";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold leading-5 text-ink">
        {label} <span className="text-wine">*</span>
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-bold text-accent">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: boolean) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

type SubmittedSnapshot = {
  name: string;
  phone: string;
  pickupDisplay: string | null;
  lines: (CatalogLine & { quantity: number })[];
  total: number;
};

type Props = {
  catalog: CatalogLine[];
  pickupHint: ReactNode;
  privacyNotice: string;
  paymentNote: string | null;
  allergenNote: string | null;
};

export default function Checkout({
  catalog,
  pickupHint,
  privacyNotice,
  paymentNote,
  allergenNote,
}: Props) {
  const cart = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, INITIAL);
  const submitting = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const pickupRef = useRef<HTMLInputElement>(null);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<SubmittedSnapshot | null>(null);

  const [pickupDays, setPickupDays] = useState<PickupDaySlots[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string>("");
  const [pickupValue, setPickupValue] = useState<string>("");
  const [showCustomTime, setShowCustomTime] = useState(false);

  const byKey = new Map(catalog.map((line) => [line.key, line]));
  const lines = cart.flatMap((entry) => {
    const line = byKey.get(entry.key);
    return line ? [{ ...line, quantity: entry.quantity }] : [];
  });
  const totalCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  const fieldErrors: Partial<Record<OrderField, string>> =
    state.status === "invalid" ? state.fieldErrors : {};

  useEffect(() => {
    const now = new Date();
    const days = getAvailablePickupDays(takeawayConfig, now);
    const suggested = suggestPickupTime(takeawayConfig, now) ?? "";
    const frame = requestAnimationFrame(() => {
      setPickupDays(days);
      setPickupValue((prev) => {
        const next = prev || suggested;
        const [datePart] = next.split("T");
        if (datePart) setSelectedDayKey(datePart);
        else if (days[0]) setSelectedDayKey(days[0].dateKey);
        return next;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (state.status === "idle") return;
    submitting.current = false;
    if (state.status === "success") clearCart();
    if (state.status === "invalid") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalid) return invalid.focus();
    }
    statusRef.current?.focus();
  }, [state]);

  function selectSlot(slotValue: string) {
    setPickupValue(slotValue);
    const [datePart] = slotValue.split("T");
    if (datePart) setSelectedDayKey(datePart);
    if (pickupRef.current) pickupRef.current.value = slotValue;
  }

  function selectDay(day: PickupDaySlots) {
    setSelectedDayKey(day.dateKey);
    const currentTime = pickupValue.split("T")[1];
    const matchingSlot =
      day.slots.find((s) => s.time === currentTime) ?? day.slots[0];
    if (matchingSlot) {
      setPickupValue(matchingSlot.value);
      if (pickupRef.current) pickupRef.current.value = matchingSlot.value;
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Dispatched by hand: a plain form action would reset the fields after an error.
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const data = new FormData(event.currentTarget);
    const rawPickup = String(data.get("pickup") || pickupValue);
    data.set("pickup", rawPickup);
    data.set(
      "items",
      JSON.stringify(lines.map(({ key, quantity }) => ({ key, quantity }))),
    );
    setSubmittedSnapshot({
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      pickupDisplay: formatPickupDisplay(rawPickup),
      lines: [...lines],
      total,
    });
    startTransition(() => formAction(data));
  }

  if (state.status === "success") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="mx-auto max-w-[680px] rounded-3xl border border-forest/30 bg-parchment p-6 outline-none sm:p-10"
      >
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-forest text-xl font-bold text-cream">
          ✓
        </div>
        <h2 className="mt-4 font-playfair text-2xl font-bold text-ink sm:text-3xl">
          Vielen Dank für Ihre Bestellung!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Ihre Bestellung ist bei uns eingegangen. Wir bereiten Ihre Speisen frisch zur
          gewünschten Abholzeit vor.
        </p>

        {submittedSnapshot && (
          <div className="mt-6 rounded-2xl border border-border bg-cream p-5 text-sm">
            <div className="grid gap-4 border-b border-border pb-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Gewünschte Abholzeit
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {submittedSnapshot.pickupDisplay ?? "Gemäß Ihrer Auswahl"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Abholadresse
                </p>
                <p className="mt-1 font-semibold text-ink">
                  Königswirt · Schongauer Str. 13, 87616 Marktoberdorf
                </p>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-border/60">
              {submittedSnapshot.lines.map((line) => (
                <li
                  key={line.key}
                  className="flex items-center justify-between gap-4 py-2"
                >
                  <span className="text-ink">
                    <strong>{line.quantity}×</strong> {lineTitle(line)}
                  </span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatEuro(line.priceCents * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-bold text-ink">
              <span>Gesamtbetrag</span>
              <span className="tabular-nums">{formatEuro(submittedSnapshot.total)}</span>
            </div>
          </div>
        )}

        {paymentNote && (
          <p className="mt-4 text-sm font-medium text-ink">{paymentNote}</p>
        )}

        <p className="mt-2 text-xs text-muted">
          Bei Rückfragen oder Änderungswünschen erreichen Sie uns telefonisch unter{" "}
          <a href={PHONE_HREF} className="font-semibold text-ink underline">
            {PHONE_DISPLAY}
          </a>
          .
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/menus"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-wine px-6 text-sm font-semibold text-cream transition-colors hover:bg-wine-dark"
          >
            Zurück zur Speisekarte
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-cream px-6 text-sm font-semibold text-ink transition-colors hover:border-wine hover:text-wine"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] rounded-3xl border border-border bg-parchment/60 px-6 py-12 text-center">
        <p className="font-playfair text-2xl font-bold text-ink">
          Ihr Warenkorb ist noch leer.
        </p>
        <p className="mt-2 text-sm text-muted">
          Wählen Sie Ihre Lieblingsgerichte aus unserer Speisekarte aus, um eine
          Abholbestellung aufzugeben.
        </p>
        <Link
          href="/menus"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-wine px-6 text-sm font-semibold text-cream transition-colors hover:bg-wine-dark"
        >
          Zur Speisekarte
        </Link>
      </div>
    );
  }

  const activeDay =
    pickupDays.find((d) => d.dateKey === selectedDayKey) ?? pickupDays[0];
  const earliestSlot = pickupDays[0]?.slots[0];
  const earliestLabel = earliestSlot
    ? `${pickupDays[0].shortLabel}, ${earliestSlot.time} Uhr`
    : null;
  const formattedSelectedPickup = formatPickupDisplay(pickupValue);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_420px]">
      {/* Order Summary Card (shown first on mobile, sticky right column on desktop) */}
      <section
        aria-labelledby="cart-heading"
        className="order-1 rounded-3xl border border-border bg-parchment/75 p-5 sm:p-6 lg:order-2 lg:sticky lg:top-[110px]"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3.5">
          <div>
            <h2 id="cart-heading" className="font-playfair text-xl font-bold text-ink">
              Ihre Auswahl
            </h2>
            <p className="text-xs text-muted tabular-nums">
              {totalCount === 1 ? "1 Gericht" : `${totalCount} Gerichte`} zur Abholung
            </p>
          </div>
          <Link
            href="/menus"
            className="text-xs font-semibold text-wine underline hover:text-wine-dark"
          >
            + Weiter auswählen
          </Link>
        </div>

        <ul className="divide-y divide-border/80">
          {lines.map((line) => {
            const title = lineTitle(line);
            return (
              <li key={line.key} className="py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug text-ink">{title}</p>
                    <p className="mt-0.5 text-xs text-muted tabular-nums">
                      Einzelpreis: {formatEuro(line.priceCents)}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-playfair text-base font-bold text-ink tabular-nums">
                    {formatEuro(line.priceCents * line.quantity)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="inline-flex items-center rounded-full border border-border bg-cream p-0.5">
                    <button
                      type="button"
                      aria-label={`Menge von ${title} verringern`}
                      onClick={() => setQuantity(line.key, line.quantity - 1)}
                      className="flex size-8 items-center justify-center rounded-full text-sm font-bold text-ink transition-colors hover:bg-parchment"
                    >
                      −
                    </button>
                    <span
                      aria-live="polite"
                      className="min-w-8 px-1 text-center text-sm font-semibold text-ink tabular-nums"
                    >
                      <span className="sr-only">Menge von {title}: </span>
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Menge von ${title} erhöhen`}
                      disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
                      onClick={() => setQuantity(line.key, line.quantity + 1)}
                      className="flex size-8 items-center justify-center rounded-full text-sm font-bold text-ink transition-colors hover:bg-parchment disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    aria-label={`${title} entfernen`}
                    onClick={() => setQuantity(line.key, 0)}
                    className="min-h-8 px-2 text-xs font-medium text-muted underline transition-colors hover:text-accent"
                  >
                    Entfernen
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-base font-bold text-ink">Gesamtbetrag</span>
            <span
              aria-live="polite"
              className="font-playfair text-2xl font-bold text-ink tabular-nums"
            >
              {formatEuro(total)}
            </span>
          </div>
          {paymentNote && (
            <p className="mt-1.5 text-xs font-medium text-muted">{paymentNote}</p>
          )}
        </div>

        <div className="mt-4 rounded-2xl border border-border/80 bg-cream p-3.5 text-xs leading-relaxed text-muted">
          <p className="font-semibold text-ink">Abholort</p>
          <p>Königswirt · Schongauer Str. 13, 87616 Marktoberdorf</p>
          {allergenNote && <p className="mt-2 border-t border-border/60 pt-2">{allergenNote}</p>}
        </div>
      </section>

      {/* Pickup Time & Contact Details Form */}
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="order-2 space-y-6 lg:order-1"
      >
        <div ref={statusRef} tabIndex={-1} role="alert" className="outline-none">
          {state.status === "failed" && (
            <div className="mb-6 rounded-2xl border border-accent bg-accent/5 p-4 text-sm text-ink">
              <p className="font-bold text-accent">
                Ihre Bestellung konnte leider nicht gesendet werden.
              </p>
              <p className="mt-1">
                Bitte versuchen Sie es erneut oder bestellen Sie direkt telefonisch unter{" "}
                <a href={PHONE_HREF} className="font-semibold underline">
                  {PHONE_DISPLAY}
                </a>
                .
              </p>
            </div>
          )}
          {state.status === "invalid" && (
            <div className="mb-6 rounded-2xl border border-accent bg-accent/5 p-4 text-sm font-medium text-accent">
              {fieldErrors.items ?? "Bitte prüfen Sie die markierten Eingabefelder."}
            </div>
          )}
        </div>

        {/* Step 1: Pickup Time Booking */}
        <section
          aria-labelledby="pickup-step-heading"
          className="rounded-3xl border border-border bg-cream p-5 shadow-2xs sm:p-7"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-wine">
                Schritt 1
              </span>
              <h2
                id="pickup-step-heading"
                className="font-playfair text-xl font-bold text-ink sm:text-2xl"
              >
                Abholzeit wählen
              </h2>
            </div>
            {earliestSlot && (
              <button
                type="button"
                onClick={() => selectSlot(earliestSlot.value)}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  pickupValue === earliestSlot.value
                    ? "border-wine bg-wine text-cream"
                    : "border-wine/40 bg-parchment text-wine hover:border-wine"
                }`}
              >
                <span>Schnellstmöglich ({earliestLabel})</span>
              </button>
            )}
          </div>

          {pickupDays.length > 0 && (
            <div className="mt-5 space-y-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Tag der Abholung
                </p>
                <div
                  role="group"
                  aria-label="Tag der Abholung"
                  className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
                >
                  {pickupDays.slice(0, 7).map((day) => {
                    const isSelectedDay = day.dateKey === activeDay?.dateKey;
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        aria-pressed={isSelectedDay}
                        onClick={() => selectDay(day)}
                        className={`flex min-h-12 shrink-0 flex-col items-start justify-center rounded-xl border px-3.5 py-2 text-left transition-all ${
                          isSelectedDay
                            ? "border-wine bg-wine text-cream shadow-xs"
                            : "border-border bg-parchment/50 text-ink hover:border-wine/50 hover:bg-parchment"
                        }`}
                      >
                        <span className="text-xs font-bold leading-tight">
                          {day.shortLabel}
                        </span>
                        <span
                          className={`text-[11px] leading-tight ${
                            isSelectedDay ? "text-cream/85" : "text-muted"
                          }`}
                        >
                          {day.dateLabel}
                        </span>
                      </button>
                    );
                  })}

                  {pickupDays.length > 7 && (
                    <select
                      aria-label="Weiterer Abholtag"
                      value={
                        pickupDays.slice(7).some((d) => d.dateKey === activeDay?.dateKey)
                          ? activeDay?.dateKey
                          : ""
                      }
                      onChange={(e) => {
                        const found = pickupDays.find((d) => d.dateKey === e.target.value);
                        if (found) selectDay(found);
                      }}
                      className="min-h-12 rounded-xl border border-border bg-parchment/50 px-3 text-xs font-semibold text-ink focus:border-wine"
                    >
                      <option value="" disabled>
                        Weitere Tage …
                      </option>
                      {pickupDays.slice(7).map((day) => (
                        <option key={day.dateKey} value={day.dateKey}>
                          {day.fullLabel}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {activeDay && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                    Uhrzeit am {activeDay.fullLabel}
                  </p>
                  <div
                    role="group"
                    aria-label="Uhrzeit der Abholung"
                    className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-7"
                  >
                    {activeDay.slots.map((slot) => {
                      const isSelectedSlot = pickupValue === slot.value;
                      return (
                        <button
                          key={slot.value}
                          type="button"
                          aria-pressed={isSelectedSlot}
                          onClick={() => selectSlot(slot.value)}
                          className={`flex h-9 items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-all ${
                            isSelectedSlot
                              ? "border-wine bg-wine text-cream shadow-2xs"
                              : "border-border bg-cream text-ink hover:border-wine/60 hover:bg-parchment"
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {formattedSelectedPickup && (
            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-wine/25 bg-parchment px-4 py-3 text-xs sm:text-sm">
              <div>
                <span className="text-muted">Gewählter Abholtermin: </span>
                <strong className="text-ink">{formattedSelectedPickup}</strong>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomTime((prev) => !prev)}
                className="shrink-0 text-xs font-medium text-wine underline hover:text-wine-dark"
              >
                {showCustomTime ? "Zeitfenster-Auswahl" : "Manuell anpassen"}
              </button>
            </div>
          )}

          <div className={showCustomTime || Boolean(fieldErrors.pickup) || pickupDays.length === 0 ? "mt-4" : "sr-only"}>
            <Field id="pickup" label="Abholzeit" error={fieldErrors.pickup} hint={pickupHint}>
              <input
                ref={pickupRef}
                id="pickup"
                name="pickup"
                type="datetime-local"
                required
                value={pickupValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setPickupValue(val);
                  const [datePart] = val.split("T");
                  if (datePart) setSelectedDayKey(datePart);
                }}
                aria-invalid={Boolean(fieldErrors.pickup)}
                aria-describedby={describedBy("pickup", fieldErrors.pickup, true)}
                className={inputClass}
              />
            </Field>
          </div>
          {!showCustomTime && !fieldErrors.pickup && (
            <p className="mt-3 text-xs text-muted">{pickupHint}</p>
          )}
        </section>

        {/* Step 2: Guest Contact Information */}
        <section
          aria-labelledby="contact-step-heading"
          className="rounded-3xl border border-border bg-cream p-5 shadow-2xs sm:p-7"
        >
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-wine">
              Schritt 2
            </span>
            <h2
              id="contact-step-heading"
              className="font-playfair text-xl font-bold text-ink sm:text-2xl"
            >
              Ihre Kontaktdaten
            </h2>
          </div>

          <div className="mt-5">
            <Field id="name" label="Vor- und Nachname" error={fieldErrors.name}>
              <input
                id="name"
                name="name"
                required
                maxLength={100}
                autoComplete="name"
                placeholder="z. B. Maria Mustermann"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={describedBy("name", fieldErrors.name)}
                className={inputClass}
              />
            </Field>

            <Field
              id="phone"
              label="Telefonnummer (für evtl. Rückfragen)"
              error={fieldErrors.phone}
            >
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                maxLength={30}
                autoComplete="tel"
                placeholder="z. B. 0170 1234567"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={describedBy("phone", fieldErrors.phone)}
                className={inputClass}
              />
            </Field>
          </div>

          {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
          <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          <div className="mt-6 rounded-2xl bg-parchment/70 p-4 text-xs leading-relaxed text-muted">
            <p>
              {privacyNotice}{" "}
              <Link href="/privacy-policy" className="font-medium text-ink underline hover:text-wine">
                Datenschutzerklärung
              </Link>
            </p>
            {paymentNote && <p className="mt-1.5 font-medium text-ink">{paymentNote}</p>}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex min-h-13 w-full items-center justify-center rounded-full bg-wine px-6 py-3 text-base font-bold text-cream shadow-[0_6px_20px_rgba(133,35,49,0.28)] transition-all hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-60"
          >
            {pending
              ? "Bestellung wird übermittelt …"
              : `Verbindlich zur Abholung bestellen (${formatEuro(total)})`}
          </button>
        </section>
      </form>
    </div>
  );
}
