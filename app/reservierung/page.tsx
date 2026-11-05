import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ReservationForm from "@/components/reservation/ReservationForm";
import { takeawayConfig } from "@/lib/takeaway/config";
import { formatPickupWindowsSummary } from "@/lib/takeaway/format";

export const metadata: Metadata = {
  title: "Tisch reservieren | Königswirt",
  description:
    "Reservieren Sie Ihren Tisch im historischen Landgasthof Königswirt in Marktoberdorf.",
};

export default function ReservierungPage() {
  const openingHoursSummary = formatPickupWindowsSummary(takeawayConfig.pickupWindows);

  return (
    <div className="mx-auto max-w-[1040px] px-4 pb-20 pt-6 leading-6 sm:px-6 sm:pt-10">
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-parchment/70 px-3.5 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-wine hover:text-wine"
        >
          <span aria-hidden="true">←</span>
          <span>Zurück zur Startseite</span>
        </Link>
        <Link
          href="/menus"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream px-3.5 py-1.5 text-xs font-medium text-muted transition-colors hover:border-wine hover:text-wine"
        >
          <span>Speisekarte & Abholung</span>
        </Link>
      </div>

      <header className="mb-8 border-b border-border pb-6">
        <div className="flex items-center gap-3">
          <Image src="/images/krone.png" alt="" width={36} height={22} className="w-8" />
          <h1 className="font-playfair text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Tisch reservieren
          </h1>
        </div>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Reservieren Sie Ihren Tisch in der historischen Königsstube (Schongauer Str. 13,
          87616 Marktoberdorf). Wir bestätigen Ihre Anfrage persönlich per E-Mail.
        </p>
      </header>

      <ReservationForm
        openingHoursSummary={openingHoursSummary}
        leadTimeMinutes={takeawayConfig.leadTimeMinutes}
      />
    </div>
  );
}
