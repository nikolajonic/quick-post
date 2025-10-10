import { useState } from "react";
import type { FC } from "react";
import "./index.css";

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

const GlobalSettings: FC<GlobalSettingsProps> = ({
  settings,
  onSave,
  onBack,
}) => {
  const [url, setUrl] = useState(settings.baseUrl || "");
  const [authKey, setAuthKey] = useState(settings.auth?.key || "Authorization");
  const [token, setToken] = useState(settings.auth?.token || "");

  const handleSave = () => {
    onSave({
      baseUrl: url.trim(),
      auth: { key: authKey.trim(), token: token.trim() },
    });
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

      {/* Content */}
      <div className="settings-card">
        {/* Base URL */}
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

        {/* Auth */}
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
            <div className="row3">
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
              background: "#c26e0e",
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
    </div>
  );
};

export default GlobalSettings;
