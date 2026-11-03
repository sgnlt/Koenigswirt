import type { Metadata } from "next";
import Checkout from "@/components/order/Checkout";
import { PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";
import { buildCatalog } from "@/lib/takeaway/catalog";
import { isOrderingOpen, takeawayConfig as config } from "@/lib/takeaway/config";
import { weekdayName } from "@/lib/takeaway/format";

export const metadata: Metadata = {
  title: "Abholbestellung | Königswirt",
  robots: { index: false },
};

export default function BestellungPage() {
  const open = isOrderingOpen(config);
  return (
    <div className="mx-auto max-w-[576px] px-4 pb-16 pt-8 leading-6">
      <h1 className="font-playfair text-[32px] leading-10">Abholbestellung</h1>
      {open ? (
        <Checkout
          catalog={buildCatalog(config.orderableItemIds)}
          privacyNotice={config.privacyNotice as string}
          paymentNote={config.paymentNote}
          allergenNote={config.allergenNote}
          pickupHint={
            <>
              Abholung möglich:{" "}
              {config.pickupWindows
                .map((window) => `${weekdayName(window.weekday)} ${window.from}–${window.to} Uhr`)
                .join(", ")}
              . Vorlauf: mindestens {config.leadTimeMinutes} Minuten.
            </>
          }
        />
      ) : (
        <p className="mt-8">
          Die Online-Bestellung ist derzeit nicht verfügbar. Telefonisch erreichen Sie uns unter{" "}
          <a href={PHONE_HREF} className="underline">{PHONE_DISPLAY}</a>.
        </p>
      )}
    </div>
  );
}
