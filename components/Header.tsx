"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BOOKING_URL, NAV_LINKS, PHONE_DISPLAY, PHONE_HREF, RESERVATION_HREF } from "@/lib/site";
import { useCart } from "@/lib/takeaway/cart-store";

// The live site highlights RESTAURANT and KONTAKT while scrolling on the home page.
function activeSection(scrollY: number, viewport: number) {
  const restaurant = document.getElementById("restaurant");
  const apartments = document.getElementById("apartments");
  if (!restaurant || !apartments) return null;
  const pageBottom = document.documentElement.scrollHeight - viewport;
  if (scrollY >= pageBottom - 10) return "/#kontakt";
  const top = restaurant.getBoundingClientRect().top + scrollY;
  const end = apartments.getBoundingClientRect().top + scrollY - 94;
  return scrollY >= top - 100 && scrollY < end ? "/#restaurant" : null;
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const cart = useCart();
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  useEffect(() => {
    const onScroll = () => {
      const { scrollY, innerHeight } = window;
      setScrolled(scrollY > 8);
      setActiveHref(activeSection(scrollY, innerHeight));
    };
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 h-[85px] transition-all duration-200 xl:h-[94px] ${
        scrolled || !isHome
          ? "border-b border-border/80 bg-cream/95 shadow-[0_2px_16px_rgba(38,34,32,0.05)] backdrop-blur-md"
          : "bg-cream/80 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 sm:px-6 xl:px-10">
        <Link
          href="/"
          aria-label="Königswirt Startseite"
          className="relative z-10 w-[105px] shrink-0 xl:w-[129px]"
        >
          <Image src="/images/logo.png" alt="Königswirt" width={258} height={142} preload />
        </Link>

        <nav
          aria-label="Hauptmenü"
          className="hidden items-center gap-1 xl:flex 2xl:gap-3"
        >
          {NAV_LINKS.map((link) => {
            const isCurrentRoute =
              (isHome && activeHref === link.href) ||
              (!link.href.startsWith("/#") && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isCurrentRoute ? "page" : undefined}
                className={`relative flex h-10 items-center whitespace-nowrap rounded-full px-3.5 font-madefor text-[13px] tracking-[0.04em] transition-colors hover:text-nav-active 2xl:px-4 2xl:text-sm ${
                  isCurrentRoute
                    ? "font-semibold text-nav-active after:absolute after:inset-x-3.5 after:bottom-1.5 after:h-0.5 after:rounded-full after:bg-wine"
                    : "text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5">
          {cartCount > 0 ? (
            <Link
              href="/bestellung"
              aria-label={`Warenkorb zur Abholung (${cartCount} Artikel)`}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-wine/30 bg-parchment px-3.5 font-madefor text-xs font-semibold text-wine transition-colors hover:border-wine hover:bg-wine hover:text-cream"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                aria-hidden="true"
                className="size-4 shrink-0"
              >
                <path
                  d="M5 6.5h10l-.8 9.2a1.5 1.5 0 01-1.5 1.3H7.3a1.5 1.5 0 01-1.5-1.3L5 6.5z"
                  strokeLinejoin="round"
                />
                <path d="M7.5 6.5V5a2.5 2.5 0 015 0v1.5" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Abholung</span>
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-wine px-1.5 py-0.5 text-[11px] font-bold leading-none text-cream tabular-nums">
                {cartCount}
              </span>
            </Link>
          ) : (
            <Link
              href="/menus"
              className="hidden h-[42px] items-center gap-1.5 rounded-full border border-wine/40 bg-parchment/80 px-4 font-madefor text-xs font-medium text-wine transition-colors hover:border-wine hover:bg-wine hover:text-cream md:inline-flex xl:hidden 2xl:inline-flex"
            >
              <span>SPEISEKARTE & ABHOLUNG</span>
            </Link>
          )}

          <Link
            href={RESERVATION_HREF}
            className="hidden h-[42px] items-center justify-center rounded-full border border-ink/25 bg-cream px-4 font-madefor text-xs font-medium tracking-[0.03em] text-ink transition-colors hover:border-wine hover:text-wine sm:inline-flex"
          >
            TISCH RESERVIEREN
          </Link>

          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-[42px] items-center justify-center rounded-full bg-wine px-5 font-madefor text-xs font-medium tracking-[0.03em] text-cream transition-colors hover:bg-wine-dark xl:inline-flex"
          >
            APARTMENT BUCHEN
          </a>

          <button
            type="button"
            aria-label="Menü öffnen"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/15 bg-parchment/60 text-ink transition-colors hover:bg-parchment xl:hidden"
          >
            <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
              <span className="h-[2px] w-full bg-ink" />
              <span className="h-[2px] w-full bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menü"
          className="fixed inset-0 z-50 flex min-h-dvh flex-col justify-between overflow-y-auto bg-cream px-6 pb-8 pt-5 xl:hidden"
        >
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <Image src="/images/krone.png" alt="" width={48} height={30} className="w-11" />
                <span className="font-playfair text-lg font-bold text-ink">Königswirt</span>
              </div>
              <button
                type="button"
                aria-label="Menü schließen"
                onClick={() => setOpen(false)}
                className="flex size-11 items-center justify-center rounded-full border border-ink/15 text-ink hover:bg-parchment"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 4l16 16M20 4L4 20" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav aria-label="Mobiles Menü" className="mt-6 flex flex-col divide-y divide-border/60">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-between py-2.5 font-playfair text-xl text-wine-dark transition-colors hover:text-wine"
                >
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="text-sm text-muted">→</span>
                </Link>
              ))}
            </nav>

            <div className="mt-6 flex flex-col gap-3">
              {cartCount > 0 ? (
                <Link
                  href="/bestellung"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-wine px-6 text-sm font-semibold text-cream shadow-sm"
                >
                  <span>ZUR ABHOLBESTELLUNG ({cartCount})</span>
                </Link>
              ) : (
                <Link
                  href="/menus"
                  onClick={() => setOpen(false)}
                  className="flex min-h-12 items-center justify-center rounded-full border border-wine bg-parchment px-6 text-sm font-semibold text-wine"
                >
                  SPEISEKARTE & ABHOLUNG
                </Link>
              )}

              <Link
                href={RESERVATION_HREF}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-full border border-ink/30 bg-cream px-6 text-sm font-medium text-ink"
              >
                TISCH RESERVIEREN
              </Link>

              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center justify-center rounded-full bg-wine-dark px-6 text-sm font-medium text-cream"
              >
                APARTMENT BUCHEN
              </a>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-5 text-sm leading-relaxed text-muted">
            <p className="font-semibold text-ink">Königswirt · Historischer Landgasthof</p>
            <p>Schongauer Str. 13 · 87616 Marktoberdorf</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
              <a href={PHONE_HREF} className="text-ink underline">
                {PHONE_DISPLAY}
              </a>
              <a href="mailto:info@koenigswirt.de" className="text-ink underline">
                info@koenigswirt.de
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
