import { useEffect, useState } from "react";
import ResponseViewer from "../ResponseViewer";
import HeaderTable from "./Headers/HeaderTable";
import BodyInput from "./BodyInput";
import type { HistoryItem } from "../History";
import type { Collection } from "../Collections";
import type { GlobalSettingsData } from "../GlobalSettings";
import "./index.css";
import { getMatchingCollection } from "../../helpers";

interface RequestFormProps {
  history: HistoryItem[];
  setHistory: (updated: HistoryItem[]) => void;
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  globalSettings: GlobalSettingsData; // ✅ new
  prefill?: HistoryItem | null;
  clearPrefill?: () => void;
}

declare const chrome: any;

const RequestForm = ({
  history,
  setHistory,
  collections,
  setCollections,
  globalSettings,
  prefill,
  clearPrefill,
}: RequestFormProps) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<{
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
  } | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  useEffect(() => {
    if (prefill) {
      setMethod(prefill.method);
      setUrl(prefill.url);
      setHeaders(prefill.headers || []);
      setBody(prefill.body || "");
      clearPrefill?.();
    }
  }, [prefill]);

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

    const isExtension = window.location.protocol === "chrome-extension:";
    if (isExtension && chrome?.storage?.local) {
      chrome.storage.local.set({ requestHistory: updated });
    } else {
      localStorage.setItem("requestHistory", JSON.stringify(updated));
    }
  };

  const handleSend = async () => {
    if (!url) return alert("Enter URL");

    const start = performance.now();

    // ✅ Find matching collection
    const matchingCollection = getMatchingCollection(collections, url);

    // ✅ Choose base URL (collection > global)
    const baseUrl =
      matchingCollection?.baseUrl?.trim() ||
      globalSettings.baseUrl?.trim() ||
      "";

    // ✅ Compute final URL
    const finalUrl =
      baseUrl && !/^https?:\/\//.test(url)
        ? `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
        : url;

    // ✅ Build headers
    const finalHeaders = headers.reduce((acc, { key, value, enabled }) => {
      if (key && enabled) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    // ✅ Choose auth (collection > global)
    const auth =
      matchingCollection?.auth?.token && matchingCollection?.auth?.key
        ? matchingCollection.auth
        : globalSettings.auth;

    if (auth?.key && auth?.token) {
      finalHeaders[auth.key] = auth.token;
    }

    const options: RequestInit = { method, headers: finalHeaders };
    if (!["GET", "DELETE"].includes(method)) options.body = body;

    try {
      const res = await fetch(finalUrl, options);
      const end = performance.now();
      const text = await res.text();

      let parsed: any;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }

      setResponse({
        raw: text,
        parsed,
        statusCode: res.status,
        statusText: res.statusText,
        timeMs: end - start,
        request: {
          method,
          url: finalUrl,
          headers: finalHeaders,
          body,
        },
      });
      setStatus(res.ok ? "success" : "error");
      saveHistory(
        method,
        finalUrl,
        res.ok ? "success" : "error",
        headers,
        body
      );
      setShowAddToCollection(true);
    } catch (err: any) {
      setResponse({
        raw: err.message,
        parsed: { error: err.message },
        timeMs: 0,
      });
      setStatus("error");
    }
  };

  const addToCollection = (collectionId: string) => {
    setCollections((prev) => {
      const updated = prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: [
                ...(c.requests || []),
                {
                  method,
                  url,
                  headers,
                  body,
                },
              ],
            }
          : c
      );

      const isExtension = window.location.protocol === "chrome-extension:";
      if (isExtension && chrome?.storage?.local) {
        chrome.storage.local.set({ collections: updated });
      } else {
        localStorage.setItem("collections", JSON.stringify(updated));
      }

      const col = updated.find((c) => c.id === collectionId);
      setShowTooltip(`Saved to "${col?.name}"`);
      setShowAddToCollection(false);
      setTimeout(() => setShowTooltip(null), 2500);

      return updated;
    });
  };

  return (
    <div>
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

      <HeaderTable headers={headers} setHeaders={setHeaders} />
      <BodyInput method={method} body={body} setBody={setBody} />
      <ResponseViewer data={response} status={status} />

      {showAddToCollection && collections.length > 0 && (
        <div className="add-to-collection">
          <span>Add to collection:</span>
          <select
            onChange={(e) => addToCollection(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>
              Select collection
            </option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showTooltip && <div className="tooltip-success">{showTooltip}</div>}
    </div>
  );
};

export default RequestForm;
