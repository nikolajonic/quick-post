import { useState } from "react";
import RequestForm from "../components/RequestForm";
import Collections from "../components/Collections";
import History from "../components/History";
import GlobalSettings from "../components/GlobalSettings";
import { useCollections } from "../context/CollectionsContext";
import { useGlobalSettings } from "../context/GlobalSettingsContext";
import { useCurrentCollection } from "../context/CurrentCollectionContext";
import HistorySVG from "../components/svgs/history";
import SettingsSVG from "../components/svgs/settings";

import logo from "../assets/icon128.png";

import "../styles/base.css";

const Layout = () => {
  const [activeTab, setActiveTab] = useState<"request" | "collections">(
    "request"
  );
  const [showHistory, setShowHistory] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<any>(null);
  const [baseUrl, setBaseUrl] = useState("");

  // ✅ Get data from contexts only
  const { addCollection, removeCollection, toggleCollapse } = useCollections();
  const { globalSettings, setGlobalSettings } = useGlobalSettings();
  const { setCurrent } = useCurrentCollection();

  const handleSelectHistoryItem = (item: any) => {
    setSelectedHistoryItem(item);
    setShowHistory(false);
    setActiveTab("request");
  };

  const handleSelectCollectionRequest = (req: any, collection: any) => {
    setCurrent(collection);
    setSelectedHistoryItem({
      method: req.method,
      url: req.url,
      headers: req.headers ?? [
        { key: "Content-Type", value: "application/json", enabled: true },
      ],
      body: req.body ?? "",
      status: "success",
      timestamp: new Date().toISOString(),
      baseUrl: collection.baseUrl ?? "",
      collectionId: collection.id,
    });
    setActiveTab("request");
  };

  return (
    <div className="app">
      {/* Header */}
      <div className="toolbar-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src={logo}
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
          <button
            className="icon-btn"
            onClick={() => {
              setShowHistory(true);
              setShowGlobalSettings(false);
            }}
            title="View History"
          >
            <HistorySVG />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              setShowGlobalSettings(true);
              setShowHistory(false);
            }}
            title="Global Settings"
          >
            <SettingsSVG />
          </button>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Main content */}
      <div className="tab-content">
        {showHistory ? (
          <History
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
            prefill={selectedHistoryItem}
            clearPrefill={() => setSelectedHistoryItem(null)}
            globalSettings={globalSettings}
            baseUrl={baseUrl}
            setBaseUrl={setBaseUrl}
          />
        ) : (
          <Collections
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

export default Layout;
