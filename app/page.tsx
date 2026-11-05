import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import LocationSlider from "@/components/LocationSlider";
import { BOOKING_URL, MAP_URL, RESERVATION_HREF } from "@/lib/site";

export const metadata: Metadata = { title: "STARTSEITE | KÖNIGSWIRT" };

function SectionText({ title, compact, children }: { title: string; compact?: boolean; children: ReactNode }) {
  return (
    <>
      <h2 className="text-center font-playfair text-[28px] font-bold leading-[33.6px] lg:text-[48px] lg:leading-[57.6px]">
        {title}
      </h2>
      <Image src="/images/krone.png" alt="" width={40} height={24} className={`mx-auto lg:mb-[49px] lg:mt-3 lg:w-10 ${compact ? "mb-6 mt-[6px] w-[29px]" : "mb-[27px] mt-[17px]"}`} />
      <div className={`space-y-[19.5px] text-[13px] leading-[19.5px] lg:space-y-[22.5px] lg:text-[15px] lg:leading-[22.5px] ${compact ? "lg:pr-4" : ""}`}>
        {children}
      </div>
    </>
  );
}

const galleries = [
  ["/images/apartment-1.jpg", "/images/apartment-2.jpg", "/images/apartment-3.jpg"],
  ["/images/apartment-4.jpg", "/images/apartment-5.jpg", "/images/apartment-6.jpg"],
];

// Mobile crops set on the live site.
const mobileCrops: Record<string, string> = {
  "/images/apartment-1.jpg": "/images/apartment-1-mobile.jpg",
  "/images/apartment-2.jpg": "/images/apartment-2-mobile.jpg",
};

function GalleryImage({ src, sizes }: { src: string; sizes: string }) {
  const mobile = mobileCrops[src];
  return (
    <>
      <Image src={src} alt="Apartment im Königswirt" fill sizes={sizes} className={`object-cover ${mobile ? "hidden lg:block" : ""}`} />
      {mobile && <Image src={mobile} alt="Apartment im Königswirt" fill sizes="90vw" className="object-cover lg:hidden" />}
    </>
  );
}

