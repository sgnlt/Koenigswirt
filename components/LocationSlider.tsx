"use client";

import Image from "next/image";
import { useState } from "react";

const slides = ["/images/slide-1.png", "/images/slide-2.png"];

export default function LocationSlider() {
  const [index, setIndex] = useState(0);

  return (
    <div className="absolute left-[25%] top-[-6px] hidden h-[368px] w-[464px] lg:block">
      <div className="h-full overflow-hidden">
        <div className="flex h-full transition-transform duration-500" style={{ transform: `translateX(-${index * 464}px)` }}>
          {slides.map((src, i) => (
            <Image key={src} src={src} alt="" width={464} height={368} quality={90} aria-hidden={i !== index} className="h-[368px] w-[464px] shrink-0" />
          ))}
        </div>
      </div>
      <button
        type="button"
        aria-label={index === 0 ? "Next Item" : "Previous Item"}
        onClick={() => setIndex(index === 0 ? 1 : 0)}
        className={`absolute top-[159px] flex size-[50px] items-center justify-center rounded-full bg-white ${index === 0 ? "left-[391px]" : "left-[23px] rotate-180"}`}
      >
        <svg viewBox="0 0 12 21" aria-hidden="true" className="h-[21px] w-3" fill="none" stroke="#333" strokeWidth="1.2">
          <path d="M1 1l10 9.500L1 20" />
        </svg>
      </button>
    </div>
  );
}
