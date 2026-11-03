import { describe, expect, it } from "vitest";
import menu from "@/content/menu.json";
import { buildCatalog, type CatalogLine } from "./catalog";
import { isOrderingOpen, takeawayConfig, type TakeawayConfig } from "./config";
import { renderOrderEmail } from "./email";
import { isRateLimited, recordAttempt } from "./rate-limit";
import { filterMenuSections, type MenuSection } from "./search";
import { suggestPickupTime, validateOrder, type RawOrder } from "./validate";

const config: TakeawayConfig = {
  orderableItemIds: ["carpaccio-nach-art-des-hauses", "rumpsteak-cafe-de-paris"],
  // Monday 17:00–21:00. 2 Nov 2026 is a Monday.
  pickupWindows: [{ weekday: 1, from: "17:00", to: "21:00" }],
  leadTimeMinutes: 30,
  maxAdvanceDays: 14,
  minOrderCents: null,
  maxOrderCents: null,
  privacyNotice: "x",
  paymentNote: null,
  allergenNote: null,
};
const catalog = buildCatalog(config.orderableItemIds);
// 12:00 in Berlin (CET, UTC+1).
const now = new Date("2026-11-02T11:00:00Z");

const valid: RawOrder = {
  name: "Erika Mustermann",
  phone: "+49 170 1234567",
  pickup: "2026-11-02T18:00",
  items: JSON.stringify([{ key: "rumpsteak-cafe-de-paris/300g", quantity: 2 }]),
};

const run = (patch: Partial<RawOrder>, options: Partial<TakeawayConfig> = {}) =>
  validateOrder({ ...valid, ...patch }, { catalog, config: { ...config, ...options }, now });

function errors(patch: Partial<RawOrder>, options?: Partial<TakeawayConfig>) {
  const result = run(patch, options);
  if (result.ok) throw new Error("expected rejection");
  return result.fieldErrors;
}

describe("menu data", () => {
  const items = menu.sections.flatMap((section) => section.items);

  it("has unique item ids", () => {
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
  });

  it("has variant prices matching the displayed prices", () => {
    for (const item of items) {
      const shown = item.lines[item.lines.length - 1]
        .filter((cell) => cell.includes("€"))
        .map((cell) => Number(cell.replace(/\D/g, "")));
      const prices = new Set(item.variants.map((variant) => variant.priceCents));
      expect([...prices].sort(), item.id).toEqual([...new Set(shown)].sort());
    }
  });

  it("models multi-price items as selectable variants", () => {
    const keys = buildCatalog(["rumpsteak-cafe-de-paris"]).map((l: CatalogLine) => [l.key, l.priceCents]);
    expect(keys).toEqual([
      ["rumpsteak-cafe-de-paris/300g", 3490],
      ["rumpsteak-cafe-de-paris/250g", 2890],
    ]);
  });
});

describe("configuration", () => {
  it("keeps ordering off until the owner's facts are present", () => {
    expect(isOrderingOpen(config)).toBe(true);
    expect(isOrderingOpen({ ...config, orderableItemIds: [] })).toBe(false);
    expect(isOrderingOpen({ ...config, pickupWindows: [] })).toBe(false);
    expect(isOrderingOpen({ ...config, leadTimeMinutes: null })).toBe(false);
    expect(isOrderingOpen({ ...config, privacyNotice: null })).toBe(false);
  });

  it("references only menu items that exist", () => {
    const ids = new Set(menu.sections.flatMap((s) => s.items.map((item) => item.id)));
    for (const id of takeawayConfig.orderableItemIds) expect(ids.has(id), id).toBe(true);
  });
});

