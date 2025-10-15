import { useState } from "react";
import type { FC } from "react";
import "./index.css";
import { useCollections } from "../../context/CollectionsContext";
import { swaggerToCollection } from "../../helpers/swaggerToCollection";

export interface GlobalSettingsData {
  baseUrl: string;
  auth: { key: string; token: string };
}

interface GlobalSettingsProps {
  settings: GlobalSettingsData;
  onSave: (data: GlobalSettingsData) => void;
  onBack: () => void;
}

const AUTH_KEYS = [
  "Authorization",
  "x-auth-token",
  "x-api-key",
  "x-access-token",
  "x-client-key",
];

declare const chrome: any;

const GlobalSettings: FC<GlobalSettingsProps> = ({
  settings,
  onSave,
  onBack,
}) => {
  const [url, setUrl] = useState(settings.baseUrl || "");
  const [authKey, setAuthKey] = useState(settings.auth?.key || "Authorization");
  const [token, setToken] = useState(settings.auth?.token || "");

  const [swaggerJson, setSwaggerJson] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [error, setError] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const { collections, setCollections } = useCollections();

  const handleSave = () => {
    onSave({
      baseUrl: url.trim(),
      auth: { key: authKey.trim(), token: token.trim() },
    });
  };

  const handleSwaggerImport = () => {
    if (!collectionName.trim() || !swaggerJson.trim()) {
      setError(true);
      setShowTooltip("Please fill both fields");
      setTimeout(() => setShowTooltip(null), 2500);
      return;
    }

    try {
      const parsed = JSON.parse(swaggerJson);
      const newCollection = swaggerToCollection(parsed, collectionName.trim());
      const updated = [...collections, newCollection];
      setCollections(updated);

      const isExtension =
        typeof chrome !== "undefined" && !!chrome.storage?.local;

      if (isExtension) {
        chrome.storage.local.set({ collections: updated }, () => {
          console.log("Collections saved to Chrome storage");
        });
      } else {
        localStorage.setItem("collections", JSON.stringify(updated));
      }

      setShowTooltip(`Collection "${collectionName}" created from Swagger!`);
      setSwaggerJson("");
      setCollectionName("");
      setError(false);
      setTimeout(() => setShowTooltip(null), 2500);
    } catch {
      setShowTooltip("Invalid Swagger JSON");
      setError(true);
      setTimeout(() => setShowTooltip(null), 2500);
    }
  };

  return (
    <div className="global-settings-view">
      {/* Header */}
      <div className="settings-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h4>Global Settings</h4>
      </div>

      <div className="settings-card">
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 4,
              fontFamily: "monospace",
              fontSize: 16,
            }}
          >
            Base URL
          </label>
          <input
            type="text"
            placeholder="https://api.example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{
              width: "60%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #ddd",
              fontSize: 13,
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "block",
              fontWeight: 600,
              marginBottom: 4,
              fontFamily: "monospace",
              fontSize: 16,
            }}
          >
            Auth
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <div className="row3" style={{ display: "flex", gap: 8, flex: 1 }}>
              <select
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
              >
                {AUTH_KEYS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Enter token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: 13,
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSave}
            style={{
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <label
          style={{
            display: "block",
            fontWeight: 600,
            marginBottom: 8,
            fontFamily: "monospace",
            fontSize: 16,
          }}
        >
          Import from Swagger
        </label>

        <input
          type="text"
          placeholder="Enter collection name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          style={{
            width: "60%",
            padding: "8px",
            borderRadius: 6,
            border:
              error && !collectionName.trim()
                ? "1px solid #e74c3c"
                : "1px solid #ddd",
            fontSize: 13,
            marginBottom: 10,
          }}
        />
        <textarea
          placeholder="Paste Swagger JSON here..."
          value={swaggerJson}
          onChange={(e) => setSwaggerJson(e.target.value)}
          style={{
            display: "block",
            width: "calc(100%)",
            height: "160px",
            borderRadius: 6,
            padding: "8px",
            margin: "0 auto 10px auto",
            border:
              error && !swaggerJson.trim()
                ? "1px solid #e74c3c"
                : "1px solid #ddd",
            fontSize: 13,
            fontFamily: "monospace",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleSwaggerImport}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "6px 14px",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Create Collection
          </button>
        </div>

        {showTooltip && (
          <div
            className={
              showTooltip.includes("Invalid") || showTooltip.includes("❌")
                ? "tooltip-warning"
                : "tooltip-success"
            }
          >
            {showTooltip}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSettings;
