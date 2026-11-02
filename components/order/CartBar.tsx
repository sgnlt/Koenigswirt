"use client";

import Link from "next/link";
import { useCart } from "@/lib/takeaway/cart-store";

export default function CartBar() {
  const cart = useCart();
  const count = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const label = count === 1 ? "1 Artikel im Warenkorb" : `${count} Artikel im Warenkorb`;

  return (
    <>
      {/* Stays mounted so screen readers announce each change to the count. */}
      <p role="status" className="sr-only">{count > 0 ? label : ""}</p>
      {count > 0 && (
        <div className="sticky bottom-4 z-30 mt-8 flex justify-center">
          <Link
            href="/bestellung"
            className="flex min-h-11 items-center rounded-full bg-wine px-6 py-2 text-sm text-cream shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
          >
            {label}: zur Bestellung
          </Link>
        </div>
      )}
    </>
  );
}