describe("validateOrder", () => {
  it("computes totals from the menu", () => {
    const result = run({});
    if (!result.ok) throw new Error("expected success");
    expect(result.order.totalCents).toBe(6980);
    expect(result.order.pickup.label).toBe("Montag, 02.11.2026, 18:00 Uhr");
  });

  it("ignores tampered names, prices and totals", () => {
    const result = run({
      items: JSON.stringify([
        { key: "rumpsteak-cafe-de-paris/300g", quantity: 1, priceCents: 1, name: "Hack", total: 1 },
      ]),
    });
    if (!result.ok) throw new Error("expected success");
    expect(result.order.totalCents).toBe(3490);
    expect(result.order.lines[0].item.name).toBe("Rumpsteak Café de Paris");
  });

  it.each([
    ["unknown item", [{ key: "nope/standard", quantity: 1 }]],
    ["known but non-orderable item", [{ key: "afogato/standard", quantity: 1 }]],
    ["zero quantity", [{ key: "rumpsteak-cafe-de-paris/300g", quantity: 0 }]],
    ["fractional quantity", [{ key: "rumpsteak-cafe-de-paris/300g", quantity: 1.5 }]],
    ["quantity over limit", [{ key: "rumpsteak-cafe-de-paris/300g", quantity: 21 }]],
    [
      "limit bypassed with duplicates",
      [
        { key: "rumpsteak-cafe-de-paris/300g", quantity: 15 },
        { key: "rumpsteak-cafe-de-paris/300g", quantity: 15 },
      ],
    ],
    ["empty cart", []],
  ])("rejects %s", (_label, items) => {
    expect(errors({ items: JSON.stringify(items) }).items).toBeTruthy();
  });

  it("rejects malformed cart payloads", () => {
    expect(errors({ items: "{not json" }).items).toBeTruthy();
    expect(errors({ items: null }).items).toBeTruthy();
    expect(errors({ items: "[null]" }).items).toBeTruthy();
  });

  it.each([
    ["past", "2026-11-02T11:00"],
    ["inside lead time", "2026-11-02T12:15"],
    ["outside the window hours", "2026-11-02T22:00"],
    ["outside the window weekday", "2026-11-03T18:00"],
    ["too far ahead", "2027-01-04T18:00"],
    ["impossible date", "2026-02-31T18:00"],
    ["garbage", "tomorrow"],
  ])("rejects pickup: %s", (_label, pickup) => {
    expect(errors({ pickup }).pickup).toBeTruthy();
  });

  it("accepts window boundaries", () => {
    expect(run({ pickup: "2026-11-02T17:00" }).ok).toBe(true);
    expect(run({ pickup: "2026-11-02T21:00" }).ok).toBe(true);
  });

  it("interprets times as Europe/Berlin in summer time", () => {
    // 15:30 UTC is 17:30 CEST on Monday 3 Aug 2026.
    const summer = new Date("2026-08-03T15:30:00Z");
    const check = (pickup: string) =>
      validateOrder({ ...valid, pickup }, { catalog, config, now: summer }).ok;
    expect(check("2026-08-03T17:45")).toBe(false);
    expect(check("2026-08-03T18:00")).toBe(true);
  });

  it.each([
    ["empty", ""],
    ["too short", "A"],
    ["too long", "A".repeat(101)],
    ["header injection", "Erika\r\nBcc: evil@example.com"],
    ["non-string", 5],
  ])("rejects name: %s", (_label, name) => {
    expect(errors({ name }).name).toBeTruthy();
  });

  it.each([
    ["empty", ""],
    ["letters", "call me"],
    ["too few digits", "12345"],
    ["too many digits", "1234567890123456"],
    ["line break", "0170\r\n1234567"],
  ])("rejects phone: %s", (_label, phone) => {
    expect(errors({ phone }).phone).toBeTruthy();
  });

  it("enforces order value limits when set", () => {
    expect(errors({}, { minOrderCents: 10000 }).items).toContain("Mindestbestellwert");
    expect(errors({}, { maxOrderCents: 100 }).items).toContain("maximale");
  });
});

describe("renderOrderEmail", () => {
  const order = (name: string) => {
    const result = run({ name });
    if (!result.ok) throw new Error("expected success");
    return renderOrderEmail(result.order);
  };

  it("contains the order details in German", () => {
    const email = order("Erika Mustermann");
    for (const part of [email.text, email.html]) {
      expect(part).toContain("Erika Mustermann");
      expect(part).toContain("+49 170 1234567");
      expect(part).toContain("Montag, 02.11.2026, 18:00 Uhr");
      expect(part).toContain("Rumpsteak Café de Paris (300g)");
      expect(part).toContain("69,80");
    }
  });

  it("escapes customer input and keeps it out of the subject", () => {
    const email = order('<img src=x onerror="a">');
    expect(email.html).not.toContain("<img");
    expect(email.html).toContain("&lt;img");
    expect(email.subject).not.toContain("img");
  });
});

describe("rate limit", () => {
  it("blocks after five orders and recovers after the window", () => {
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited("client", start)).toBe(false);
      recordAttempt("client", start);
    }
    expect(isRateLimited("client", start)).toBe(true);
    expect(isRateLimited("other", start)).toBe(false);
    expect(isRateLimited("client", start + 10 * 60_000)).toBe(false);
  });
});

describe("filterMenuSections", () => {
  const sections = menu.sections as MenuSection[];
  const ids = (filters: Parameters<typeof filterMenuSections>[1]) =>
    filterMenuSections(sections, filters).flatMap((s) => s.items.map((i) => i.id));

  it("matches by dish name, ingredient, and umlaut/ASCII variants", () => {
    expect(ids({ query: "Käsespätzle" })).toContain("allgaeuer-kaesespaetzle");
    expect(ids({ query: "kaesespaetzle" })).toContain("allgaeuer-kaesespaetzle");
    expect(ids({ query: "kasespatzle" })).toContain("allgaeuer-kaesespaetzle");
    expect(ids({ query: "cafe paris" })).toEqual(["rumpsteak-cafe-de-paris"]);
    expect(ids({ query: "Parmesan Pilze" })).toEqual(["carpaccio-nach-art-des-hauses"]);
  });

  it("filters by category and vegan flag", () => {
    expect(ids({ category: "Fisch" })).toEqual([
      "regenbogenforelle-muellerin-im-ganzen",
      "bertoldshofner-backfisch-vom-welsfilet",
    ]);
    expect(ids({ veganOnly: true })).toEqual([
      "asiatische-karotten-kokossuppe",
      "asiatisches-thai-curry",
      "gegrillte-krautkrapfen",
    ]);
  });
});

describe("suggestPickupTime", () => {
  it("suggests a valid pickup slot within the configured windows", () => {
    const suggested = suggestPickupTime(config, now);
    expect(suggested).toBe("2026-11-02T17:00");
    expect(run({ pickup: suggested }).ok).toBe(true);
  });
});
