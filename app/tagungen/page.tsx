import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "TAGUNGEN | Königswirt" };

const offers = [
  ["Professionelle Gastwirtschaft:", "Erstklassige Verpflegung für Ihre Gäste – vom reichhaltigen Frühstücksbuffet bis hin zum exklusiven Abendmenü."],
  ["Vielseitiger Raum:", "Platz für 170 Personen, individuell gestaltbar für Seminare, Konferenzen oder Workshops."],
  ["Modernste Ausstattung:", "Beamer, Leinwand, WLAN, Tonanlage und Moderationskoffer inklusive."],
  ["Komfortable Einrichtung:", "Ausreichend Sitzmöglichkeiten und flexible Tischanordnungen."],
  ["Professioneller Service:", "Unterstützung bei der Planung und Betreuung Ihrer Veranstaltung."],
];

export default function TagungenPage() {
  return (
    <>
      <section className="grid lg:h-[675px] lg:grid-cols-[35.4%_1fr]">
        <div className="order-2 px-[35px] py-8 lg:order-none lg:px-0 lg:pl-[45px] lg:pr-5 lg:pt-[23px]">
          <h1 className="font-playfair text-[28px] leading-none lg:text-[76.5px]">
            Ihr Tagungs-
            <br />
            raum im Allgäu
          </h1>
          <p className="mt-5 max-w-[300px] text-sm leading-[18px] lg:mt-2 lg:text-[20.25px] lg:leading-[26.3px]">
            Unsere Räumlichkeiten stehen neben den regulären Öffnungstagen auch montags und dienstags für Tagungen und Meetings zur Verfügung und sind mit Beamer, Leinwand, Moderationskoffer, mobilen Kaffeemaschine und vielem mehr ausgestattet.
          </p>
          <a href="mailto:info@koenigswirt.de?subject=Buchung%20des%20Tagungsraumes" className="mt-[30px] inline-block bg-black px-[17px] py-[13px] font-madefor text-base text-white">
            Kontakt aufnehmen
          </a>
        </div>
        <div className="relative order-1 h-[260px] lg:order-none lg:h-auto">
          <Image src="/images/tagung-saal.jpg" alt="Tagung im Saal" fill preload sizes="(min-width: 1024px) 65vw, 100vw" className="object-cover object-[48%_50%]" />
        </div>
      </section>

      <section className="grid lg:h-[611px] lg:grid-cols-2">
        <div className="py-8 lg:pt-[30px]">
          <h2 className="text-center font-playfair text-[22px] leading-[29px] lg:text-[45px] lg:leading-[58.5px]">Was wir bieten:</h2>
          <ul className="mt-5 list-disc pl-[46px] pr-4 text-[13px] leading-[17px] lg:text-[18px] lg:leading-[23.4px] lg:pl-[142px] lg:pr-[90px]">
            {offers.map(([title, text]) => (
              <li key={title} className="mb-[23px]">
                {title}
                <br />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative h-[172px] lg:h-auto">
          <Image src="/images/tagung-tisch.jpg" alt="Gedeckter Tisch" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[50%_51%]" />
        </div>
      </section>

      <section className="mb-14 grid lg:h-[420px] lg:grid-cols-2">
        <div className="relative h-[172px] lg:h-auto">
          <Image src="/images/tagung-catering.jpg" alt="Catering-Platte" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
        <div className="px-4 py-8 text-center lg:px-[110px] lg:pt-[60px]">
          <h2 className="font-playfair text-[22px] leading-[29px] lg:text-[45px] lg:leading-[58.5px]">Warum im Königswirt?</h2>
          <p className="mt-6 text-[13px] leading-[17px] lg:text-[18px] lg:leading-[23.4px]">
            Unser zentral gelegener und gut erreichbarer Saal steht neben den regulären Öffnungstagen auch montags und dienstags für Tagungen und Meetings zur Verfügung. Ihre Gäste profitieren von einer bequemen Anreise mit ausreichend Parkplätzen vor Ort. Für eine professionelle Ausstattung sorgen Beamer, Leinwand, Moderationskoffer und eine mobile Kaffeemaschine, während unser Catering-Team erstklassige Verpflegung bietet – von kleinen Snacks bis hin zu mehrgängigen Menüs.
          </p>
        </div>
      </section>
    </>
  );
}
