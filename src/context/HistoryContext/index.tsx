import React, { createContext, useContext, useEffect, useState } from "react";
import { isExtension } from "../../helpers";
import type { HistoryItem } from "../../types";

interface HistoryContextType {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

declare const chrome: any;

export const HistoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isExtension && chrome?.storage?.local) {
      chrome.storage.local.get("requestHistory", (res: any) => {
        if (res.requestHistory) setHistory(res.requestHistory);
        setLoaded(true);
      });
    } else {
      const saved = localStorage.getItem("requestHistory");
      if (saved) setHistory(JSON.parse(saved));
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (isExtension && chrome?.storage?.local)
      chrome.storage.local.set({ requestHistory: history });
    else localStorage.setItem("requestHistory", JSON.stringify(history));
  }, [history, loaded]);

  return (
    <HistoryContext.Provider value={{ history, setHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistoryData = () => {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistoryData must be inside HistoryProvider");
  return ctx;
};
