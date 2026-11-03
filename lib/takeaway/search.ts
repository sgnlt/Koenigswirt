export type MenuVariant = {
  id: string;
  label: string | null;
  priceCents: number;
};

export type MenuItem = {
  id: string;
  name: string;
  lines: string[][];
  vegan?: boolean;
  variants: MenuVariant[];
};

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export type MenuFilters = {
  query?: string;
  category?: string | null;
  veganOnly?: boolean;
};

function foldText(input: string): string {
  return input
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function expandGerman(input: string): string {
  return input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesDish(item: MenuItem, sectionTitle: string, rawQuery: string): boolean {
  const trimmed = rawQuery.trim();
  if (!trimmed) return true;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const haystackRaw = [
    item.name,
    sectionTitle,
    ...item.lines.flat(),
    ...item.variants.map((variant) => variant.label ?? ""),
    item.vegan ? "vegan pflanzlich" : "",
  ].join(" ");

  const foldedHaystack = foldText(haystackRaw);
  const expandedHaystack = expandGerman(haystackRaw);

  return tokens.every((token) => {
    const foldedToken = foldText(token);
    const expandedToken = expandGerman(token);
    return (
      foldedHaystack.includes(foldedToken) ||
      expandedHaystack.includes(expandedToken) ||
      expandedHaystack.includes(foldedToken) ||
      foldedHaystack.includes(expandedToken)
    );
  });
}

export function filterMenuSections(sections: MenuSection[], filters: MenuFilters): MenuSection[] {
  const { query = "", category = null, veganOnly = false } = filters;

  return sections
    .filter((section) => !category || section.title === category)
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (veganOnly && !item.vegan) return false;
        return matchesDish(item, section.title, query);
      }),
    }))
    .filter((section) => section.items.length > 0);
}
