import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import posts from "@/content/posts.json";

export const metadata: Metadata = { title: "PRESSE | Königswirt" };

export default function PressePage() {
  return (
    <div className="px-4 pt-8 lg:px-0">
      <h1 className="font-playfair text-[45px] leading-[58px] lg:ml-[98px]">Presse</h1>
      <div className="mx-auto mt-5 max-w-[1100px] space-y-[30px]">
        {posts.map((post) => (
          <article key={post.slug} className="grid border border-ink/20 lg:grid-cols-[534px_1fr]">
            <Image src={post.image} alt={post.title} width={534} height={401} className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-col px-[35px] pb-6 pt-[34px] font-madefor-display">
              <p className="text-xs">{post.date}</p>
              <h2 className="mt-[22px] text-[28px] leading-[35px]">
                <Link href={`/post/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="mt-3 leading-6">{post.excerpt}</p>
              <p className="mt-auto flex items-center gap-1 pt-6 text-xs" aria-label={post.likesLabel}>
                {post.likes}
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] text-red-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 20s-7.500-4.600-9-9.200C2 7.300 4.300 5 7 5c2 0 3.700 1.100 5 3 1.300-1.900 3-3 5-3 2.700 0 5 2.300 4 5.800-1.500 4.600-9 9.200-9 9.200z" />
                </svg>
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
