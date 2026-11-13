"use client";

import Image from "next/image";
import { useId, useState } from "react";
import AddToCart from "@/components/order/AddToCart";
import { useCart } from "@/lib/takeaway/cart-store";
import { formatEuro } from "@/lib/takeaway/format";
import {
  filterMenuSections,
  type MenuItem,
  type MenuSection,
} from "@/lib/takeaway/search";

const ADDON_HINTS: Record<string, string> = {
  "salate-wahlweise-mit": "Salat-Extras · Wahlweise zum Salat kombinierbar",
  "suppen-wahlweise": "Suppeneinlage · Wahlweise zur Rinderkraftbrühe",
};

function DescriptionLine({ cells }: { cells: string[] }) {
  if (cells.length === 1) {
    return (
      <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-muted">
        {cells[0]}
      </p>
    );
  }
  const pairs: string[][] = [];
  for (let i = 0; i < cells.length; i += 2) {
    pairs.push(cells.slice(i, i + 2));
  }
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      {pairs.map((pair) => (
        <span key={pair.join()} className="inline-flex items-center gap-1">
          {pair.join(" ")}
        </span>
      ))}
    </p>
  );
}

function DishPriceSummary({ item }: { item: MenuItem }) {
  const prices = item.variants.map((v) => v.priceCents);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  if (prices.length === 1 || minPrice === maxPrice) {
    return (
      <span className="whitespace-nowrap font-playfair text-lg font-bold text-ink tabular-nums sm:text-xl">
        {prices.length > 1 ? `je ${formatEuro(minPrice)}` : formatEuro(minPrice)}
      </span>
    );
  }
  return (
    <span className="whitespace-nowrap font-playfair text-lg font-bold text-ink tabular-nums sm:text-xl">
      ab {formatEuro(minPrice)}
    </span>
  );
}

function Dish({
  item,
  canOrder,
  inCartCount,
}: {
  item: MenuItem;
  canOrder: boolean;
  inCartCount: number;
}) {
  const [, ...restReversed] = [...item.lines].reverse();
  const descriptionLines = [...restReversed].reverse();
  const isMulti = item.variants.length > 1;
  const addonHint = ADDON_HINTS[item.id];

  return (
    <article
      className={`group relative rounded-2xl border p-4 text-left transition-all sm:p-5 ${
        inCartCount > 0
          ? "border-wine/45 bg-parchment/90 shadow-[0_2px_12px_rgba(133,35,49,0.06)]"
          : "border-border/80 bg-cream hover:border-gold/60 hover:bg-parchment/40"
      }`}
    >
      <div
        className={`flex flex-col gap-3 ${
          isMulti ? "" : "sm:flex-row sm:items-start sm:justify-between sm:gap-6"
        }`}
      >
        <div className="min-w-0 flex-1">
          {addonHint && (
            <p className="mb-1 text-xs font-semibold tracking-[0.02em] text-wine">
              {addonHint}
            </p>
          )}
          <div className="flex flex-wrap items-baseline justify-between gap-2 sm:justify-start">
            <h3 className="font-playfair text-lg font-bold leading-snug text-ink sm:text-xl">
              {item.name}
            </h3>
            {item.vegan && (
              <span className="inline-flex items-center gap-1 rounded-full border border-forest/25 bg-forest/10 px-2.5 py-0.5 text-xs font-medium text-forest">
                <Image src="/images/vegan.svg" alt="" width={13} height={13} />
                Vegan
              </span>
            )}
            <div className="ml-auto sm:hidden">
              <DishPriceSummary item={item} />
            </div>
          </div>

          {addonHint ? (
            <p className="mt-1 text-sm text-muted">
              Bitte wählen Sie Ihre gewünschte Option:
            </p>
          ) : (
            descriptionLines.map((cells) => (
              <DescriptionLine key={cells.join()} cells={cells} />
            ))
          )}
        </div>

        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <div className="hidden sm:block">
            <DishPriceSummary item={item} />
          </div>
          {canOrder && !isMulti && (
            <AddToCart
              name={item.name}
              options={item.variants.map((variant) => ({
                key: `${item.id}/${variant.id}`,
                label: variant.label ?? item.name,
                priceCents: variant.priceCents,
              }))}
            />
          )}
        </div>
      </div>

      {canOrder && isMulti && (
        <div className="mt-3 border-t border-border/60 pt-2">
          <AddToCart
            name={item.name}
            options={item.variants.map((variant) => ({
              key: `${item.id}/${variant.id}`,
              label: variant.label ?? item.name,
              priceCents: variant.priceCents,
            }))}
          />
        </div>
      )}
    </article>
  );
}

