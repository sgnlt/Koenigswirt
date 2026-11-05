import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Checkout from "@/components/order/Checkout";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";
import { buildCatalog } from "@/lib/takeaway/catalog";
import { isOrderingOpen, takeawayConfig as config } from "@/lib/takeaway/config";
import { formatPickupWindowsSummary } from "@/lib/takeaway/format";

export const metadata: Metadata = {
  title: "Abholbestellung | Königswirt",
  robots: { index: false },
};

export default function BestellungPage() {
  const open = isOrderingOpen(config);
  const pickupSummary = formatPickupWindowsSummary(config.pickupWindows);

  return (
    <div className="mx-auto max-w-[1040px] px-4 pb-20 pt-6 sm:px-6 sm:pt-10 leading-6">
      <div className="mb-6">
        <Link
          href="/menus"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-parchment/70 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-wine hover:text-wine"
        >
          <span aria-hidden="true">←</span>
          <span>Zurück zur Speisekarte</span>
        </Link>
      </div>

      <header className="mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Image src="/images/krone.png" alt="" width={36} height={22} className="w-8" />
          <h1 className="font-playfair text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Abholbestellung
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Bestellen Sie Ihre Speisen frisch zubereitet zur Abholung im Königswirt (Schongauer Str. 13, 87616 Marktoberdorf).
        </p>
      </header>

      {open ? (
        <Checkout
          catalog={buildCatalog(config.orderableItemIds)}
          privacyNotice={config.privacyNotice as string}
          paymentNote={config.paymentNote}
          allergenNote={config.allergenNote}
          pickupHint={
            <>
              Abholung möglich: {pickupSummary}. Vorlauf: mindestens{" "}
              {config.leadTimeMinutes} Minuten.
            </>
          }
        />
      ) : (
        <div className="mt-8 rounded-2xl border border-border bg-parchment p-6 sm:p-8">
          <p className="text-base text-ink">
            Die Online-Bestellung ist derzeit nicht verfügbar. Telefonisch erreichen Sie uns unter{" "}
            <a href={PHONE_HREF} className="font-semibold text-wine underline">
              {PHONE_DISPLAY}
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
