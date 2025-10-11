import React, { createContext, useContext, useEffect, useState } from "react";

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

export const GlobalSettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    baseUrl: "",
    auth: { key: "", token: "" },
  });

  useEffect(() => {
    const saved = localStorage.getItem("globalSettings");
    if (saved) setGlobalSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("globalSettings", JSON.stringify(globalSettings));
  }, [globalSettings]);

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
