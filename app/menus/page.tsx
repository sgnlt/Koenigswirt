import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";
import menu from "@/content/menu.json";

export const metadata: Metadata = { title: "Speisekarten (Neu) | Königswirt" };

type Item = { name: string; lines: string[][]; vegan?: boolean };

function Line({ cells }: { cells: string[] }) {
  if (cells.length === 1) return <p className="mt-3 whitespace-pre-line first:mt-3">{cells[0]}</p>;
  const pairs: string[][] = [];
  for (let i = 0; i < cells.length; i += 2) pairs.push(cells.slice(i, i + 2));
  return (
    <p className="mt-3 flex justify-center divide-x divide-ink/30">
      {pairs.map((pair) => (
        <span key={pair.join()} className="px-3">{pair.join(" ")}</span>
      ))}
    </p>
  );
}

function Dish({ item }: { item: Item }) {
  const [price, ...rest] = [...item.lines].reverse();
  return (
    <div className="mt-[23px]">
      <h3 className="font-playfair text-xl leading-[25px]">{item.name}</h3>
      {[...rest].reverse().map((cells) => <Line key={cells.join()} cells={cells} />)}
      {item.vegan && (
        <p className="mt-3 flex items-center justify-center gap-1 text-xs">
          <Image src="/images/vegan.svg" alt="" width={16} height={16} /> Vegan
        </p>
      )}
      {price && <Line cells={price} />}
    </div>
  );
}

export default function MenusPage() {
  return (
    <div className="mx-auto max-w-[832px] px-4 pb-10 text-center leading-5">
      <Image src="/images/logo-gross.png" alt="Königswirt" width={327} height={218} className="mx-auto aspect-[3/2] w-[327px] object-cover" preload />
      <h1 className="font-playfair text-[40px] leading-[52px]">Herzlich Willkommen</h1>
      <p className="mt-[25px] font-playfair text-[18px] leading-[23px]">Historischer Landgasthof im Allgäu</p>
      {menu.sections.map((section) => (
        <Fragment key={section.title}>
          <hr className="mt-[30px] border-ink/30 first-of-type:mt-[58px]" />
          <section className="mt-[30px]">
            <h2 className="text-[18px] leading-[22px]">{section.title}</h2>
            {(section.items as Item[]).map((item) => <Dish key={item.name} item={item} />)}
          </section>
        </Fragment>
      ))}
      <p className="mt-16 font-playfair text-[36px] leading-[47px]">An Guadn!</p>
      <p className="mt-3 font-playfair text-[18px] leading-[23px]">Wünscht euch das Königswirt Team</p>
      <Image src="/images/og.jpg" alt="Königswirt" width={327} height={218} className="mx-auto mt-10 aspect-[3/2] w-[327px] object-cover" />
    </div>
  );
}
