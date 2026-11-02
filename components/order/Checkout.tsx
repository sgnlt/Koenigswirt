"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  type FormEvent,
  type ReactNode,
} from "react";
import { placeOrder } from "@/app/bestellung/actions";
import type { CatalogLine } from "@/lib/takeaway/catalog";
import { clearCart, setQuantity, useCart } from "@/lib/takeaway/cart-store";
import { formatEuro, lineTitle } from "@/lib/takeaway/format";
import { MAX_QUANTITY_PER_LINE, type OrderField, type OrderState } from "@/lib/takeaway/types";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

const INITIAL: OrderState = { status: "idle" };
const inputClass =
  "h-11 w-full border border-ink/60 bg-cream px-3 text-base aria-[invalid=true]:border-accent";

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
    <div className="mt-6">
      <label htmlFor={id} className="mb-2 block text-sm leading-5">{label} *</label>
      {children}
      {hint && <p id={`${id}-hint`} className="mt-2 text-sm text-muted">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-2 text-sm font-bold text-accent">{error}</p>}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: boolean) {
  const ids = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

type Props = {
  catalog: CatalogLine[];
  pickupHint: ReactNode;
  privacyNotice: string;
  paymentNote: string | null;
  allergenNote: string | null;
};

export default function Checkout({ catalog, pickupHint, privacyNotice, paymentNote, allergenNote }: Props) {
  const cart = useCart();
  const [state, formAction, pending] = useActionState(placeOrder, INITIAL);
  const submitting = useRef(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const byKey = new Map(catalog.map((line) => [line.key, line]));
  const lines = cart.flatMap((entry) => {
    const line = byKey.get(entry.key);
    return line ? [{ ...line, quantity: entry.quantity }] : [];
  });
  const total = lines.reduce((sum, line) => sum + line.priceCents * line.quantity, 0);
  const fieldErrors: Partial<Record<OrderField, string>> =
    state.status === "invalid" ? state.fieldErrors : {};

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Dispatched by hand: a plain form action would reset the fields after an error.
    event.preventDefault();
    if (submitting.current) return;
    submitting.current = true;
    const data = new FormData(event.currentTarget);
    data.set("items", JSON.stringify(lines.map(({ key, quantity }) => ({ key, quantity }))));
    startTransition(() => formAction(data));
  }

  if (state.status === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="mt-8 outline-none">
        <h2 className="font-playfair text-2xl">Vielen Dank für Ihre Bestellung!</h2>
        <p className="mt-4">Ihre Bestellung ist bei uns eingegangen. Wir bereiten sie zur gewünschten Abholzeit vor.</p>
        {paymentNote && <p className="mt-4">{paymentNote}</p>}
        <Link href="/menus" className="mt-6 inline-block underline">Zurück zur Speisekarte</Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mt-8">
        <p>Ihr Warenkorb ist leer.</p>
        <Link href="/menus" className="mt-4 inline-block underline">Zur Speisekarte</Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mt-8 text-[18px] font-bold">Warenkorb</h2>
      <ul className="mt-4 divide-y divide-ink/20 border-y border-ink/20">
        {lines.map((line) => {
          const title = lineTitle(line);
          return (
            <li key={line.key} className="py-4">
              <div className="flex justify-between gap-4">
                <span>{title}</span>
                <span className="whitespace-nowrap font-bold">{formatEuro(line.priceCents * line.quantity)}</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label={`Menge von ${title} verringern`}
                  onClick={() => setQuantity(line.key, line.quantity - 1)}
                  className="size-11 border border-ink/60"
                >
                  −
                </button>
                <span aria-live="polite" className="min-w-8 text-center">
                  <span className="sr-only">Menge von {title}: </span>{line.quantity}
                </span>
                <button
                  type="button"
                  aria-label={`Menge von ${title} erhöhen`}
                  disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
                  onClick={() => setQuantity(line.key, line.quantity + 1)}
                  className="size-11 border border-ink/60 disabled:opacity-40"
                >
                  +
                </button>
                <span className="text-sm text-muted">je {formatEuro(line.priceCents)}</span>
                <button
                  type="button"
                  aria-label={`${title} entfernen`}
                  onClick={() => setQuantity(line.key, 0)}
                  className="ml-auto min-h-11 px-2 text-sm underline"
                >
                  Entfernen
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex justify-between text-lg font-bold">
        <span>Gesamt</span>
        <span aria-live="polite">{formatEuro(total)}</span>
      </p>
      {allergenNote && <p className="mt-4 text-sm">{allergenNote}</p>}

      <form ref={formRef} onSubmit={onSubmit} noValidate className="mt-8">
        <h2 className="text-[18px] font-bold">Ihre Angaben</h2>

        <div ref={statusRef} tabIndex={-1} role="alert" className="outline-none">
          {state.status === "failed" && (
            <p className="mt-4 border border-accent p-4">
              <strong>Ihre Bestellung wurde nicht aufgegeben.</strong> Bitte versuchen Sie es später erneut oder
              bestellen Sie telefonisch unter{" "}
              <a href={PHONE_HREF} className="underline">{PHONE_DISPLAY}</a>.
            </p>
          )}
          {state.status === "invalid" && (
            <p className="mt-4 border border-accent p-4">
              {fieldErrors.items ?? "Bitte prüfen Sie Ihre Eingaben."}
            </p>
          )}
        </div>

        <Field id="name" label="Name" error={fieldErrors.name}>
          <input
            id="name"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={describedBy("name", fieldErrors.name)}
            className={inputClass}
          />
        </Field>
        <Field id="phone" label="Telefonnummer" error={fieldErrors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            maxLength={30}
            autoComplete="tel"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={describedBy("phone", fieldErrors.phone)}
            className={inputClass}
          />
        </Field>
        <Field id="pickup" label="Abholzeit" error={fieldErrors.pickup} hint={pickupHint}>
          <input
            id="pickup"
            name="pickup"
            type="datetime-local"
            required
            aria-invalid={Boolean(fieldErrors.pickup)}
            aria-describedby={describedBy("pickup", fieldErrors.pickup, true)}
            className={inputClass}
          />
        </Field>

        {/* Honeypot: hidden from people and assistive tech, filled in by bots. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            Website
            <input name="website" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <p className="mt-6 text-sm">
          {privacyNotice}{" "}
          <Link href="/privacy-policy" className="underline">Datenschutzerklärung</Link>
        </p>
        {paymentNote && <p className="mt-4 text-sm">{paymentNote}</p>}

        <button
          type="submit"
          disabled={pending}
          className="mt-6 min-h-11 w-full rounded-full bg-wine px-6 py-2 text-cream disabled:opacity-60"
        >
          {pending ? "Wird gesendet …" : `Verbindlich bestellen (${formatEuro(total)})`}
        </button>
      </form>
    </>
  );
}
