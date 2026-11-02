import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Special Menu | Königswirt" };

export default function SpecialMenuPage() {
  return (
    <div className="px-4 pb-[38px] pt-[33px]">
      <Image src="/images/fondue.png" alt="Königliches Fondue" width={380} height={492} quality={90} className="mx-auto aspect-[379/492] w-[379px] max-w-full object-cover" preload />
    </div>
  );
}