export default function MenuExplorer({
  sections,
  orderableIds,
}: {
  sections: MenuSection[];
  orderableIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [veganOnly, setVeganOnly] = useState(false);
  const searchId = useId();
  const cart = useCart();

  const itemQuantities = new Map<string, number>();
  for (const entry of cart) {
    const [itemId] = entry.key.split("/");
    itemQuantities.set(itemId, (itemQuantities.get(itemId) ?? 0) + entry.quantity);
  }

  const orderable = new Set(orderableIds);
  const filteredSections = filterMenuSections(sections, {
    query,
    category,
    veganOnly,
  });

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);
  const totalMatches = filteredSections.reduce(
    (sum, section) => sum + section.items.length,
    0,
  );
  const hasActiveFilters = Boolean(query.trim() || category || veganOnly);

  function resetFilters() {
    setQuery("");
    setCategory(null);
    setVeganOnly(false);
  }

  return (
    <div className="mt-6">
      <div className="sticky top-[85px] z-20 -mx-4 border-b border-border/80 bg-cream/95 px-4 py-3.5 backdrop-blur-md xl:top-[94px]">
        <search
          aria-label="Speisekarte durchsuchen und filtern"
          className="mx-auto max-w-[832px]"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <label htmlFor={searchId} className="sr-only">
                Gericht oder Zutat suchen
              </label>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              >
                <circle cx="8.5" cy="8.5" r="5.5" />
                <path d="M13 13l4 4" strokeLinecap="round" />
              </svg>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) {
                    event.preventDefault();
                    setQuery("");
                  }
                }}
                placeholder="Gericht oder Zutat suchen (z. B. Schnitzel, Spätzle) …"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="h-10 w-full rounded-full border border-border bg-parchment/60 pl-10 pr-9 text-sm text-ink placeholder:text-muted transition-colors focus:bg-cream focus-visible:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine sm:h-11 sm:text-base [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Suche löschen"
                  className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/10 hover:text-ink"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              aria-pressed={veganOnly}
              onClick={() => setVeganOnly((prev) => !prev)}
              className={`inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3.5 text-xs font-semibold transition-colors sm:h-11 sm:px-4 sm:text-sm ${
                veganOnly
                  ? "border-forest bg-forest text-cream"
                  : "border-border bg-parchment/60 text-ink hover:border-forest hover:text-forest"
              }`}
            >
              <Image src="/images/vegan.svg" alt="" width={14} height={14} />
              <span>Vegan</span>
            </button>
          </div>

          <div
            role="group"
            aria-label="Kategorien"
            className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
          >
            <button
              type="button"
              aria-pressed={category === null}
              onClick={() => setCategory(null)}
              className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                category === null
                  ? "border-wine bg-wine text-cream"
                  : "border-border bg-cream text-ink hover:border-wine hover:text-wine"
              }`}
            >
              <span>Alle</span>
              <span
                className={`text-[11px] tabular-nums ${
                  category === null ? "text-cream/80" : "text-muted"
                }`}
              >
                ({totalItems})
              </span>
            </button>
            {sections.map((section) => {
              const active = category === section.title;
              return (
                <button
                  key={section.title}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(active ? null : section.title)}
                  className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-wine bg-wine text-cream"
                      : "border-border bg-cream text-ink hover:border-wine hover:text-wine"
                  }`}
                >
                  <span>{section.title}</span>
                  <span
                    className={`text-[11px] tabular-nums ${
                      active ? "text-cream/80" : "text-muted"
                    }`}
                  >
                    ({section.items.length})
                  </span>
                </button>
              );
            })}
          </div>

          {hasActiveFilters && (
            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border/50 pt-2 text-xs text-muted">
              <p role="status" aria-live="polite" className="font-medium text-ink">
                {totalMatches === 1
                  ? "1 Gericht gefunden"
                  : `${totalMatches} Gerichte gefunden`}
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="font-medium text-wine underline hover:text-wine-dark"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </search>
      </div>

      {filteredSections.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-border bg-parchment/50 px-6 py-12 text-center">
          <p className="font-playfair text-2xl font-bold text-ink">
            Keine Gerichte für Ihre Auswahl gefunden.
          </p>
          <p className="mt-2 text-sm text-muted">
            Probieren Sie einen anderen Suchbegriff oder setzen Sie die Filter zurück.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-wine px-6 py-2 text-sm font-semibold text-cream transition-colors hover:bg-wine-dark"
          >
            Alle {totalItems} Gerichte anzeigen
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-12">
          {filteredSections.map((section) => (
            <section
              key={section.title}
              aria-labelledby={`section-${section.title}`}
              className="scroll-mt-44"
            >
              <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-border pb-2.5">
                <div>
                  <h2
                    id={`section-${section.title}`}
                    className="font-playfair text-2xl font-bold text-ink sm:text-[28px]"
                  >
                    {section.title}
                  </h2>
                  {/* Hiển thị phần phụ đề nếu có trong JSON */}
                  {(section as any).subtitle && (
                    <p className="mt-1.5 text-sm font-normal text-muted">
                      {(section as any).subtitle}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-medium text-muted tabular-nums">
                  {section.items.length === 1
                    ? "1 Gericht"
                    : `${section.items.length} Gerichte`}
                </span>
              </div>
              <div className="space-y-3.5">
                {section.items.map((item) => (
                  <Dish
                    key={item.id}
                    item={item}
                    canOrder={orderable.has(item.id)}
                    inCartCount={itemQuantities.get(item.id) ?? 0}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
