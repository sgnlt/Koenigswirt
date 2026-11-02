import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import RichText from "@/components/RichText";
import posts from "@/content/posts.json";

type Props = { params: Promise<{ slug: string }> };

type Block = {
  k: string;
  text?: string;
  src?: string;
  alt?: string;
  w?: number;
  h?: number;
  bold?: boolean;
  accent?: boolean;
};

// Consecutive narrow images sit side by side, as on the live post.
function groupImages(blocks: Block[]) {
  const groups: (Block | Block[])[] = [];
  for (const block of blocks) {
    if (block.k !== "img" && !block.text?.trim()) continue;
    const last = groups.at(-1);
    if (block.k === "img" && block.w! < 740) {
      if (Array.isArray(last)) last.push(block);
      else groups.push([block]);
    } else {
      groups.push(block);
    }
  }
  return groups;
}

async function findPost(params: Props["params"]) {
  const { slug } = await params;
  return posts.find((post) => post.slug === decodeURIComponent(slug).normalize("NFC"));
}

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await findPost(params);
  return { title: post?.title };
}

export default async function PostPage({ params }: Props) {
  const post = await findPost(params);
  if (!post) notFound();
  const recent = posts.filter((other) => other.slug !== post.slug);

  return (
    <div className="px-4 pb-10">
      <Link href="/presse" className="block py-5 text-sm lg:ml-[92px]">Alle Beiträge</Link>
      <article className="mx-auto max-w-[942px] border border-ink/20 px-5 py-10 lg:mt-5 lg:px-[100px] lg:py-[72px]">
        <p className="text-sm">
          {post.author} · {post.date} · {post.readTime}
        </p>
        <h1 className="mb-[47px] mt-6 font-fraunces font-light [font-variation-settings:'opsz'_144] text-[32px] leading-tight lg:text-[40px] lg:leading-[56px]">{post.title}</h1>
        {groupImages(post.body as Block[]).map((group, i) =>
          Array.isArray(group) ? (
            <div key={i} className="flex flex-col gap-[5px] sm:flex-row">
              {group.map((block) => (
                <Image
                  key={block.src}
                  src={block.src!}
                  alt={block.alt ?? ""}
                  width={block.w!}
                  height={block.h!}
                  sizes="(min-width: 640px) 400px, 100vw"
                  className="h-auto min-w-0 object-cover sm:h-[382px]"
                  style={{ flex: `${block.w} 1 0` }}
                />
              ))}
            </div>
          ) : group.k === "img" ? (
            <Image key={i} src={group.src!} alt={group.alt ?? ""} width={group.w!} height={group.h!} sizes="(min-width: 1024px) 740px, 100vw" className="h-auto w-full" />
          ) : group.k === "caption" ? (
            <p key={i} className="py-5 text-center text-sm">{group.text}</p>
          ) : (
            <p key={i} className={`whitespace-pre-line text-[18px] leading-[27px] ${group.bold ? "font-bold" : ""} ${group.accent ? "text-center text-accent" : ""}`}>
              <RichText text={group.text ?? ""} />
            </p>
          ),
        )}
        <div className="mt-12 flex items-center gap-[22px] border-t border-ink/20 pt-5 text-sm">
          <span>{post.views}</span>
          <span>{post.comments}</span>
          {post.likes && <span className="ml-auto">{post.likes} ♡</span>}
        </div>
      </article>

      <section className="mx-auto mt-8 max-w-[940px]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[18px]">Aktuelle Beiträge</h2>
          <Link href="/presse" className="text-sm">Alle ansehen</Link>
        </div>
        <div className="mt-5 grid gap-9 md:grid-cols-3">
          {recent.map((other) => (
            <article key={other.slug} className="border border-ink/20">
              <Image src={other.image} alt={other.title} width={289} height={162} className="aspect-[16/9] w-full object-cover" />
              <div className="p-6">
                <h3 className="min-h-[46px] font-fraunces font-light [font-variation-settings:'opsz'_144] text-[18px] leading-[23px]">
                  <Link href={`/post/${other.slug}`}>{other.title}</Link>
                </h3>
                <p className="mt-9 flex gap-4 border-t border-ink/20 pt-4 text-xs">
                  <span>{other.cardViews}</span>
                  <span>{other.cardComments}</span>
                  {other.likes && <span className="ml-auto">{other.likes} ♡</span>}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
