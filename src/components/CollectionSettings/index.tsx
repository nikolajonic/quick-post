import { useState, useEffect } from "react";

interface Props {
  id: string;
  baseUrl?: string;
  auth?: { key: string; token: string };
  onSave: (
    id: string,
    data: { baseUrl: string; auth: { key: string; token: string } }
  ) => void;
}

const AUTH_KEYS = [
  "Authorization",
  "x-auth-token",
  "x-api-key",
  "x-access-token",
  "x-client-key",
];

const CollectionSettings = ({ id, baseUrl = "", auth, onSave }: Props) => {
  const [url, setUrl] = useState(baseUrl);
  const [authKey, setAuthKey] = useState(auth?.key || "Authorization");
  const [token, setToken] = useState(auth?.token || "");

  useEffect(() => {
    setUrl(baseUrl);
    setAuthKey(auth?.key || "Authorization");
    setToken(auth?.token || "");
  }, [baseUrl, auth]);

  return (
    <div
      style={{
        background: "var(--primary-lightest)",
        border: "1px solid var(--primary-light)",
        borderRadius: 8,
        padding: "10px 12px",
        marginTop: 8,
        marginBottom: 10,
      }}
    >
      <div style={{ marginBottom: 10 }}>
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
            width: "50%",
            padding: "8px",
            borderRadius: 6,
            border: "1px solid #ddd",
            fontSize: 13,
          }}
        />
      </div>

      <div>
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
            />
          </div>
        </div>
      </div>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}
      >
        <button
          onClick={() =>
            onSave(id, { baseUrl: url, auth: { key: authKey, token } })
          }
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
  );
};

export default CollectionSettings;
