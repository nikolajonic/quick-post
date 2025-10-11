import type { Collection } from "../components/Collections";

export const isExtension = window.location.protocol === "chrome-extension:";

export const getMatchingCollections = (
  collections: Collection[],
  url: string
) => {
  return collections.filter((c) =>
    c.requests?.some((r) => r.url.trim() === url.trim())
  );
};