function Gallery({ images, className }: { images: string[]; className: string }) {
  const [small1, large, small2] = images;
  const tile = "relative h-[391px] w-full overflow-hidden lg:h-auto";
  return (
    <div className={`grid gap-[22px] px-8 lg:h-[861px] lg:grid-cols-[40.37%_1fr] lg:gap-y-[23px] lg:grid-rows-[361px_477px] lg:px-[45px] ${className}`}>
      <div className={`${tile} !h-[329px] lg:!h-auto`}>
        <GalleryImage src={small1} sizes="(min-width: 1024px) 38vw, 90vw" />
      </div>
      <div className={`${tile} lg:row-span-2`}>
        <GalleryImage src={large} sizes="(min-width: 1024px) 55vw, 90vw" />
      </div>
      <div className={tile}>
        <GalleryImage src={small2} sizes="(min-width: 1024px) 38vw, 90vw" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <section className="flow-root h-[600px] lg:h-[633px]">
        <div className="relative mx-4 -mt-[70px] h-[644px] lg:mx-[29px] lg:-mt-[81px] lg:h-[714px]">
          <Image src="/images/hero.jpg" alt="Der Königswirt von außen" fill preload quality={90} sizes="100vw" className="object-cover object-[22.2%_50%] lg:object-center" />
        </div>
      </section>

      <section id="restaurant" className="grid scroll-mt-[85px] px-[18px] pb-[63px] pt-[78px] lg:-scroll-mt-[165px] lg:min-h-[635px] lg:grid-cols-2 lg:px-0 lg:pb-12 lg:pt-[72px]">
        <div className="lg:pl-[10%] lg:pr-[5%] lg:pt-[56px]">
          <SectionText title="Königsstube">
            <p>
              Zwischen Kirche, Maibaum und Bergen erstreckt sich eine 300 Jahre alte Geschichte, die von uriger Gemütlichkeit und tief verwurzelten Traditionen geprägt ist. In dieser malerischen Kulisse lädt unsere Küche dazu ein, die regionalen Schätze und saisonalen Köstlichkeiten zu entdecken.
            </p>
            <p>
              Nur das Beste kommt bei uns auf den Tisch! Wir legen großen Wert darauf, unsere Zutaten von lokalen Lieferanten zu beziehen, denen wir vertrauen und auf die wir uns verlassen können. In unserer Küche werden diese hochwertigen Produkte mit den Raffinessen der modernen Kochkunst verfeinert und veredelt, um Ihnen ein unvergleichliches Geschmackserlebnis zu bieten.
            </p>
          </SectionText>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menus"
              className="inline-flex h-10 items-center justify-center rounded-full bg-wine px-6 text-[13px] font-medium tracking-[0.03em] text-cream transition-colors hover:bg-wine-dark"
            >
              SPEISEKARTE & ABHOLUNG
            </Link>
            <Link
              href={RESERVATION_HREF}
              className="inline-flex h-10 items-center justify-center rounded-full border border-ink px-6 text-[13px] font-medium tracking-[0.03em] text-ink transition-colors hover:bg-ink hover:text-cream"
            >
              TISCH RESERVIEREN
            </Link>
          </div>
        </div>
        <div className="relative mt-[64px] h-[240px] lg:ml-[5%] lg:mt-[30px] lg:h-[472px] lg:w-[85%]">
          <Image src="/images/koenigsstube.jpg" alt="Gedeckter Tisch in der Königsstube" fill sizes="(min-width: 1024px) 43vw, 90vw" className="object-cover object-[50%_51%]" />
        </div>
      </section>

      <section id="apartments" className="grid scroll-mt-[85px] lg:h-[445px] lg:scroll-mt-[94px] lg:grid-cols-2">
        <div className="relative mx-5 h-[200px] lg:ml-[10%] lg:mr-[5%] lg:mt-9 lg:h-[373px]">
          <Image src="/images/apartments-haus.jpg" alt="Der Königswirt mit den Apartments" fill sizes="(min-width: 1024px) 43vw, 90vw" className="object-cover" />
        </div>
        <div className="mt-6 pb-[27px] pl-[25px] pr-[30px] lg:-mt-px lg:px-0 lg:pb-0 lg:pl-[5%] lg:pr-[10%]">
          <SectionText title="Apartments" compact>
            <p>
              Entdecken Sie unsere charmanten Apartments inmitten der beeindruckenden Berge und malerischen Seenlandschaften des Allgäus, ein Ort, an dem man gerne länger verweilt. Hier können Sie sich entspannen und die Ruhe genießen, während Sie ausreichend Zeit haben, die vielfältigen Schönheiten der Region zu erkunden.
            </p>
            <p>
              Ob majestätische Berge, glitzernde Seen oder historische Burgen und Schlösser – das Allgäu hat viel zu bieten. Besonders das weltberühmte Schloss Neuschwanstein, ein Highlight der Region, ist nur gut 25 Minuten von unseren Apartments entfernt und lädt zu einem unvergesslichen Ausflug in die Geschichte ein.
            </p>
          </SectionText>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto mt-10 flex h-[35px] w-[170px] items-center justify-center border border-ink text-[13px] text-black lg:mt-8"
          >
            APARTMENT BUCHEN
          </a>
        </div>
      </section>

      <Gallery images={galleries[0]} className="bg-white pb-[33px] pt-8 lg:box-content lg:pb-[45px] lg:pt-[45px]" />
      <Gallery images={galleries[1]} className="bg-white pb-[33px] lg:box-content" />

      <section id="saal" className="grid scroll-mt-[85px] px-[18px] pb-[38px] pt-[47px] lg:min-h-[563px] lg:scroll-mt-[94px] lg:grid-cols-2 lg:p-0 lg:pb-12">
        <div className="lg:px-[7.5%] lg:pt-[90px]">
          <SectionText title="Saal mit Bühne">
            <p className="pr-2 lg:pr-0">
              Ob Hochzeiten, Tanzveranstaltungen, Firmenfeste, Vereinsjubiläen oder Versammlungen – wann immer Sie viele Gäste erwarten, sind Sie bei uns an der richtigen Adresse. Wir bieten Ihnen den perfekten Rahmen für jede Art von Feierlichkeit und sorgen dafür, dass Ihr Event unvergesslich wird.
            </p>
            <p>
              Von der stilvollen Dekoration bis hin zum exquisiten Catering können Sie all Ihre Wünsche bei uns individuell dazubuchen. Mit Platz für bis zu 170 Gäste garantieren wir Ihnen ausreichend Raum und besten Service, damit Sie und Ihre Gäste das Fest in vollen Zügen genießen können.
            </p>
          </SectionText>
          <Link
            href="/festsaal-mit-buehne"
            className="mx-auto mt-8 flex h-[38px] w-[190px] items-center justify-center border border-ink text-[13px] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            FESTSAAL ANFRAGEN
          </Link>
        </div>
        <div className="relative mx-[2px] mt-[48px] h-[220px] lg:mx-0 lg:ml-[5%] lg:mt-[108px] lg:h-[397px] lg:w-[85%]">
          <Image src="/images/saal.jpg" alt="Festlich gedeckte Tische im Saal" fill sizes="(min-width: 1024px) 43vw, 90vw" className="object-cover" />
        </div>
      </section>

      <section id="salettl" className="grid scroll-mt-[85px] lg:min-h-[562px] lg:scroll-mt-[94px] lg:grid-cols-2 lg:pb-12">
        <div className="relative mx-5 mt-5 h-[510px] lg:ml-[5%] lg:mr-[10%] lg:mt-[108px] lg:h-[397px]">
          <Image src="/images/salettl-desktop.jpg" alt="Das Salettl am Ufer der Geltnach" fill sizes="43vw" className="hidden object-cover lg:block" />
          <Image src="/images/salettl.jpg" alt="Das Salettl am Ufer der Geltnach" fill sizes="90vw" className="object-cover object-[50%_45%] lg:hidden" />
        </div>
        <div className="mt-[17px] px-[18px] pb-[83px] lg:mt-0 lg:px-0 lg:pb-0 lg:pl-[5%] lg:pr-[10%] lg:pt-[90px]">
          <SectionText title="Salettl">
            <p>
              Unser kleines Schmuckstück liegt idyllisch gleich hinter dem Haus, direkt am malerischen Ufer der Geltnach. Besonders Bräute lieben es, sich hier für einen besonderen Moment zu verstecken, während sie gespannt und voller Vorfreude auf die Befreiung durch ihre tapferen Gatten warten.
            </p>
            <p className="pr-2 lg:pr-0">
              Dieses charmante Plätzchen, das Ruhe und Romantik ausstrahlt, bietet den perfekten Rahmen für unvergessliche Augenblicke. Buchen Sie das wunderschöne Salettl gleich hier und freuen Sie sich auf einen unvergesslichen Abend in dieser einzigartigen Atmosphäre, der Ihnen und Ihren Gästen noch lange in Erinnerung bleiben wird.
            </p>
          </SectionText>
          <Link
            href="/salettl"
            className="mx-auto mt-8 flex h-[38px] w-[190px] items-center justify-center border border-ink text-[13px] text-ink transition-colors hover:bg-ink hover:text-cream"
          >
            SALETTL ANFRAGEN
          </Link>
        </div>
      </section>

      <section className="relative bg-wine text-cream lg:h-[957px]">
        <LocationSlider />
        <div className="relative px-4 pt-[31px] lg:absolute lg:left-[29px] lg:top-[242px] lg:w-[503px] lg:p-0">
          <h2 className="w-[300px] font-playfair text-[42px] leading-[42px] lg:w-[560px] lg:text-[68px] lg:leading-[68px]">
            ES KOMMT AUF <br className="hidden lg:inline" />
            DEN STANDORT <br className="hidden lg:inline" />
            AN
          </h2>
          <p className="mt-[15px] w-[300px] text-base leading-[20.8px] lg:mt-[25px] lg:w-[491px] lg:tracking-[0.16px] lg:text-[18px] lg:leading-[23.4px]">
            OB MAJESTÄTISCHE BERGE, GLITZERNDE SEEN ODER HISTORISCHE BURGEN UND SCHLÖSSER - DAS ALLGÄU HAT VIEL ZU BIETEN. BESONDERS DAS WELTBERÜHMTE SCHLOSS NEUSCHWANSTEIN, EIN HIGHLIGHT DER REGION, IST NUR GUT 25 MINUTEN ENTFERNT UND LÄDT ZU EINEM UNVERGESSLICHEN AUSFLUG IN DIE GESCHICHTE EIN.
          </p>
        </div>
        <div className="mt-[91px] px-4 pb-[60px] lg:absolute lg:left-[56%] lg:top-[173px] lg:m-0 lg:w-[38%] lg:p-0">
          <iframe
            src={MAP_URL}
            title="Karte: Königswirt, Schongauer Str. 13, 87616 Marktoberdorf"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[377px] w-full border-0 lg:h-[612px]"
          />
        </div>
      </section>
      <div className="h-[6px] bg-cream" />
    </>
  );
}
