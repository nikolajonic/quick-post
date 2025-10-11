import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useCollections } from "../CollectionsContext";
import type { Collection } from "../../types";

/** Represents one editable API request */
export interface RequestDraft {
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  body: string;
}

interface CurrentCollectionContextType {
  current: Collection | null;
  setCurrent: (collection: Collection | null) => void;

  updateCurrentSettings: (updates: Partial<Collection>) => void;

  currentRequest: RequestDraft;
  setCurrentRequest: React.Dispatch<React.SetStateAction<RequestDraft>>;

  resetCurrent: () => void;
}

const CurrentCollectionContext = createContext<
  CurrentCollectionContextType | undefined
>(undefined);

export const CurrentCollectionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { collections, updateCollection } = useCollections();
  const [current, setCurrent] = useState<Collection | null>(null);

  const [currentRequest, setCurrentRequest] = useState<RequestDraft>({
    method: "GET",
    url: "",
    headers: [
      { key: "Content-Type", value: "application/json", enabled: true },
    ],
    body: "",
  });

  useEffect(() => {
    const savedId = localStorage.getItem("currentCollectionId");
    if (savedId && collections.length > 0) {
      const found = collections.find((c) => c.id === savedId);
      if (found) setCurrent(found);
    }
  }, [collections]);

  useEffect(() => {
    if (current) {
      localStorage.setItem("currentCollectionId", current.id);
    } else {
      localStorage.removeItem("currentCollectionId");
    }
  }, [current]);

  const updateCurrentSettings = (updates: Partial<Collection>) => {
    if (!current) return;
    const updated = { ...current, ...updates };
    setCurrent(updated);
    updateCollection(updated);
  };

  const resetCurrent = () => {
    setCurrent(null);
    setCurrentRequest({
      method: "GET",
      url: "",
      headers: [
        { key: "Content-Type", value: "application/json", enabled: true },
      ],
      body: "",
    });
    localStorage.removeItem("currentCollectionId");
  };

  return (
    <CurrentCollectionContext.Provider
      value={{
        current,
        setCurrent,
        updateCurrentSettings,
        currentRequest,
        setCurrentRequest,
        resetCurrent,
      }}
    >
      {children}
    </CurrentCollectionContext.Provider>
  );
};

export const useCurrentCollection = (): CurrentCollectionContextType => {
  const ctx = useContext(CurrentCollectionContext);
  if (!ctx)
    throw new Error(
      "useCurrentCollection must be used inside CurrentCollectionProvider"
    );
  return ctx;
};
