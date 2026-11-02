"use client";

import { useId, useState } from "react";
import { addToCart } from "@/lib/takeaway/cart-store";

type Option = { key: string; label: string };

export default function AddToCart({ name, options }: { name: string; options: Option[] }) {
  const [selected, setSelected] = useState(options[0].key);
  const selectId = useId();

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      {options.length > 1 && (
        <>
          <label htmlFor={selectId} className="sr-only">Auswahl für {name}</label>
          <select
            id={selectId}
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="h-11 max-w-full border border-ink/60 bg-cream px-2 text-sm"
          >
            {options.map((option) => (
              <option key={option.key} value={option.key}>{option.label}</option>
            ))}
          </select>
        </>
      )}
      <button
        type="button"
        onClick={() => addToCart(selected)}
        aria-label={`${name} in den Warenkorb legen`}
        className="h-11 rounded-full border border-wine px-5 text-sm text-wine transition-colors hover:bg-wine hover:text-cream"
      >
        In den Warenkorb
      </button>
    </div>
  );
}
