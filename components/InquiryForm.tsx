"use client";

import type { FormEvent } from "react";

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

const inputClass = "h-[42px] w-full border border-ink/60 bg-cream px-3 text-base placeholder:text-muted";
const labelClass = "mb-2 block text-sm leading-5";

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

export default function InquiryForm({ title, location, wishesPlaceholder, dateLabels }: Props) {
  return (
    <form
      onSubmit={submit(location)}
      className="mx-auto max-w-[576px] bg-rose p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <h1 className="text-[22px] font-bold leading-[33px] text-center">{title}</h1>
      <p className="mb-6 mt-6 text-center">Jetzt unverbindlich anfragen!</p>

      <label className="block">
        <span className={labelClass}>Vorname *</span>
        <input name="vorname" required autoComplete="given-name" placeholder="Vornamen eingeben" className={inputClass} />
      </label>
      <label className="mt-6 block">
        <span className={labelClass}>Nachname *</span>
        <input name="nachname" required autoComplete="family-name" placeholder="Nachnamen eingeben" className={inputClass} />
      </label>
      <label className="mt-6 block">
        <span className={labelClass}>E-Mail-Adresse *</span>
        <input name="email" type="email" required autoComplete="email" placeholder="E-Mail-Adresse eingeben" className={inputClass} />
      </label>
      <label className="mt-6 block">
        <span className={labelClass}>Telefonnummer *</span>
        <span className="relative block">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="absolute left-[14px] top-[11px] size-5" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3.500 9c3 0 4 1.500 5.500 3s.5 3 2 4 1 4 1 5M14 3.500c-1 2-3 2-3 4s3 1.500 4.500 2.500 3 1 5 .5" />
          </svg>
          <input name="telefon" type="tel" required autoComplete="tel" placeholder="Telefonnummer eingeben" className={`${inputClass} pl-[52px]`} />
        </span>
      </label>

      <fieldset className="mt-6">
        <legend className={labelClass}>Datum *</legend>
        <div className="grid grid-cols-[1fr_2fr_1fr] gap-6">
          <label className="block">
            {dateLabels ? <span className={labelClass}>Tag</span> : <span className="sr-only">Tag</span>}
            <input name="tag" required inputMode="numeric" placeholder="Tag" className={inputClass} />
          </label>
          <label className="block">
            {dateLabels ? <span className={labelClass}>Monat</span> : <span className="sr-only">Monat</span>}
            <select name="monat" required defaultValue="" className={`${inputClass} appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2016%2010'%20fill='none'%20stroke='%23333'%3E%3Cpath%20d='M1%201l7%207%207-7'/%3E%3C/svg%3E")] bg-[length:16px_10px] bg-[right_16px_center] bg-no-repeat invalid:text-muted`}>
              <option value="" disabled>Monat</option>
              {MONTHS.map((month) => (
                <option key={month}>{month}</option>
              ))}
            </select>
          </label>
          <label className="block">
            {dateLabels ? <span className={labelClass}>Jahr</span> : <span className="sr-only">Jahr</span>}
            <input name="jahr" required inputMode="numeric" placeholder="Jahr" className={inputClass} />
          </label>
        </div>
        <p className="mt-2 text-sm text-muted">Bitte geben Sie den gewünschten Tag der Buchung hier ein!</p>
      </fieldset>

      <label className="mt-6 block">
        <span className={labelClass}>Besondere Wünsche</span>
        <textarea name="wuensche" placeholder={wishesPlaceholder} className="block h-[76px] w-full border border-ink/60 bg-cream px-3 py-2 placeholder:text-muted" />
      </label>

      <button type="submit" className="mt-[38px] h-[41px] w-full bg-periwinkle text-cream">Anfragen</button>
    </form>
  );
}
