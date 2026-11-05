"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CatalogLine } from "@/lib/takeaway/catalog";
import { clearCart, setQuantity, useCart } from "@/lib/takeaway/cart-store";
import { formatEuro, lineTitle } from "@/lib/takeaway/format";
import { MAX_QUANTITY_PER_LINE } from "@/lib/takeaway/types";

export default function CartBar({ catalog }: { catalog: CatalogLine[] }) {
  const cart = useCart();
  const [expanded, setExpanded] = useState(false);

  const byKey = new Map(catalog.map((line) => [line.key, line]));
  const lines = cart.flatMap((entry) => {
    const line = byKey.get(entry.key);
    return line ? [{ ...line, quantity: entry.quantity }] : [];
  });

  const count = lines.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalCents = lines.reduce((sum, entry) => sum + entry.priceCents * entry.quantity, 0);
  const label = count === 1 ? "1 Gericht gewählt" : `${count} Gerichte gewählt`;
  const isOpen = expanded && count > 0;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* Stays mounted so screen readers announce each change to the count. */}
      <p role="status" className="sr-only">
        {count > 0 ? `${label}, Summe ${formatEuro(totalCents)}` : ""}
      </p>
      {count > 0 && (
        <>
          {isOpen && (
            <div
              aria-hidden="true"
              onClick={() => setExpanded(false)}
              className="fixed inset-0 z-20 bg-ink/30 backdrop-blur-[2px]"
            />
          )}
          <div className="sticky bottom-4 z-30 mx-auto mt-10 max-w-[680px] text-left">
            {isOpen && (
              <div
                id="mini-cart-panel"
                role="region"
                aria-label="Warenkorb-Übersicht"
                className="mb-3 rounded-2xl border border-border bg-cream p-4 shadow-[0_12px_36px_rgba(38,34,32,0.22)] sm:p-5"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h2 className="font-playfair text-lg font-bold text-ink">
                      Ihre Abholauswahl
                    </h2>
                    <p className="text-xs text-muted">
                      Abholzeit im nächsten Schritt wählbar
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearCart();
                        setExpanded(false);
                      }}
                      className="min-h-9 rounded-full px-2.5 text-xs font-medium text-muted underline hover:text-wine"
                    >
                      Leeren
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpanded(false)}
                      aria-label="Warenkorb-Übersicht schließen"
                      className="flex size-9 items-center justify-center rounded-full border border-border bg-parchment/60 text-sm text-ink transition-colors hover:bg-parchment"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <ul className="max-h-64 divide-y divide-border/70 overflow-y-auto pr-1">
                  {lines.map((line) => {
                    const title = lineTitle(line);
                    return (
                      <li
                        key={line.key}
                        className="flex items-center justify-between gap-3 py-3 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-ink">{title}</p>
                          <p className="text-xs text-muted tabular-nums">
                            je {formatEuro(line.priceCents)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            aria-label={`Menge von ${title} im Warenkorb verringern`}
                            onClick={() => setQuantity(line.key, line.quantity - 1)}
                            className="flex size-8 items-center justify-center rounded-full border border-border bg-parchment/50 text-sm font-bold text-ink transition-colors hover:border-wine hover:text-wine"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center font-semibold text-ink tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Menge von ${title} im Warenkorb erhöhen`}
                            disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
                            onClick={() => setQuantity(line.key, line.quantity + 1)}
                            className="flex size-8 items-center justify-center rounded-full border border-border bg-parchment/50 text-sm font-bold text-ink transition-colors hover:border-wine hover:text-wine disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                        <span className="min-w-16 text-right font-bold text-ink tabular-nums">
                          {formatEuro(line.priceCents * line.quantity)}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm">
                  <span className="font-medium text-muted">Zwischensumme (Abholung)</span>
                  <span className="font-playfair text-lg font-bold text-ink tabular-nums">
                    {formatEuro(totalCents)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 rounded-full border border-wine-dark/20 bg-wine p-1.5 pl-3.5 text-cream shadow-[0_8px_28px_rgba(74,20,32,0.32)] sm:pl-5">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls="mini-cart-panel"
                onClick={() => setExpanded((prev) => !prev)}
                className="flex min-h-10 flex-wrap items-center gap-x-2 text-left text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:text-sm"
              >
                <span className="inline-flex size-6 items-center justify-center rounded-full bg-cream/20 text-xs font-bold tabular-nums">
                  {count}
                </span>
                <span className="font-semibold">{label}</span>
                <span aria-hidden="true" className="opacity-60">·</span>
                <span className="font-bold tabular-nums">{formatEuro(totalCents)}</span>
                <span className="text-xs underline opacity-90">
                  {isOpen ? "Ausblenden" : "Ansehen"}
                </span>
              </button>

              <Link
                href="/bestellung"
                className="flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-cream px-4 py-2 text-xs font-bold text-wine transition-colors hover:bg-parchment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:px-5 sm:text-sm"
              >
                <span>Abholung buchen</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
