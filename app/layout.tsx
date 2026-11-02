import type { Metadata } from "next";
import {
  Fraunces,
  Playfair_Display,
  Wix_Madefor_Display,
  Wix_Madefor_Text,
} from "next/font/google";
import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces-var",
  subsets: ["latin"],
  axes: ["opsz"],
});

const madeforText = Wix_Madefor_Text({
  variable: "--font-madefor-text",
  subsets: ["latin"],
});

const madeforDisplay = Wix_Madefor_Display({
  variable: "--font-madefor-disp",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.koenigswirt.de"),
  title: "Königswirt",
  openGraph: { images: "/images/og.jpg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${playfair.variable} ${fraunces.variable} ${madeforText.variable} ${madeforDisplay.variable} antialiased`}
    >
      <body>
        <a
          href="#main"
          className="sr-only z-[60] bg-white p-2 focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
        >
          Weiter zum Hauptinhalt
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
