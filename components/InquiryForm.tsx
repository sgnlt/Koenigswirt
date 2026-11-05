"use client";

import Image from "next/image";
import type { FormEvent } from "react";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

const MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-cream px-4 text-base text-ink placeholder:text-muted transition-colors focus:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine";
const labelClass = "mb-1.5 block text-sm font-semibold leading-5 text-ink";

type Props = {
  title: string;
  location: string;
  wishesPlaceholder: string;
  dateLabels: boolean;
};

// The Wix form backend is gone once the site moves, so inquiries open a pre-filled e-mail.
function submit(location: string) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const field = (name: string) => String(data.get(name) ?? "");
    const body = [
      `${field("vorname")} ${field("nachname")}`,
      field("email"),
      field("telefon"),
      `${field("tag")}. ${field("monat")} ${field("jahr")}`,
      field("wuensche"),
    ].join("\n");
    window.location.href = `mailto:info@koenigswirt.de?subject=${encodeURIComponent(location)}&body=${encodeURIComponent(body)}`;
  };
}

export default function InquiryForm({
  title,
  location,
  wishesPlaceholder,
  dateLabels,
}: Props) {
  return (
    <form
      onSubmit={submit(location)}
      className="mx-auto max-w-[640px] rounded-3xl border border-border bg-parchment p-6 shadow-[0_8px_30px_rgba(38,34,32,0.08)] sm:p-10"
    >
      <div className="text-center">
        <Image
          src="/images/krone.png"
          alt=""
          width={40}
          height={24}
          className="mx-auto w-9"
        />
        <h1 className="mt-3 font-playfair text-2xl font-bold leading-snug text-ink sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Jetzt unverbindlich anfragen – wir melden uns umgehend bei Ihnen.
        </p>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            Vorname <span className="text-wine">*</span>
          </span>
          <input
            name="vorname"
            required
            autoComplete="given-name"
            placeholder="Vornamen eingeben"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>
            Nachname <span className="text-wine">*</span>
          </span>
          <input
            name="nachname"
            required
            autoComplete="family-name"
            placeholder="Nachnamen eingeben"
            className={inputClass}
          />
        </label>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelClass}>
            E-Mail-Adresse <span className="text-wine">*</span>
          </span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="E-Mail-Adresse eingeben"
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className={labelClass}>
            Telefonnummer <span className="text-wine">*</span>
          </span>
          <input
            name="telefon"
            type="tel"
            required
            autoComplete="tel"
            placeholder="Telefonnummer eingeben"
            className={inputClass}
          />
        </label>
      </div>

      <fieldset className="mt-6 rounded-2xl border border-border bg-cream/60 p-4">
        <legend className="px-2 text-sm font-semibold text-ink">
          Wunschdatum <span className="text-wine">*</span>
        </legend>
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-3 sm:gap-4">
          <label className="block">
            {dateLabels ? (
              <span className="mb-1 block text-xs font-medium text-muted">Tag</span>
            ) : (
              <span className="sr-only">Tag</span>
            )}
            <input
              name="tag"
              required
              inputMode="numeric"
              placeholder="TT"
              className={inputClass}
            />
          </label>
          <label className="block">
            {dateLabels ? (
              <span className="mb-1 block text-xs font-medium text-muted">Monat</span>
            ) : (
              <span className="sr-only">Monat</span>
            )}
            <select
              name="monat"
              required
              defaultValue=""
              className={`${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2010'%20fill='none'%20stroke='%23262220'%3E%3Cpath%20d='M1%201l7%207%207-7'/%3E%3C/svg%3E")] bg-[length:14px_9px] bg-[right_14px_center] bg-no-repeat pr-9 invalid:text-muted`}
            >
              <option value="" disabled>
                Monat wählen
              </option>
              {MONTHS.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </label>
          <label className="block">
            {dateLabels ? (
              <span className="mb-1 block text-xs font-medium text-muted">Jahr</span>
            ) : (
              <span className="sr-only">Jahr</span>
            )}
            <input
              name="jahr"
              required
              inputMode="numeric"
              placeholder="JJJJ"
              className={inputClass}
            />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">
          Bitte geben Sie den gewünschten Tag Ihrer Veranstaltung ein.
        </p>
      </fieldset>

      <label className="mt-5 block">
        <span className={labelClass}>Besondere Wünsche & Gästeanzahl</span>
        <textarea
          name="wuensche"
          placeholder={wishesPlaceholder}
          rows={3}
          className="block w-full rounded-xl border border-border bg-cream px-4 py-3 text-base text-ink placeholder:text-muted transition-colors focus:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
        />
      </label>

      <button
        type="submit"
        className="mt-7 flex min-h-12 w-full items-center justify-center rounded-full bg-wine px-6 text-base font-bold text-cream shadow-sm transition-colors hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
      >
        Unverbindlich anfragen
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Oder direkt telefonisch unter{" "}
        <a href={PHONE_HREF} className="font-semibold text-ink underline hover:text-wine">
          {PHONE_DISPLAY}
        </a>
      </p>
    </form>
  );
}
