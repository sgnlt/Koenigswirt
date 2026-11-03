"use client";

import Image from "next/image";
import { Fragment, useId, useState } from "react";
import AddToCart from "@/components/order/AddToCart";
import {
  filterMenuSections,
  type MenuItem,
  type MenuSection,
} from "@/lib/takeaway/search";

function Line({ cells }: { cells: string[] }) {
  if (cells.length === 1) {
    return <p className="mt-3 whitespace-pre-line first:mt-3">{cells[0]}</p>;
  }
  const pairs: string[][] = [];
  for (let i = 0; i < cells.length; i += 2) {
    pairs.push(cells.slice(i, i + 2));
  }
  return (
    <p className="mt-3 flex justify-center divide-x divide-ink/30">
      {pairs.map((pair) => (
        <span key={pair.join()} className="px-3">
          {pair.join(" ")}
        </span>
      ))}
    </p>
  );
}

function Dish({ item, canOrder }: { item: MenuItem; canOrder: boolean }) {
  const [price, ...rest] = [...item.lines].reverse();
  return (
    <div className="mt-[23px]">
      <h3 className="font-playfair text-xl leading-[25px]">{item.name}</h3>
      {[...rest].reverse().map((cells) => (
        <Line key={cells.join()} cells={cells} />
      ))}
      {item.vegan && (
        <p className="mt-3 flex items-center justify-center gap-1 text-xs">
          <Image src="/images/vegan.svg" alt="" width={16} height={16} /> Vegan
        </p>
      )}
      {price && <Line cells={price} />}
      {canOrder && (
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

  const orderable = new Set(orderableIds);
  const filteredSections = filterMenuSections(sections, {
    query,
    category,
    veganOnly,
  });

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
    <>
      <search
        aria-label="Speisekarte durchsuchen und filtern"
        className="mx-auto mt-10 max-w-[640px]"
      >
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            Gericht oder Zutat suchen
          </label>
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
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
            placeholder="Gericht oder Zutat suchen (z. B. Schnitzel, Spätzle, Rind) …"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="h-12 w-full rounded-full border border-ink/40 bg-cream pl-11 pr-11 text-base text-ink placeholder:text-muted focus-visible:border-wine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Suche löschen"
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/10 hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Kategorien und Ernährungsfilter"
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
            className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              category === null
                ? "border-wine bg-wine text-cream"
                : "border-ink/30 bg-cream text-ink hover:border-wine hover:text-wine"
            }`}
          >
            Alle
          </button>
          {sections.map((section) => {
            const active = category === section.title;
            return (
              <button
                key={section.title}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(active ? null : section.title)}
                className={`min-h-9 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-wine bg-wine text-cream"
                    : "border-ink/30 bg-cream text-ink hover:border-wine hover:text-wine"
                }`}
              >
                {section.title}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={veganOnly}
            onClick={() => setVeganOnly((prev) => !prev)}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
              veganOnly
                ? "border-wine bg-wine text-cream"
                : "border-ink/30 bg-cream text-ink hover:border-wine hover:text-wine"
            }`}
          >
            <Image src="/images/vegan.svg" alt="" width={14} height={14} />
            Vegan
          </button>
        </div>

        <div className="mt-3 flex min-h-6 items-center justify-center gap-3 text-xs text-muted">
          <p role="status" aria-live="polite">
            {hasActiveFilters
              ? totalMatches === 1
                ? "1 Gericht gefunden"
                : `${totalMatches} Gerichte gefunden`
              : ""}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="underline hover:text-ink"
            >
              Filter zurücksetzen
            </button>
          )}
        </div>
      </search>

      {filteredSections.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-ink/20 px-6 py-10">
          <p className="font-playfair text-xl">
            Keine Gerichte für Ihre Suche gefunden.
          </p>
          <p className="mt-2 text-sm text-muted">
            Bitte probieren Sie einen anderen Suchbegriff oder setzen Sie die Filter zurück.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-5 min-h-11 rounded-full bg-wine px-6 py-2 text-sm font-medium text-cream transition-colors hover:bg-wine-dark"
          >
            Alle Gerichte anzeigen
          </button>
        </div>
      ) : (
        filteredSections.map((section) => (
          <Fragment key={section.title}>
            <hr className="mt-[30px] border-ink/30 first-of-type:mt-[38px]" />
            <section className="mt-[30px]">
              <h2 className="text-[18px] leading-[22px]">{section.title}</h2>
              {section.items.map((item) => (
                <Dish
                  key={item.id}
                  item={item}
                  canOrder={orderable.has(item.id)}
                />
              ))}
            </section>
          </Fragment>
        ))
      )}
    </>
  );
}
