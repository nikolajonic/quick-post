import { useEffect, useState } from "react";
import RequestForm from "./components/RequestForm";
import Collections, { type Collection } from "./components/Collections";
import History, { type HistoryItem } from "./components/History";
import "./App.css";
import "./styles/base.css";

const App = () => {
  const [activeTab, setActiveTab] = useState<"request" | "collections">(
    "request"
  );
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<HistoryItem | null>(null);

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("requestHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Load collections
  useEffect(() => {
    try {
      const saved = localStorage.getItem("collections");
      if (saved) setCollections(JSON.parse(saved));
    } catch {}
  }, []);

  // Sync collections
  useEffect(() => {
    localStorage.setItem("collections", JSON.stringify(collections));
  }, [collections]);

  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    localStorage.setItem("requestHistory", JSON.stringify(newHistory));
  };

  // CRUD for collections
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

  // Select from History
  const handleSelectHistoryItem = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setShowHistory(false);
    setActiveTab("request");
  };

  // Select from Collections (with headers & body)
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

  return (
    <div className="app">
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

        <button
          className="icon-btn"
          onClick={() => setShowHistory((s) => !s)}
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
      </div>

      {!showHistory && (
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
        ) : activeTab === "request" ? (
          <RequestForm
            history={history}
            setHistory={updateHistory}
            collections={collections}
            setCollections={setCollections}
            prefill={selectedHistoryItem}
            clearPrefill={() => setSelectedHistoryItem(null)}
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
