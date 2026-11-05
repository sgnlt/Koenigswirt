"use client";

import { useState } from "react";
import { addToCart, setQuantity, useCart } from "@/lib/takeaway/cart-store";
import { formatEuro } from "@/lib/takeaway/format";
import { MAX_QUANTITY_PER_LINE } from "@/lib/takeaway/types";

export type AddToCartOption = {
  key: string;
  label: string;
  priceCents?: number;
};

export default function AddToCart({
  name,
  options,
}: {
  name: string;
  options: AddToCartOption[];
}) {
  const [selected, setSelected] = useState(options[0].key);
  const cart = useCart();

  const quantityByKey = new Map(cart.map((entry) => [entry.key, entry.quantity]));
  const selectedOption = options.find((opt) => opt.key === selected) ?? options[0];
  const quantity = quantityByKey.get(selected) ?? 0;
  const isMulti = options.length > 1;
  const selectedTitle =
    isMulti && selectedOption.label !== name
      ? `${name} (${selectedOption.label})`
      : name;

  const variantsInCart = isMulti
    ? options.filter((opt) => (quantityByKey.get(opt.key) ?? 0) > 0)
    : [];

  return (
    <div className={`flex flex-col gap-3 ${isMulti ? "w-full pt-2" : "items-start sm:items-end"}`}>
      {isMulti && (
        <div
          role="group"
          aria-label={`Variante wählen für ${name}`}
          className="flex flex-wrap gap-2"
        >
          {options.map((option) => {
            const isSelected = option.key === selected;
            const count = quantityByKey.get(option.key) ?? 0;
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelected(option.key)}
                className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-left text-xs font-medium transition-all sm:text-sm ${
                  isSelected
                    ? "border-wine bg-wine text-cream shadow-xs"
                    : count > 0
                      ? "border-wine/50 bg-wine/5 text-ink hover:border-wine"
                      : "border-border bg-cream text-ink hover:border-wine/60 hover:bg-parchment"
                }`}
              >
                <span>{option.label}</span>
                {option.priceCents !== undefined && (
                  <span
                    className={`font-semibold tabular-nums ${
                      isSelected ? "text-cream/95" : "text-wine"
                    }`}
                  >
                    {formatEuro(option.priceCents)}
                  </span>
                )}
                {count > 0 && (
                  <span
                    className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none tabular-nums ${
                      isSelected ? "bg-cream text-wine" : "bg-wine text-cream"
                    }`}
                  >
                    {count}×
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {quantity === 0 ? (
          <button
            type="button"
            onClick={() => addToCart(selected)}
            aria-label={`${selectedTitle} in den Warenkorb legen`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-wine bg-cream px-4 text-xs font-semibold tracking-[0.02em] text-wine transition-all hover:bg-wine hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine sm:h-11 sm:px-5 sm:text-sm"
          >
            <span aria-hidden="true" className="text-base leading-none">+</span>
            <span>{isMulti ? "Auswahl hinzufügen" : "In den Warenkorb"}</span>
          </button>
        ) : (
          <div className="inline-flex h-10 items-center rounded-full border border-wine bg-wine/8 p-1 sm:h-11">
            <button
              type="button"
              aria-label={`Menge von ${selectedTitle} verringern`}
              onClick={() => setQuantity(selected, quantity - 1)}
              className="flex size-8 items-center justify-center rounded-full bg-cream text-base font-bold text-wine shadow-2xs transition-colors hover:bg-wine hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine sm:size-9"
            >
              −
            </button>
            <span
              aria-live="polite"
              className="min-w-24 px-2.5 text-center text-xs font-semibold text-wine tabular-nums sm:min-w-28 sm:text-sm"
            >
              {quantity} im Korb
            </span>
            <button
              type="button"
              aria-label={`Menge von ${selectedTitle} erhöhen`}
              disabled={quantity >= MAX_QUANTITY_PER_LINE}
              onClick={() => addToCart(selected)}
              className="flex size-8 items-center justify-center rounded-full bg-wine text-base font-bold text-cream shadow-2xs transition-colors hover:bg-wine-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-40 sm:size-9"
            >
              +
            </button>
          </div>
        )}

        {variantsInCart.length > 0 && (
          <p className="text-xs font-medium text-wine">
            Im Korb:{" "}
            {variantsInCart
              .map((opt) => `${quantityByKey.get(opt.key)}× ${opt.label}`)
              .join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
