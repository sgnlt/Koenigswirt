import type { Metadata } from "next";
import Image from "next/image";
import CartBar from "@/components/order/CartBar";
import MenuExplorer from "@/components/order/MenuExplorer";
import menu from "@/content/menu.json";
import { buildCatalog } from "@/lib/takeaway/catalog";
import { isOrderingOpen, takeawayConfig } from "@/lib/takeaway/config";
import type { MenuSection } from "@/lib/takeaway/search";

export const metadata: Metadata = { title: "Speisekarten (Neu) | Königswirt" };

const orderingOpen = isOrderingOpen(takeawayConfig);
const orderableIds = orderingOpen ? takeawayConfig.orderableItemIds : [];
const catalog = orderingOpen ? buildCatalog(orderableIds) : [];

export default function MenusPage() {
  return (
    <div className="mx-auto max-w-[832px] px-4 pb-10 text-center leading-5">
      <Image
        src="/images/logo-gross.png"
        alt="Königswirt"
        width={327}
        height={218}
        className="mx-auto aspect-[3/2] w-[327px] object-cover"
        preload
      />
      <h1 className="font-playfair text-[40px] leading-[52px]">Herzlich Willkommen</h1>
      <p className="mt-[25px] font-playfair text-[18px] leading-[23px]">
        Historischer Landgasthof im Allgäu
      </p>

      <MenuExplorer
        sections={menu.sections as MenuSection[]}
        orderableIds={orderableIds}
      />

      <p className="mt-16 font-playfair text-[36px] leading-[47px]">An Guadn!</p>
      <p className="mt-3 font-playfair text-[18px] leading-[23px]">
        Wünscht euch das Königswirt Team
      </p>
      <Image
        src="/images/og.jpg"
        alt="Königswirt"
        width={327}
        height={218}
        className="mx-auto mt-10 aspect-[3/2] w-[327px] object-cover"
      />
      {orderingOpen && <CartBar catalog={catalog} />}
    </div>
  );
}
