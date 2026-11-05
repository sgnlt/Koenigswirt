import Image from "next/image";
import Link from "next/link";
import { BOOKING_URL, GASTRONAUT_URL, PHONE_DISPLAY, PHONE_HREF } from "@/lib/site";

const footerLinks = [
  { label: "RESTAURANT", href: "/#restaurant" },
  { label: "SPEISEKARTE & ABHOLUNG", href: "/menus" },
  { label: "APARTMENTS", href: "/#apartments" },
  { label: "SAAL MIT BÜHNE", href: "/#saal" },
  { label: "SALETTL", href: "/#salettl" },
  { label: "TAGUNGEN", href: "/tagungen" },
  { label: "PRESSE", href: "/presse" },
];

export default function Footer() {
  return (
    <footer id="kontakt" className="border-t border-border bg-parchment/60 text-ink">
      <div className="mx-auto max-w-[1200px] px-6 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h2 className="font-playfair text-2xl font-bold leading-tight text-ink">Menu</h2>
            <ul className="mt-5 space-y-2.5 text-sm">
              {footerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-block text-ink/90 transition-colors hover:text-wine hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold leading-tight text-ink">
              Unsere Adresse
            </h2>
            <address className="mt-5 not-italic text-sm leading-6 text-ink/90">
              <p className="font-semibold text-ink">Königswirt · Historischer Landgasthof</p>
              <p>Schongauer Str. 13</p>
              <p>87616 Marktoberdorf / Bertoldshofen</p>
              <p className="mt-4">
                Tel.:{" "}
                <a href={PHONE_HREF} className="underline hover:text-wine">
                  {PHONE_DISPLAY}
                </a>
              </p>
              <p>
                E-Mail:{" "}
                <a href="mailto:info@koenigswirt.de" className="underline hover:text-wine">
                  info@koenigswirt.de
                </a>
              </p>
            </address>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/images/krone.png" alt="" width={36} height={22} className="w-8" />
              <h2 className="font-playfair text-2xl font-bold leading-tight text-ink">
                Direkt buchen & bestellen
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Bestellen Sie unsere Gerichte bequem online zur Abholung oder reservieren Sie Ihren
              Tisch und Ihr Apartment direkt.
            </p>
            <div className="mt-5 flex flex-col items-start gap-2.5">
              <Link
                href="/menus"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-wine px-5 text-xs font-semibold tracking-[0.03em] text-cream transition-colors hover:bg-wine-dark"
              >
                SPEISEKARTE & ABHOLBESTELLUNG
              </Link>
              <a
                href={GASTRONAUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink/30 bg-cream px-5 text-xs font-medium tracking-[0.03em] text-ink transition-colors hover:border-wine hover:text-wine"
              >
                TISCH RESERVIEREN
              </a>
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-ink/30 bg-cream px-5 text-xs font-medium tracking-[0.03em] text-ink transition-colors hover:border-wine hover:text-wine"
              >
                APARTMENT BUCHEN
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© 2024 by Königswirt. Built by PAOO</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy-policy" className="underline hover:text-ink">
              Datenschutzerklärung
            </Link>
            <Link href="/impressum" className="underline hover:text-ink">
              Impressum
            </Link>
            <Link href="/accessibility-statement" className="underline hover:text-ink">
              Barrierefreiheit
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
