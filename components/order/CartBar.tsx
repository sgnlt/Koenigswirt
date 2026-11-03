"use client";

import Link from "next/link";
import { useState } from "react";
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
  const label = count === 1 ? "1 Artikel im Warenkorb" : `${count} Artikel im Warenkorb`;
  const isOpen = expanded && count > 0;

  return (
    <>
      {/* Stays mounted so screen readers announce each change to the count. */}
      <p role="status" className="sr-only">
        {count > 0 ? `${label}, Summe ${formatEuro(totalCents)}` : ""}
      </p>
      {count > 0 && (
        <div className="sticky bottom-4 z-30 mx-auto mt-10 max-w-[600px] text-left">
          {isOpen && (
            <div
              id="mini-cart-panel"
              role="region"
              aria-label="Warenkorb-Übersicht"
              className="mb-3 rounded-2xl border border-ink/20 bg-cream p-4 shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-center justify-between border-b border-ink/15 pb-3">
                <h2 className="font-playfair text-lg font-bold text-ink">Ihre Auswahl</h2>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      setExpanded(false);
                    }}
                    className="min-h-9 px-2 text-xs text-muted underline hover:text-ink"
                  >
                    Warenkorb leeren
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label="Warenkorb-Übersicht schließen"
                    className="flex size-9 items-center justify-center rounded-full border border-ink/20 bg-cream text-sm text-ink hover:bg-ink/5"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <ul className="max-h-60 divide-y divide-ink/10 overflow-y-auto">
                {lines.map((line) => {
                  const title = lineTitle(line);
                  return (
                    <li key={line.key} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{title}</p>
                        <p className="text-xs text-muted">je {formatEuro(line.priceCents)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label={`Menge von ${title} im Warenkorb verringern`}
                          onClick={() => setQuantity(line.key, line.quantity - 1)}
                          className="flex size-8 items-center justify-center rounded-full border border-ink/40 bg-cream text-sm font-bold text-ink hover:bg-ink/5"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center font-medium text-ink">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Menge von ${title} im Warenkorb erhöhen`}
                          disabled={line.quantity >= MAX_QUANTITY_PER_LINE}
                          onClick={() => setQuantity(line.key, line.quantity + 1)}
                          className="flex size-8 items-center justify-center rounded-full border border-ink/40 bg-cream text-sm font-bold text-ink hover:bg-ink/5 disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      <span className="min-w-16 text-right font-bold text-ink">
                        {formatEuro(line.priceCents * line.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 rounded-full bg-wine p-1.5 pl-4 text-cream shadow-[0_6px_20px_rgba(0,0,0,0.28)]">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls="mini-cart-panel"
              onClick={() => setExpanded((prev) => !prev)}
              className="flex min-h-10 flex-wrap items-center gap-x-2 text-left text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              <span className="font-bold">{label}</span>
              <span aria-hidden="true">·</span>
              <span>{formatEuro(totalCents)}</span>
              <span className="text-xs underline opacity-90">
                {isOpen ? "Ausblenden" : "Ansehen"}
              </span>
            </button>

            <Link
              href="/bestellung"
              className="flex min-h-10 shrink-0 items-center rounded-full bg-cream px-5 py-2 text-sm font-bold text-wine transition-colors hover:bg-cream/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Zur Bestellung
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
