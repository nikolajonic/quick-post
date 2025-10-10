import { useState } from "react";
import "./index.css";

interface ResponseViewerProps {
  data: {
    raw: string;
    parsed: any;
    statusCode?: number;
    statusText?: string;
    timeMs?: number;
    request?: {
      method: string;
      url: string;
      headers?: Record<string, string>;
      body?: string;
    };
  } | null;
  status: "success" | "error" | null;
}

const ResponseViewer = ({ data, status }: ResponseViewerProps) => {
  const [tab, setTab] = useState<"response" | "request">("response");
  const [view, setView] = useState<"pretty" | "raw">("pretty");

  if (!data) return null;

  const className = `response ${status ?? ""}`;

  const prettyResponse =
    typeof data.parsed === "object"
      ? JSON.stringify(data.parsed, null, 2)
      : data.parsed;

  const displayResponse = view === "pretty" ? prettyResponse : data.raw;

  const prettyRequestBody =
    data.request?.body && isJsonString(data.request.body)
      ? JSON.stringify(JSON.parse(data.request.body), null, 2)
      : data.request?.body;

  return (
    <div className={className}>
      {/* Tabs (small, left aligned, minimal) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "10px",
          paddingLeft: "4px",
        }}
      >
        <button
          onClick={() => setTab("response")}
          style={getTabStyle(tab === "response")}
        >
          Response
        </button>

        {data.request && (
          <button
            onClick={() => setTab("request")}
            style={getTabStyle(tab === "request")}
          >
            Request
          </button>
        )}
      </div>

      {/* --- RESPONSE TAB --- */}
      {tab === "response" && (
        <>
          <div
            className="response-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <strong>Response</strong>
              {status === "success" ? (
                <span style={{ color: "#73ad53", fontWeight: 600 }}>
                  ✓ Success
                </span>
              ) : status === "error" ? (
                <span style={{ color: "#ad5c53", fontWeight: 600 }}>
                  ✗ Error
                </span>
              ) : null}

              {data.statusCode && (
                <span
                  style={{
                    color: "#c26e0e",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {data.statusCode} {data.statusText || ""}
                </span>
              )}

              {data.timeMs !== undefined && (
                <span style={{ color: "#888", fontSize: "12px" }}>
                  ⏱ {data.timeMs.toFixed(0)} ms
                </span>
              )}
            </div>

            <select
              value={view}
              onChange={(e) => setView(e.target.value as "pretty" | "raw")}
            >
              <option value="pretty">Pretty</option>
              <option value="raw">Raw</option>
            </select>
          </div>

          <pre>{displayResponse}</pre>
        </>
      )}

      {/* --- REQUEST TAB --- */}
      {tab === "request" && data.request && (
        <>
          <div
            className="response-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                minWidth: 0, // important for text overflow
              }}
            >
              <span
                style={{
                  color: "#c26e0e",
                  fontWeight: 600,
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {data.request.method}
              </span>

              {/* ✅ URL with tooltip on hover */}
              <span
                title={data.request.url}
                style={{
                  color: "#888",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "inline-block",
                  maxWidth: "420px", // limit visible length
                  cursor: "default",
                }}
              >
                {data.request.url}
              </span>
            </div>

            <select
              value={view}
              onChange={(e) => setView(e.target.value as "pretty" | "raw")}
            >
              <option value="pretty">Pretty</option>
              <option value="raw">Raw</option>
            </select>
          </div>

          <div style={{ marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", color: "#aaa" }}>Headers:</span>
            <pre>{JSON.stringify(data.request.headers || {}, null, 2)}</pre>
          </div>

          {data.request.body && (
            <div>
              <span style={{ fontSize: "12px", color: "#aaa" }}>Body:</span>
              <pre>{prettyRequestBody}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// --- helpers ---
const getTabStyle = (isActive: boolean) => ({
  background: "transparent",
  border: "none",
  padding: "4px 0",
  fontSize: "13px",
  fontWeight: 600,
  color: isActive ? "var(--primary)" : "#666",
  borderBottom: isActive ? "2px solid var(--primary)" : "2px solid transparent",
  cursor: "pointer",
  transition: "border-color 0.2s, color 0.2s",
});

const isJsonString = (str?: string) => {
  if (!str) return false;
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export default ResponseViewer;
