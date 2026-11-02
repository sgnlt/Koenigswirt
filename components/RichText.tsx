import Link from "next/link";

const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

// Renders the `[label](url)` markup used in content/*.json.
export default function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    parts.push(text.slice(last, match.index));
    const [, label, href] = match;
    parts.push(
      href.startsWith("/") ? (
        <Link key={match.index} href={href} className="underline">{label}</Link>
      ) : (
        <a key={match.index} href={href} className="underline">{label}</a>
      ),
    );
    last = match.index + match[0].length;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}
