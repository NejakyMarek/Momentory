export type AlbumVariant = "cheap" | "basic" | "premium" | "ultra";
export type PageCount = 9 | 16 | 24;

export const VARIANT_LABEL: Record<AlbumVariant, string> = {
  cheap: "Cheap look",
  basic: "Basic look",
  premium: "Prémiový look",
  ultra: "Ultra (Collector)",
};

export const PAGES: PageCount[] = [9, 16, 24];

// ceny v centoch
const PRICE_TABLE: Record<AlbumVariant, Record<PageCount, number>> = {
  cheap:   { 9: 1900, 16: 2900, 24: 3900 },
  basic:   { 9: 3900, 16: 5900, 24: 7900 },
  premium: { 9: 7900, 16: 11900, 24: 15900 },
  ultra:   { 9: 39900, 16: 59900, 24: 79900 },
};

export function priceOf(v: AlbumVariant, p: PageCount) {
  return PRICE_TABLE[v][p];
}

export function variantOptions() {
  return (Object.keys(VARIANT_LABEL) as AlbumVariant[]).map(v => ({
    value: v, label: VARIANT_LABEL[v]
  }));
}
