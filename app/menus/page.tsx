import type { Metadata } from "next";
import Image from "next/image";
import CartBar from "@/components/order/CartBar";
import MenuExplorer from "@/components/order/MenuExplorer";
import menu from "@/content/menu.json";
import { GASTRONAUT_URL } from "@/lib/site";
import { buildCatalog } from "@/lib/takeaway/catalog";
import { isOrderingOpen, takeawayConfig } from "@/lib/takeaway/config";
import { formatPickupWindowsSummary } from "@/lib/takeaway/format";
import type { MenuSection } from "@/lib/takeaway/search";

export const metadata: Metadata = { title: "Speisekarte & Abholung | Königswirt" };

const orderingOpen = isOrderingOpen(takeawayConfig);
const orderableIds = orderingOpen ? takeawayConfig.orderableItemIds : [];
const catalog = orderingOpen ? buildCatalog(orderableIds) : [];
const pickupSummary = formatPickupWindowsSummary(takeawayConfig.pickupWindows);

export default function MenusPage() {
  return (
    <div className="mx-auto max-w-[860px] px-4 pb-24 pt-4 sm:px-6 sm:pt-8">
      <header className="rounded-3xl border border-border bg-parchment px-4 py-4 text-center sm:px-8 sm:py-7">
        <div className="flex items-center justify-center gap-2.5 sm:flex-col sm:gap-1">
          <Image
            src="/images/krone.png"
            alt=""
            width={44}
            height={28}
            className="w-7 sm:w-10"
          />
          <h1 className="font-playfair text-2xl font-bold leading-tight text-ink sm:text-[40px]">
            Speisekarte & Abholung
          </h1>
        </div>
        <p className="mt-1 font-playfair text-sm text-muted sm:mt-1.5 sm:text-lg">
          Historischer Landgasthof im Allgäu · Frisch für Sie zubereitet
        </p>

        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs sm:mt-5 sm:gap-2.5 sm:text-sm">
          {orderingOpen && (
            <div className="inline-flex items-center gap-2 rounded-full border border-wine/25 bg-cream px-3.5 py-1.5 text-ink shadow-2xs sm:px-4 sm:py-2">
              <span className="size-2 shrink-0 rounded-full bg-forest" aria-hidden="true" />
              <span>
                <strong>Abholservice:</strong> {pickupSummary} ({takeawayConfig.leadTimeMinutes} Min. Vorlauf)
              </span>
            </div>
          )}
          <a
            href={GASTRONAUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border bg-cream px-3.5 py-1.5 font-medium text-ink transition-colors hover:border-wine hover:text-wine sm:min-h-9 sm:px-4 sm:py-2"
          >
            <span>Vor Ort essen? Tisch reservieren</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>

      <MenuExplorer
        sections={menu.sections as MenuSection[]}
        orderableIds={orderableIds}
      />

      <footer className="mt-16 rounded-3xl border border-border bg-parchment/60 px-6 py-10 text-center">
        <Image
          src="/images/krone.png"
          alt=""
          width={36}
          height={22}
          className="mx-auto w-8"
        />
        <p className="mt-2 font-playfair text-3xl font-bold text-ink sm:text-4xl">
          An Guadn!
        </p>
        <p className="mt-1.5 font-playfair text-base text-muted sm:text-lg">
          Wünscht euch das Königswirt Team
        </p>
        {takeawayConfig.allergenNote && (
          <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-muted">
            {takeawayConfig.allergenNote}
          </p>
        )}
      </footer>

      {orderingOpen && <CartBar catalog={catalog} />}
    </div>
  );
}
