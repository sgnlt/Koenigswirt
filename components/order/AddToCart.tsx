"use client";

import { useId, useState } from "react";
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
  const selectId = useId();
  const cart = useCart();

  const quantityByKey = new Map(cart.map((entry) => [entry.key, entry.quantity]));
  const selectedOption = options.find((opt) => opt.key === selected) ?? options[0];
  const quantity = quantityByKey.get(selected) ?? 0;
  const selectedTitle =
    options.length > 1 && selectedOption.label !== name
      ? `${name} (${selectedOption.label})`
      : name;

  const variantsInCart =
    options.length > 1
      ? options.filter((opt) => (quantityByKey.get(opt.key) ?? 0) > 0)
      : [];

  return (
    <div className="mt-3 flex flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {options.length > 1 && (
          <>
            <label htmlFor={selectId} className="sr-only">
              Auswahl für {name}
            </label>
            <select
              id={selectId}
              value={selected}
              onChange={(event) => setSelected(event.target.value)}
              className="h-11 max-w-full rounded-full border border-ink/50 bg-cream px-4 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
            >
              {options.map((option) => {
                const count = quantityByKey.get(option.key) ?? 0;
                const priceSuffix =
                  option.priceCents !== undefined ? ` – ${formatEuro(option.priceCents)}` : "";
                const countSuffix = count > 0 ? ` (${count}×)` : "";
                return (
                  <option key={option.key} value={option.key}>
                    {option.label}
                    {priceSuffix}
                    {countSuffix}
                  </option>
                );
              })}
            </select>
          </>
        )}

        {quantity === 0 ? (
          <button
            type="button"
            onClick={() => addToCart(selected)}
            aria-label={`${name} in den Warenkorb legen`}
            className="h-11 rounded-full border border-wine px-5 text-sm font-medium text-wine transition-colors hover:bg-wine hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
          >
            + In den Warenkorb
          </button>
        ) : (
          <div className="inline-flex h-11 items-center rounded-full border border-wine bg-cream p-1">
            <button
              type="button"
              aria-label={`Menge von ${selectedTitle} verringern`}
              onClick={() => setQuantity(selected, quantity - 1)}
              className="flex size-9 items-center justify-center rounded-full bg-cream text-base font-bold text-wine transition-colors hover:bg-wine hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
            >
              −
            </button>
            <span aria-live="polite" className="min-w-28 px-2 text-center text-sm font-medium text-wine">
              {quantity} im Warenkorb
            </span>
            <button
              type="button"
              aria-label={`Menge von ${selectedTitle} erhöhen`}
              disabled={quantity >= MAX_QUANTITY_PER_LINE}
              onClick={() => addToCart(selected)}
              className="flex size-9 items-center justify-center rounded-full bg-cream text-base font-bold text-wine transition-colors hover:bg-wine hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine disabled:opacity-40"
            >
              +
            </button>
          </div>
        )}
      </div>

      {variantsInCart.length > 0 && (
        <p className="text-xs text-muted">
          Im Warenkorb:{" "}
          {variantsInCart
            .map((opt) => `${quantityByKey.get(opt.key)}× ${opt.label}`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
