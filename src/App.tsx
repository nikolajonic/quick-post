import { useEffect, useState } from "react";
import RequestForm from "./components/RequestForm";
import Collections, { type Collection } from "./components/Collections";
import History, { type HistoryItem } from "./components/History";
import GlobalSettings, {
  type GlobalSettingsData,
} from "./components/GlobalSettings";
import "./App.css";
import "./styles/base.css";
import { isExtension } from "./helpers";

declare const chrome: any;

const App = () => {
  const [activeTab, setActiveTab] = useState<"request" | "collections">(
    "request"
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettingsData>({
    baseUrl: "",
    auth: { key: "", token: "" },
  });

  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);

  const [loadedCollections, setLoadedCollections] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState(false);

  // ✅ Load Global Settings
  useEffect(() => {
    const saved = localStorage.getItem("globalSettings");
    if (saved) setGlobalSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("globalSettings", JSON.stringify(globalSettings));
  }, [globalSettings]);

  // ✅ Load History
  useEffect(() => {
    if (isExtension && chrome?.storage?.local) {
      chrome.storage.local.get(
        "requestHistory",
        (result: { requestHistory?: HistoryItem[] }) => {
          if (result.requestHistory) setHistory(result.requestHistory);
          setLoadedHistory(true);
        }
      );
    } else {
      const saved = localStorage.getItem("requestHistory");
      if (saved) setHistory(JSON.parse(saved));
      setLoadedHistory(true);
    }
  }, []);

  // ✅ Load Collections
  useEffect(() => {
    if (isExtension && chrome?.storage?.local) {
      chrome.storage.local.get(
        "collections",
        (result: { collections?: Collection[] }) => {
          if (result.collections) setCollections(result.collections);
          setLoadedCollections(true);
        }
      );
    } else {
      try {
        const saved = localStorage.getItem("collections");
        if (saved) setCollections(JSON.parse(saved));
      } catch {}
      setLoadedCollections(true);
    }
  }, []);

  // ✅ Sync Collections
  useEffect(() => {
    if (!loadedCollections) return;
    const isExt = window.location.protocol === "chrome-extension:";
    if (isExt && chrome?.storage?.local) {
      chrome.storage.local.set({ collections });
    } else {
      localStorage.setItem("collections", JSON.stringify(collections));
    }
  }, [collections, loadedCollections]);

  // ✅ Sync History
  useEffect(() => {
    if (!loadedHistory) return;
    const isExt = window.location.protocol === "chrome-extension:";
    if (isExt && chrome?.storage?.local) {
      chrome.storage.local.set({ requestHistory: history });
    } else {
      localStorage.setItem("requestHistory", JSON.stringify(history));
    }
  }, [history, loadedHistory]);

  // ✅ Collections CRUD
  const addCollection = (name: string) => {
    const newCol: Collection = {
      id: Date.now().toString(),
      name,
      collapsed: true,
      requests: [],
    };
    setCollections((prev) => [...prev, newCol]);
  };

  const removeCollection = (id: string) => {
    if (!confirm("Delete this collection?")) return;
    setCollections((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleCollapse = (id: string) => {
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, collapsed: !c.collapsed } : c))
    );
  };

  // ✅ Handlers
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setShowHistory(false);
    setActiveTab("request");
  };

  const handleSelectCollectionRequest = (req: {
    method: string;
    url: string;
    headers?: { key: string; value: string; enabled: boolean }[];
    body?: string;
  }) => {
    setSelectedHistoryItem({
      method: req.method,
      url: req.url,
      headers:
        req.headers && req.headers.length
          ? req.headers
          : [{ key: "Content-Type", value: "application/json", enabled: true }],
      body: req.body || "",
      status: "success",
      timestamp: new Date().toISOString(),
    });
    setActiveTab("request");
  };

  // ✅ Header UI
  const renderHeader = () => (
    <div className="toolbar-header">
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <img
          src="/icon128.png"
          alt="QuickPost logo"
          style={{ height: 28, width: 28 }}
        />
        <h3
          style={{
            margin: 0,
            color: "var(--primary)",
            fontWeight: 700,
            fontFamily: "monospace",
          }}
        >
          QuickPost
        </h3>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        {/* History Button */}
        <button
          className="icon-btn"
          onClick={() => {
            setShowHistory(true);
            setShowGlobalSettings(false);
          }}
          aria-label="View history"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="#c26e0e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>

        {/* Global Settings Button */}
        <button
          className="icon-btn"
          onClick={() => {
            setShowGlobalSettings(true);
            setShowHistory(false);
          }}
          aria-label="Global settings"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            stroke="#c26e0e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .67.39 1.28 1 1.51h.09a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </div>
  );

  // ✅ Main Render
  return (
    <div className="app">
      {renderHeader()}

      {/* Tabs only when not viewing History or Settings */}
      {!showHistory && !showGlobalSettings && (
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === "request" ? "active" : ""}`}
            onClick={() => setActiveTab("request")}
          >
            New Request
          </button>
          <button
            className={`tab-btn ${activeTab === "collections" ? "active" : ""}`}
            onClick={() => setActiveTab("collections")}
          >
            Collections
          </button>
        </div>
      )}

      <div className="tab-content">
        {showHistory ? (
          <History
            history={history}
            onSelect={handleSelectHistoryItem}
            onBack={() => setShowHistory(false)}
          />
        ) : showGlobalSettings ? (
          <GlobalSettings
            settings={globalSettings}
            onSave={(data) => {
              setGlobalSettings(data);
              setShowGlobalSettings(false);
            }}
            onBack={() => setShowGlobalSettings(false)}
          />
        ) : activeTab === "request" ? (
          <RequestForm
            history={history}
            setHistory={setHistory}
            collections={collections}
            setCollections={setCollections}
            prefill={selectedHistoryItem}
            clearPrefill={() => setSelectedHistoryItem(null)}
            globalSettings={globalSettings} // ✅ ADD THIS
          />
        ) : (
          <Collections
            collections={collections}
            setCollections={setCollections}
            addCollection={addCollection}
            removeCollection={removeCollection}
            toggleCollapse={toggleCollapse}
            onSelectRequest={handleSelectCollectionRequest}
          />
        )}
      </div>
    </div>
  );
};

export default App;
