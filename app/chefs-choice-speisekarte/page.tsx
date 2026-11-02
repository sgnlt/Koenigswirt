import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Chefs Choice Around The World | Königswirt" };

export default function ChefsChoicePage() {
  return (
    <div className="px-4 pb-[57px] pt-[2px] lg:pl-[528px] lg:pr-0">
      <Image src="/images/chefs-choice.jpg" alt="Chefs Choice Speisekarte" width={767} height={1347} quality={90} preload className="aspect-[767/1347] w-full max-w-[767px] object-cover" />
    </div>
  );
}
