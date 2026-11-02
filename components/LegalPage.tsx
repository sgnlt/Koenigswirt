import RichText from "@/components/RichText";

type Block = { k: string; text?: string };

const styles: Record<string, string> = {
  h1: "mb-10 font-playfair text-4xl leading-tight lg:text-[60px]",
  h2: "mb-4 mt-10 font-playfair text-2xl font-bold first:mt-0 lg:text-[28px]",
  h3: "mb-3 mt-8 font-playfair text-xl font-bold",
  h4: "mb-2 mt-6 font-playfair text-lg font-bold",
  h5: "mb-2 mt-5 font-bold",
  h6: "mb-2 mt-4 font-bold",
  p: "mb-4 whitespace-pre-line",
  li: "mb-2 ml-5 list-item list-disc",
};

export default function LegalPage({ blocks }: { blocks: Block[] }) {
  return (
    <article className="mx-auto max-w-[800px] break-words px-[18px] py-12 text-base leading-[1.6] lg:py-20">
      {blocks.map((block, i) => {
        const Tag = (/^h[1-6]$/.test(block.k) ? block.k : "div") as "div";
        return (
          <Tag key={i} className={styles[block.k] ?? styles.p}>
            <RichText text={block.text ?? ""} />
          </Tag>
        );
      })}
    </article>
  );
}
