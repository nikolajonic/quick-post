import type { Collection } from "../types";

declare const chrome: any;

/**
 * Persist collections both locally and to Chrome (if available)
 */
export async function persistCollections(
  collections: Collection[],
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>
) {
  try {
    //  Update React Context state first
    setCollections(collections);

    // Then persist locally
    const isExtension = window.location.protocol === "chrome-extension:";
    if (isExtension && typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ collections });
    } else {
      localStorage.setItem("collections", JSON.stringify(collections));
    }
  } catch (err) {
    console.error("Error persisting collections:", err);
  }
}

/**
 * Load collections from local or Chrome storage
 */
export async function loadCollections(): Promise<Collection[]> {
  try {
    const isExtension = window.location.protocol === "chrome-extension:";
    if (isExtension && typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await new Promise<{ collections?: Collection[] }>(
        (resolve) => chrome.storage.local.get(["collections"], resolve)
      );
      return result.collections || [];
    }

    const stored = localStorage.getItem("collections");
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.error("Error loading collections:", err);
    return [];
  }
}

/**
 * Helper to safely update a single collection and persist the result.
 */
export async function updateCollectionAndPersist(
  updatedCollection: Collection,
  collections: Collection[],
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>
) {
  const updated = collections.map((c) =>
    c.id === updatedCollection.id ? updatedCollection : c
  );
  await persistCollections(updated, setCollections);
  return updated;
}
