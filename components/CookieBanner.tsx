"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

const KEY = "koenigswirt-cookie-consent";
const listeners = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return "unavailable";
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function save(value: string) {
  try {
    localStorage.setItem(KEY, value);
  } catch {}
  listeners.forEach((listener) => listener());
}

const categories = [
  {
    name: "Marketing-Cookies",
    text: "Diese Cookies werden verwendet, um die Effektivität von Werbung zu messen, einen personalisierten Service zu bieten und Werbeanzeigen an Besucherbedürfnisse anzupassen.",
  },
  {
    name: "Funktionale Cookies",
    text: "Diese Cookies werden verwendet, um Nutzerangaben zu speichern und ein verbessertes und personalisiertes Nutzererlebnis anzubieten.",
  },
  {
    name: "Analytics-Cookies",
    text: "Diese Cookies werden verwendet, um zu verstehen, wie Besucher mit unserer Website interagieren, um Fehler zu entdecken und verbesserte Analysedaten zu bieten.",
  },
];

export default function CookieBanner() {
  const consent = useSyncExternalStore(subscribe, read, () => "pending");
  const [settings, setSettings] = useState(false);
  const [choices, setChoices] = useState<Record<string, boolean>>({});

  if (consent !== null) return null;

  return (
    <>
      <div
        role="region"
        aria-label="Cookie-Hinweis"
        className="fixed inset-x-0 bottom-0 z-50 bg-white px-5 pb-[14px] pt-5 text-sm leading-[18.2px] text-black shadow-[0_-4px_16px_rgba(0,0,0,0.1)] lg:flex lg:h-[68px] lg:items-center lg:py-0 lg:pr-12"
      >
        <p className="pr-3 lg:max-w-[1108px] lg:flex-1 lg:pr-[30px]">
          Diese Website verwendet Cookies, um ein verbessertes Nutzererlebnis zu bieten. Per Klick auf „Zustimmen“ erkläre ich mich mit der Verwendung von Cookies einverstanden.{" "}
          <Link href="/privacy-policy" className="underline">Datenschutzerklärung</Link>
        </p>
        <div className="mt-[22px] flex gap-5 lg:mt-0 lg:gap-3">
          <button type="button" onClick={() => setSettings(true)} className="h-8 flex-1 border border-black bg-white lg:w-[118px] lg:flex-none">
            Einstellungen
          </button>
          <button type="button" onClick={() => save("all")} className="h-8 flex-1 border border-black bg-black text-white lg:w-[104px] lg:flex-none">
            Zustimmen
          </button>
        </div>
        <button type="button" aria-label="Schließen" onClick={() => save("necessary")} className="absolute right-1 top-1 size-6 lg:right-3 lg:top-5">
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      {settings && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="cookie-title" className="relative flex max-h-[570px] w-[600px] max-w-full flex-col bg-white text-black">
            <button type="button" aria-label="Schließen" onClick={() => setSettings(false)} className="absolute right-5 top-3 size-6">
              <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            <div className="overflow-y-auto">
              <h2 id="cookie-title" className="px-6 pt-6 text-2xl">Erweiterte Cookie-Einstellungen</h2>
              <div className="border-b border-black/15 px-6 py-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base">Unbedingt erforderliche Cookies</h3>
                  <input type="checkbox" checked disabled aria-label="Unbedingt erforderliche Cookies" className="size-5" />
                </div>
                <p className="mt-3 pr-16 text-xs leading-4">
                  Diese Cookies werden für grundlegende Funktionen wie Sicherheit, Identitätsprüfung und Netzwerkmanagement benötigt. Sie können daher nicht deaktiviert werden.
                </p>
              </div>
              {categories.map((category) => (
                <div key={category.name} className="border-b border-black/15 px-6 py-6 last:border-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base">{category.name}</h3>
                    <input
                      type="checkbox"
                      aria-label={category.name}
                      checked={!!choices[category.name]}
                      onChange={(event) => setChoices({ ...choices, [category.name]: event.target.checked })}
                      className="size-5"
                    />
                  </div>
                  <p className="mt-3 pr-16 text-xs leading-4">{category.text}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end border-t border-black/15 px-[30px] py-[29px]">
              <button type="button" onClick={() => save(JSON.stringify(choices))} className="h-[33px] w-[172px] bg-black text-sm text-white">
                Auswahl bestätigen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
