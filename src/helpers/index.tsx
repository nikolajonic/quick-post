import type { Collection } from "../components/Collections";

export const isExtension = window.location.protocol === "chrome-extension:";

export const getMatchingCollection = (
  collections: Collection[],
  url: string
): Collection | undefined => {
  return collections.find((col) => col.requests.some((r) => r.url === url));
};
