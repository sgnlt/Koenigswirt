import Link from "next/link";

const desktopMenu = [
  { label: "RESTAURANT", href: "/#restaurant", underline: false },
  { label: "APARTMENTS", href: "/#apartments", underline: true },
  { label: "SAAL MIT BÜHNE", href: "/#saal", underline: true },
  { label: "SALETTL", href: "/#salettl", underline: true },
  { label: "PRESSE", href: "/presse", underline: false },
];

const mobileMenu = [
  { label: "RESTAURANT", href: "/#restaurant" },
  { label: "APARTMENTS", href: "/#apartments" },
  { label: "SAAL MIT BÜHNE", href: "/#saal" },
  { label: "SALETTL", href: "/#salettl" },
  { label: "BIERGARTEN", href: "/#salettl" },
];

export default function Footer() {
  return (
    <footer id="kontakt" className="bg-cream">
      {/* Desktop */}
      <div className="relative hidden h-[414px] lg:block">
        <div className="absolute left-[18px] top-[18px]">
          <h2 className="font-playfair text-[29.25px] font-bold leading-[38px]">Menu</h2>
          <ul className="mt-[25px] text-[15.75px] leading-[20.5px]">
            {desktopMenu.map((link) => (
              <li key={link.label} className="mb-[6px]">
                <Link href={link.href} className={link.underline ? "underline" : ""}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute left-[411px] top-[52px] text-[15.75px] leading-[24px]">
          <h2 className="font-playfair text-[29.25px] font-bold leading-[38px]">Unsere Adresse</h2>
          <p className="mt-[21px]">Schongauer Str. 13</p>
          <p>87616 Marktoberdorf / Bertoldshofen</p>
          <p className="mt-[21px]">
            Tel.: <a href="tel:083428989340" className="underline">08342 / 89 89 340</a>
          </p>
          <p>
            E-Mail: <a href="mailto:info@koenigswirt.de" className="underline">info@koenigswirt.de</a>
          </p>
        </div>
        <p className="absolute left-[98px] top-[369px] text-sm leading-4">© 2024 by Königswirt. Built by PAOO</p>
        <Link href="/blank" className="absolute left-[463px] top-[369px] text-sm leading-4 underline">
          Datenschutzerklärung
        </Link>
        <Link href="/impressum" className="absolute left-[621px] top-[369px] text-sm leading-4 underline">
          Impressum
        </Link>
      </div>

      {/* Mobile */}
      <div className="h-[832px] px-[52px] pt-[29px] text-[13px] leading-[17px] lg:hidden">
        <h2 className="font-playfair text-[22px] leading-[29px]">Menu</h2>
        <ul className="mt-[26px]">
          {mobileMenu.map((link) => (
            <li key={link.label} className="mb-[10px]">
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
        <h2 className="mt-[27px] font-playfair text-[22px] leading-[29px]">Unsere Adresse</h2>
        <p className="mt-[25px]">Schongauer Str. 13</p>
        <p className="mt-[10px]">87616 Marktoberdorf / Bertoldshofen</p>
        <p className="mt-7">
          Tel.: <a href="tel:083428989340" className="underline">08342 / 8989340</a>
        </p>
        <p className="mt-[10px]">
          E-Mail: <a href="mailto:info@koenigswirt.de" className="underline">info@koenigswirt.de</a>
        </p>
        <p className="mt-7">
          <Link href="/blank" className="underline">Datenschutzerklärung</Link>
        </p>
        <p className="mt-[10px]">
          <Link href="/impressum" className="underline">Impressum</Link>
        </p>
      </div>
    </footer>
  );
}
