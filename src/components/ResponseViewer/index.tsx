import { useState } from "react";
import "./index.css";
import { isJsonString } from "../../helpers";
import TypesPanel from "./components/TypesPanel";

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
  const [showTypes, setShowTypes] = useState(false);

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

  const canShowTypes =
    status === "success" &&
    data.parsed &&
    typeof data.parsed === "object" &&
    !Array.isArray(data.parsed);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        overflow: "hidden", // prevent parent scroll
      }}
    >
      {/* Tabs */}
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

          {/* Scrollable JSON content */}
          <pre
            style={{
              maxHeight: "50vh",
              overflowY: "auto",
              margin: 0,
              paddingRight: "8px",
            }}
          >
            {displayResponse}
          </pre>

          {/* Floating button and panel — OUTSIDE scroll area */}
          {canShowTypes && (
            <>
              <button
                style={{
                  position: "absolute",
                  right: "10px",
                  bottom: showTypes ? "60%" : "00px",
                  transform: showTypes ? "translateY(100%)" : "none",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderTopLeftRadius: "6px",
                  borderTopRightRadius: "6px",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "0 14px",
                  cursor: "pointer",
                  height: "22px",
                  boxShadow: "0 0 4px rgba(0,0,0,0.25)",
                  zIndex: 999,
                  opacity: 1,
                  transition: "bottom 0.25s ease, transform 0.20s ease",
                }}
                onClick={() => setShowTypes(!showTypes)}
              >
                TYPES
              </button>

              <TypesPanel
                visible={showTypes}
                onClose={() => setShowTypes(false)}
                data={data.parsed}
              />
            </>
          )}
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
                minWidth: 0,
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
                  maxWidth: "420px",
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

export default ResponseViewer;
