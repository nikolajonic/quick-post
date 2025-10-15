import React, { createContext, useContext, useEffect, useState } from "react";
import { isExtension } from "../../helpers";

interface GlobalSettings {
  baseUrl: string;
  auth: { key: string; token: string };
}

interface GlobalSettingsContextType {
  globalSettings: GlobalSettings;
  setGlobalSettings: React.Dispatch<React.SetStateAction<GlobalSettings>>;
}

const GlobalSettingsContext = createContext<
  GlobalSettingsContextType | undefined
>(undefined);

declare const chrome: any;

export const GlobalSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    baseUrl: "",
    auth: { key: "", token: "" },
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isExtension && chrome?.storage?.local) {
      chrome.storage.local.get("globalSettings", (res: any) => {
        if (res.globalSettings) setGlobalSettings(res.globalSettings);
        setLoaded(true);
      });
    } else {
      const saved = localStorage.getItem("globalSettings");
      if (saved) setGlobalSettings(JSON.parse(saved));
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (isExtension && chrome?.storage?.local) {
      chrome.storage.local.set({ globalSettings });
    } else {
      localStorage.setItem("globalSettings", JSON.stringify(globalSettings));
    }
  }, [globalSettings, loaded]);

  return (
    <GlobalSettingsContext.Provider
      value={{ globalSettings, setGlobalSettings }}
    >
      {children}
    </GlobalSettingsContext.Provider>
  );
};

export const useGlobalSettings = () => {
  const ctx = useContext(GlobalSettingsContext);
  if (!ctx)
    throw new Error("useGlobalSettings must be inside GlobalSettingsProvider");
  return ctx;
};
