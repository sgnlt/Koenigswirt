"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BOOKING_URL, NAV_LINKS } from "@/lib/site";

// The live site only highlights RESTAURANT and KONTAKT while scrolling.
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
  const isHome = usePathname() === "/";

  useEffect(() => {
    const onScroll = () => {
      const { scrollY, innerHeight } = window;
      setScrolled(scrollY > 0);
      setActiveHref(activeSection(scrollY, innerHeight));
    };
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-[85px] transition-colors xl:h-[94px] ${
        scrolled ? "bg-cream" : "bg-cream/75"
      }`}
    >
      <Link
        href="/"
        aria-label="Königswirt Startseite"
        className="absolute left-1/2 top-[19px] w-[105px] -translate-x-1/2 xl:left-[47px] xl:top-[24px] xl:w-[129px] xl:translate-x-0"
      >
        <Image src="/images/logo.png" alt="Königswirt" width={258} height={142} preload />
      </Link>

      <nav aria-label="Hauptmenü" className="absolute left-[18.5%] right-[206px] top-[43px] hidden justify-between xl:flex">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex h-10 items-center whitespace-nowrap px-[clamp(8px,3.5vw,51px)] font-madefor text-sm transition-colors hover:text-nav-active ${isHome && activeHref === link.href ? "text-nav-active" : "text-black"}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <a
        href={BOOKING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-[55px] top-10 hidden h-[42px] w-[142px] items-center justify-center rounded-full bg-wine font-madefor text-xs text-cream xl:flex"
      >
        APARTMENT BUCHEN
      </a>

      <button
        type="button"
        aria-label="Menü öffnen"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="absolute right-[26px] top-[37px] h-[30px] w-[52px] xl:hidden"
      >
        <span className="absolute left-0 top-[7px] h-[2px] w-full bg-black" />
        <span className="absolute bottom-[7px] left-0 h-[2px] w-full bg-black" />
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Menü" className="fixed inset-0 z-50 bg-cream xl:hidden">
          <Image src="/images/krone.png" alt="" width={70} height={44} className="absolute left-4 top-[15px]" />
          <button
            type="button"
            aria-label="Menü schließen"
            onClick={() => setOpen(false)}
            className="absolute right-6 top-[30px] size-6 text-black"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M2 2l20 20M22 2L2 22" />
            </svg>
          </button>
          <nav aria-label="Mobiles Menü" className="absolute left-7 top-[84px] flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="h-[32.4px] text-[16px] leading-[32px] text-wine-dark"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute left-4 top-[359px] flex h-[46px] w-[210px] items-center justify-center rounded-full bg-wine text-sm text-cream"
          >
            APARTMENT BUCHEN
          </a>
          <div className="absolute left-[18px] top-[535px] w-[209px] border-b border-ink pb-5 text-sm leading-[18px]">
            <p>Schongauer Str. 13</p>
            <p>87616 Marktoberdorf</p>
            <a href="mailto:info@koenigswirt.de" className="mt-4 block">
              info@koenigswirt.de
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
