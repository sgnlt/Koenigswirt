import menu from "@/content/menu.json";

export type CatalogLine = {
  /** Stable cart key: `itemId/variantId`. */
  key: string;
  itemId: string;
  name: string;
  variantLabel: string | null;
  priceCents: number;
};

type MenuItem = {
  id: string;
  name: string;
  variants: { id: string; label: string | null; priceCents: number }[];
};

const allLines: CatalogLine[] = menu.sections.flatMap((section) =>
  (section.items as MenuItem[]).flatMap((item) =>
    item.variants.map((variant) => ({
      key: `${item.id}/${variant.id}`,
      itemId: item.id,
      name: item.name,
      variantLabel: variant.label,
      priceCents: variant.priceCents,
    })),
  ),
);

export function buildCatalog(orderableItemIds: string[]): CatalogLine[] {
  const orderable = new Set(orderableItemIds);
  return allLines.filter((line) => orderable.has(line.itemId));
}
