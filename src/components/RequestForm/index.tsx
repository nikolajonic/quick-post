import { useState, useEffect } from "react";
import ResponseViewer from "../ResponseViewer";
import HeaderTable from "./Headers/HeaderTable";
import BodyInput from "./BodyInput";
import History from "../History";
import type { HistoryItem } from "../History";
import "./index.css";

const RequestForm = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<
    { key: string; value: string; enabled: boolean }[]
  >([{ key: "Content-Type", value: "application/json", enabled: true }]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<{ raw: string; parsed: any } | null>(
    null
  );
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("requestHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveHistory = (
    method: string,
    url: string,
    status: "success" | "error",
    headers: { key: string; value: string; enabled: boolean }[],
    body: string
  ) => {
    if (!url) return;
    const newItem = {
      method,
      url,
      headers,
      body,
      status,
      timestamp: new Date().toISOString(),
    };
    const updated = [newItem, ...history].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("requestHistory", JSON.stringify(updated));
  };

  const handleSend = async () => {
    if (!url) return alert("Enter URL");

    const options: RequestInit = {
      method,
      headers: headers.reduce((acc, { key, value, enabled }) => {
        if (key && enabled) acc[key] = value;
        return acc;
      }, {} as Record<string, string>),
    };

    if (!["GET", "DELETE"].includes(method)) options.body = body;

    try {
      const res = await fetch(url, options);
      const text = await res.text();

      setStatus(res.ok ? "success" : "error");

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      setResponse({ raw: text, parsed });
      saveHistory(method, url, res.ok ? "success" : "error", headers, body);
    } catch (err: any) {
      setResponse({
        raw: err.message,
        parsed: { error: err.message },
      });
      setStatus("error");
    }
  };

  if (showHistory) {
    return (
      <History
        history={history}
        onSelect={(item) => {
          setMethod(item.method);
          setUrl(item.url);
          setHeaders(item.headers ?? [{ key: "", value: "", enabled: true }]);
          setBody(item.body ?? "");
          setShowHistory(false);
        }}
        onBack={() => setShowHistory(false)}
      />
    );
  }

  return (
    <div className="request-form">
      {/* Toolbar header */}
      <div className="toolbar-header">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <img
            src="/icon128.png"
            alt="QuickPost logo"
            style={{
              height: "28px",
              width: "28px",
              objectFit: "contain",
            }}
          />
          <h3
            style={{
              margin: 0,
              color: "var(--primary)",
              fontWeight: 700,
              fontFamily: "monospace",
              fontSize: "18px",
            }}
          >
            QuickPost
          </h3>
        </div>

        <button
          className="icon-btn"
          onClick={() => setShowHistory(true)}
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

      {/* Request Bar */}
      <div className="row">
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <input
          placeholder="Enter request URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button onClick={handleSend}>Send</button>
      </div>

      {/* Headers + Body + Response */}
      <HeaderTable headers={headers} setHeaders={setHeaders} />
      <BodyInput method={method} body={body} setBody={setBody} />
      <ResponseViewer data={response} status={status} />
    </div>
  );
};

export default RequestForm;
