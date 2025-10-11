import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Collection } from "../../types";
import {
  loadCollections,
  persistCollections,
  updateCollectionAndPersist,
} from "../../helpers/storageHelpers";

interface CollectionsContextType {
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  toggleCollapse: (id: string) => void;
  updateCollection: (collection: Collection) => void;
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(
  undefined
);

export const CollectionsProvider = ({ children }: { children: ReactNode }) => {
  const [collections, setCollections] = useState<Collection[]>([]);

  // ✅ Load once on mount
  useEffect(() => {
    (async () => {
      const loaded = await loadCollections();
      setCollections(loaded);
    })();
  }, []);

  // ✅ Add new collection
  const addCollection = async (name: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      name,
      collapsed: false,
      requests: [],
    };
    const updated = [...collections, newCollection];
    await persistCollections(updated, setCollections);
  };

  // ✅ Remove collection
  const removeCollection = async (id: string) => {
    const updated = collections.filter((c) => c.id !== id);
    await persistCollections(updated, setCollections);
  };

  // ✅ Toggle collapse
  const toggleCollapse = async (id: string) => {
    const updated = collections.map((c) =>
      c.id === id ? { ...c, collapsed: !c.collapsed } : c
    );
    await persistCollections(updated, setCollections);
  };

  // ✅ Update collection (used by CurrentCollectionContext)
  const updateCollection = async (collection: Collection) => {
    await updateCollectionAndPersist(collection, collections, setCollections);
  };

  return (
    <CollectionsContext.Provider
      value={{
        collections,
        setCollections,
        addCollection,
        removeCollection,
        toggleCollapse,
        updateCollection,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollections = (): CollectionsContextType => {
  const ctx = useContext(CollectionsContext);
  if (!ctx)
    throw new Error("useCollections must be used inside CollectionsProvider");
  return ctx;
};
