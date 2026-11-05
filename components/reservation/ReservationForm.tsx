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
import { placeReservation } from "@/app/reservierung/actions";
import { formatGuestsLabel } from "@/lib/reservation/email";
import {
  MAX_RESERVATION_GUESTS,
  type ReservationField,
  type ReservationState,
} from "@/lib/reservation/types";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";
import { takeawayConfig } from "@/lib/takeaway/config";
import {
  formatPickupDisplay,
  getAvailablePickupDays,
  suggestPickupTime,
  type PickupDaySlots,
} from "@/lib/takeaway/validate";

const INITIAL: ReservationState = { status: "idle" };
const QUICK_GUEST_COUNTS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-cream px-4 text-base text-ink placeholder:text-muted transition-colors focus:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine aria-[invalid=true]:border-accent aria-[invalid=true]:bg-accent/5";

function Field({
  id,
  label,
  required = true,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold leading-5 text-ink">
        {label} {required ? <span className="text-wine">*</span> : <span className="font-normal text-muted">(optional)</span>}
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
  email: string;
  phone: string;
  guests: number;
  datetimeDisplay: string | null;
  notes: string;
};

type Props = {
  openingHoursSummary: string;
  leadTimeMinutes: number | null;
};

export default function ReservationForm({ openingHoursSummary, leadTimeMinutes }: Props) {
  const [state, formAction, pending] = useActionState(placeReservation, INITIAL);
  const submitting = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const datetimeRef = useRef<HTMLInputElement>(null);

  const [guests, setGuests] = useState<string>("2");
  const [customGuests, setCustomGuests] = useState(false);
  const [days, setDays] = useState<PickupDaySlots[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string>("");
  const [datetimeValue, setDatetimeValue] = useState<string>("");
  const [showCustomDatetime, setShowCustomDatetime] = useState(false);
  const [submittedSnapshot, setSubmittedSnapshot] = useState<SubmittedSnapshot | null>(null);

  const fieldErrors: Partial<Record<ReservationField, string>> =
    state.status === "invalid" ? state.fieldErrors : {};

  useEffect(() => {
    const now = new Date();
    const availableDays = getAvailablePickupDays(takeawayConfig, now);
    const suggested = suggestPickupTime(takeawayConfig, now) ?? "";
    const frame = requestAnimationFrame(() => {
      setDays(availableDays);
      setDatetimeValue((prev) => {
        const next = prev || suggested;
        const [datePart] = next.split("T");
        if (datePart) setSelectedDayKey(datePart);
        else if (availableDays[0]) setSelectedDayKey(availableDays[0].dateKey);
        return next;
      });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (state.status === "idle") return;
    submitting.current = false;
    if (state.status === "invalid") {
      const invalid = formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (invalid) return invalid.focus();
    }
    statusRef.current?.focus();
  }, [state]);

  function selectSlot(slotValue: string) {
    setDatetimeValue(slotValue);
    const [datePart] = slotValue.split("T");
    if (datePart) setSelectedDayKey(datePart);
    if (datetimeRef.current) datetimeRef.current.value = slotValue;
  }

  function selectDay(day: PickupDaySlots) {
    setSelectedDayKey(day.dateKey);
    const currentTime = datetimeValue.split("T")[1];
    const matchingSlot = day.slots.find((s) => s.time === currentTime) ?? day.slots[0];
    if (matchingSlot) {
      setDatetimeValue(matchingSlot.value);
      if (datetimeRef.current) datetimeRef.current.value = matchingSlot.value;
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const data = new FormData(event.currentTarget);
    const rawDatetime = String(data.get("datetime") || datetimeValue);
    const rawGuests = String(data.get("guests") || guests);
    data.set("datetime", rawDatetime);
    data.set("guests", rawGuests);

    setSubmittedSnapshot({
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      guests: Number(rawGuests) || 2,
      datetimeDisplay: formatPickupDisplay(rawDatetime),
      notes: String(data.get("notes") ?? "").trim(),
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
          Vielen Dank für Ihre Reservierungsanfrage!
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          Ihre Anfrage ist bei uns eingegangen. Wir prüfen Ihren Terminwunsch und senden Ihnen
          in Kürze eine persönliche Bestätigung per E-Mail.
        </p>

        {submittedSnapshot && (
          <div className="mt-6 rounded-2xl border border-border bg-cream p-5 text-sm">
            <div className="grid gap-4 border-b border-border pb-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Gewünschter Termin
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {submittedSnapshot.datetimeDisplay ?? "Gemäß Ihrer Auswahl"}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Personenanzahl
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatGuestsLabel(submittedSnapshot.guests)}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Kontaktdaten
                </p>
                <p className="mt-1 font-semibold text-ink">{submittedSnapshot.name}</p>
                <p className="text-muted">{submittedSnapshot.email}</p>
                <p className="text-muted">{submittedSnapshot.phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Adresse
                </p>
                <p className="mt-1 font-semibold text-ink">
                  Königswirt · Historischer Landgasthof
                </p>
                <p className="text-muted">Schongauer Str. 13, 87616 Marktoberdorf</p>
              </div>
            </div>

            {submittedSnapshot.notes && (
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Ihre Anmerkungen
                </p>
                <p className="mt-1 whitespace-pre-line text-ink">{submittedSnapshot.notes}</p>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-muted">
          Bei kurzfristigen Änderungen oder Rückfragen erreichen Sie uns jederzeit telefonisch
          unter{" "}
          <a href={PHONE_HREF} className="font-semibold text-ink underline hover:text-wine">
            {PHONE_DISPLAY}
          </a>
          .
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/menus"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-wine px-6 text-sm font-semibold text-cream transition-colors hover:bg-wine-dark"
          >
            Zur Speisekarte
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

  const activeDay = days.find((d) => d.dateKey === selectedDayKey) ?? days[0];
  const formattedSelectedDatetime = formatPickupDisplay(datetimeValue);
  const datetimeHint = (
    <>
      Reservierungszeiten: {openingHoursSummary}
      {leadTimeMinutes ? ` (mindestens ${leadTimeMinutes} Minuten Vorlauf)` : ""}.
    </>
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_380px]">
      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="space-y-6"
      >
        <div ref={statusRef} tabIndex={-1} role="alert" className="outline-none">
          {state.status === "failed" && (
            <div className="mb-6 rounded-2xl border border-accent bg-accent/5 p-4 text-sm text-ink">
              <p className="font-bold text-accent">
                Ihre Reservierungsanfrage konnte leider nicht gesendet werden.
              </p>
              <p className="mt-1">
                Bitte versuchen Sie es erneut oder reservieren Sie direkt telefonisch unter{" "}
                <a href={PHONE_HREF} className="font-semibold underline">
                  {PHONE_DISPLAY}
                </a>
                .
              </p>
            </div>
          )}
          {state.status === "invalid" && (
            <div className="mb-6 rounded-2xl border border-accent bg-accent/5 p-4 text-sm font-medium text-accent">
              Bitte prüfen Sie die markierten Eingabefelder.
            </div>
          )}
        </div>

        {/* Step 1: Guests, Date & Time */}
        <section
          aria-labelledby="reservation-step-1"
          className="rounded-3xl border border-border bg-cream p-5 shadow-2xs sm:p-7"
        >
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-wine">
              Schritt 1
            </span>
            <h2
              id="reservation-step-1"
              className="font-playfair text-xl font-bold text-ink sm:text-2xl"
            >
              Personenanzahl & Wunschtermin
            </h2>
          </div>

          {/* Guest count selector */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Anzahl der Gäste <span className="text-wine">*</span>
            </p>
            <div
              role="group"
              aria-label="Personenanzahl wählen"
              className="grid grid-cols-5 gap-2 sm:grid-cols-9"
            >
              {QUICK_GUEST_COUNTS.map((count) => {
                const isSelected = !customGuests && Number(guests) === count;
                return (
                  <button
                    key={count}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setCustomGuests(false);
                      setGuests(String(count));
                    }}
                    className={`flex h-11 items-center justify-center rounded-xl border text-sm font-bold tabular-nums transition-all ${
                      isSelected
                        ? "border-wine bg-wine text-cream shadow-xs"
                        : "border-border bg-parchment/50 text-ink hover:border-wine/50 hover:bg-parchment"
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
              <button
                type="button"
                aria-pressed={customGuests}
                onClick={() => {
                  setCustomGuests(true);
                  if (Number(guests) <= 8) setGuests("9");
                }}
                className={`flex h-11 items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                  customGuests
                    ? "border-wine bg-wine text-cream shadow-xs"
                    : "border-border bg-parchment/50 text-ink hover:border-wine/50 hover:bg-parchment"
                }`}
              >
                9+
              </button>
            </div>

            <div className={customGuests || Boolean(fieldErrors.guests) ? "mt-3" : "sr-only"}>
              <Field
                id="guests"
                label={`Personenanzahl (1–${MAX_RESERVATION_GUESTS})`}
                error={fieldErrors.guests}
              >
                <input
                  id="guests"
                  name="guests"
                  type="number"
                  min={1}
                  max={MAX_RESERVATION_GUESTS}
                  required
                  inputMode="numeric"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  aria-invalid={Boolean(fieldErrors.guests)}
                  aria-describedby={describedBy("guests", fieldErrors.guests)}
                  className={inputClass}
                />
              </Field>
            </div>
          </div>

          {/* Date & Time Slots */}
          {days.length > 0 && (
            <div className="mt-6 space-y-5 border-t border-border pt-5">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Tag der Reservierung
                </p>
                <div
                  role="group"
                  aria-label="Tag der Reservierung"
                  className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
                >
                  {days.slice(0, 7).map((day) => {
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

                  {days.length > 7 && (
                    <select
                      aria-label="Weiterer Reservierungstag"
                      value={
                        days.slice(7).some((d) => d.dateKey === activeDay?.dateKey)
                          ? activeDay?.dateKey
                          : ""
                      }
                      onChange={(e) => {
                        const found = days.find((d) => d.dateKey === e.target.value);
                        if (found) selectDay(found);
                      }}
                      className="min-h-12 rounded-xl border border-border bg-parchment/50 px-3 text-xs font-semibold text-ink focus:border-wine"
                    >
                      <option value="" disabled>
                        Weitere Tage …
                      </option>
                      {days.slice(7).map((day) => (
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
                    aria-label="Uhrzeit der Reservierung"
                    className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-7"
                  >
                    {activeDay.slots.map((slot) => {
                      const isSelectedSlot = datetimeValue === slot.value;
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

          {formattedSelectedDatetime && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-wine/25 bg-parchment px-4 py-3 text-xs sm:text-sm">
              <div>
                <span className="text-muted">Gewählter Termin: </span>
                <strong className="text-ink">
                  {formattedSelectedDatetime} · {formatGuestsLabel(Number(guests) || 2)}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setShowCustomDatetime((prev) => !prev)}
                className="shrink-0 text-xs font-medium text-wine underline hover:text-wine-dark"
              >
                {showCustomDatetime ? "Zeitfenster-Auswahl" : "Anderes Datum wählen"}
              </button>
            </div>
          )}

          <div
            className={
              showCustomDatetime || Boolean(fieldErrors.datetime) || days.length === 0
                ? "mt-4"
                : "sr-only"
            }
          >
            <Field
              id="datetime"
              label="Datum & Uhrzeit"
              error={fieldErrors.datetime}
              hint={datetimeHint}
            >
              <input
                ref={datetimeRef}
                id="datetime"
                name="datetime"
                type="datetime-local"
                required
                value={datetimeValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setDatetimeValue(val);
                  const [datePart] = val.split("T");
                  if (datePart) setSelectedDayKey(datePart);
                }}
                aria-invalid={Boolean(fieldErrors.datetime)}
                aria-describedby={describedBy("datetime", fieldErrors.datetime, true)}
                className={inputClass}
              />
            </Field>
          </div>
          {!showCustomDatetime && !fieldErrors.datetime && (
            <p className="mt-3 text-xs text-muted">{datetimeHint}</p>
          )}
        </section>

        {/* Step 2: Guest Contact Information & Wishes */}
        <section
          aria-labelledby="reservation-step-2"
          className="rounded-3xl border border-border bg-cream p-5 shadow-2xs sm:p-7"
        >
          <div className="border-b border-border pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-wine">
              Schritt 2
            </span>
            <h2
              id="reservation-step-2"
              className="font-playfair text-xl font-bold text-ink sm:text-2xl"
            >
              Ihre Kontaktdaten & Wünsche
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

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field
                id="email"
                label="E-Mail-Adresse (für die Bestätigung)"
                error={fieldErrors.email}
              >
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="z. B. maria@beispiel.de"
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={describedBy("email", fieldErrors.email)}
                  className={inputClass}
                />
              </Field>

              <Field
                id="phone"
                label="Telefonnummer (für Rückfragen)"
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

            <Field
              id="notes"
              label="Besondere Wünsche oder Anmerkungen"
              required={false}
              error={fieldErrors.notes}
            >
              <textarea
                id="notes"
                name="notes"
                rows={3}
                maxLength={500}
                placeholder="z. B. Kinderstuhl, Hund dabei, Allergien oder besonderer Anlass"
                aria-invalid={Boolean(fieldErrors.notes)}
                aria-describedby={describedBy("notes", fieldErrors.notes)}
                className="block w-full rounded-xl border border-border bg-cream px-4 py-3 text-base text-ink placeholder:text-muted transition-colors focus:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine aria-[invalid=true]:border-accent aria-[invalid=true]:bg-accent/5"
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
              Ihre Angaben werden ausschließlich zur Bearbeitung und Bestätigung Ihrer
              Tischreservierung verwendet.{" "}
              <Link
                href="/privacy-policy"
                className="font-medium text-ink underline hover:text-wine"
              >
                Datenschutzerklärung
              </Link>
            </p>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex min-h-13 w-full items-center justify-center rounded-full bg-wine px-6 py-3 text-base font-bold text-cream shadow-[0_6px_20px_rgba(133,35,49,0.28)] transition-all hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-60"
          >
            {pending ? "Reservierungsanfrage wird gesendet …" : "Tisch reservieren"}
          </button>
        </section>
      </form>

      {/* Info Sidebar */}
      <aside className="space-y-5 lg:sticky lg:top-[110px]">
        <div className="rounded-3xl border border-border bg-parchment/75 p-5 sm:p-6">
          <h2 className="font-playfair text-xl font-bold text-ink">
            Hinweise zur Reservierung
          </h2>

          <dl className="mt-4 space-y-4 text-sm leading-relaxed">
            <div className="border-b border-border/70 pb-3.5">
              <dt className="font-semibold text-ink">Persönliche Bestätigung</dt>
              <dd className="mt-1 text-muted">
                Nach dem Absenden erhalten wir Ihre Anfrage direkt per E-Mail und bestätigen
                Ihren Tisch persönlich.
              </dd>
            </div>

            <div className="border-b border-border/70 pb-3.5">
              <dt className="font-semibold text-ink">Reservierungszeiten</dt>
              <dd className="mt-1 text-muted">{openingHoursSummary}</dd>
            </div>

            <div>
              <dt className="font-semibold text-ink">Kurzfristig oder telefonisch</dt>
              <dd className="mt-1 text-muted">
                Für sehr kurzfristige Reservierungen erreichen Sie uns auch direkt unter{" "}
                <a
                  href={PHONE_HREF}
                  className="font-semibold text-ink underline hover:text-wine"
                >
                  {PHONE_DISPLAY}
                </a>
                .
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-3xl border border-border bg-cream p-5 text-sm sm:p-6">
          <h3 className="font-playfair text-lg font-bold text-ink">
            Größere Feier oder Abholung?
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">
            Für Hochzeiten, Firmenfeiern oder das Salettl sowie für Abholbestellungen nutzen
            Sie gerne unsere direkten Bereiche:
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/menus"
              className="inline-flex min-h-10 items-center justify-between rounded-xl border border-border bg-parchment/60 px-3.5 text-xs font-semibold text-ink transition-colors hover:border-wine hover:text-wine"
            >
              <span>Speisekarte & Abholbestellung</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/festsaal-mit-buehne"
              className="inline-flex min-h-10 items-center justify-between rounded-xl border border-border bg-parchment/60 px-3.5 text-xs font-semibold text-ink transition-colors hover:border-wine hover:text-wine"
            >
              <span>Festsaal mit Bühne anfragen</span>
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/salettl"
              className="inline-flex min-h-10 items-center justify-between rounded-xl border border-border bg-parchment/60 px-3.5 text-xs font-semibold text-ink transition-colors hover:border-wine hover:text-wine"
            >
              <span>Eventlocation Salettl anfragen</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
