import type { Collection } from "../types";

export const isExtension = window.location.protocol === "chrome-extension:";

export const getMatchingCollections = (
  collections: Collection[],
  url: string
) => {
  return collections.filter((c) =>
    c.requests?.some((r: any) => r.url.trim() === url.trim())
  );
};

export const isJsonString = (str?: string) => {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};
