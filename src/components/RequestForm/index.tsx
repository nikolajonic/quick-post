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
  globalSettings: GlobalSettingsData;
  prefill?: HistoryItem | null;
  clearPrefill?: () => void;

  // 👇 new props
  currentRequest: {
    method: string;
    url: string;
    headers: { key: string; value: string; enabled: boolean }[];
    body: string;
  };
  setCurrentRequest: React.Dispatch<
    React.SetStateAction<{
      method: string;
      url: string;
      headers: { key: string; value: string; enabled: boolean }[];
      body: string;
    }>
  >;
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
  currentRequest,
  setCurrentRequest,
}: RequestFormProps) => {
  const { method, url, headers, body } = currentRequest;
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

  // ✅ Find matching collection
  const matchingCollection = getMatchingCollection(collections, url);

  // ✅ Choose base URL (collection > global)
  const baseUrl =
    matchingCollection?.baseUrl?.trim() || globalSettings.baseUrl?.trim() || "";

  useEffect(() => {
    if (prefill) {
      setCurrentRequest({
        method: prefill.method,
        url: prefill.url,
        headers: prefill.headers || [
          { key: "Content-Type", value: "application/json", enabled: true },
        ],
        body: prefill.body || "",
      });
      clearPrefill?.();
    }
  }, [prefill, setCurrentRequest, clearPrefill]);

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

    let normalizedBase = baseUrl.trim();

    // ✅ Always ensure baseUrl has protocol
    if (normalizedBase && !/^https?:\/\//i.test(normalizedBase)) {
      normalizedBase = `https://${normalizedBase}`;
    }

    let normalizedUrl = url.trim();

    // ✅ Always ensure url has protocol if baseUrl is empty
    if (
      !normalizedBase &&
      normalizedUrl &&
      !/^https?:\/\//i.test(normalizedUrl)
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // ✅ Compute final URL
    const finalUrl =
      normalizedBase && !/^https?:\/\//i.test(url)
        ? `${normalizedBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
        : normalizedUrl;

    const finalHeaders = headers.reduce((acc, { key, value, enabled }) => {
      if (key && enabled) acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const auth =
      matchingCollection?.auth?.token && matchingCollection?.auth?.key
        ? matchingCollection.auth
        : globalSettings.auth;

    if (auth?.key && auth?.token) {
      finalHeaders[auth.key] = auth.token;
    }

    const options: RequestInit = { method, headers: finalHeaders };
    if (!["GET", "DELETE"].includes(method)) options.body = body;

    const sendRequest = async (url: string, options: RequestInit) => {
      let normalizedHeaders: Record<string, string> = {};

      if (options.headers instanceof Headers) {
        normalizedHeaders = Object.fromEntries(options.headers.entries());
      } else if (Array.isArray(options.headers)) {
        normalizedHeaders = Object.fromEntries(options.headers);
      } else if (typeof options.headers === "object" && options.headers) {
        normalizedHeaders = { ...(options.headers as Record<string, string>) };
      }

      // Build serializable safe options
      const safeOptions = {
        method: options.method || "GET",
        headers: normalizedHeaders,
        body:
          typeof options.body === "object" && options.body !== null
            ? JSON.stringify(options.body)
            : (options.body as string | null) || null,
      };

      // Ensure Content-Type if we have a body
      if (safeOptions.body && !safeOptions.headers["Content-Type"]) {
        safeOptions.headers["Content-Type"] = "application/json";
      }

      return new Promise<{ ok: boolean; body: string; status: number }>(
        (resolve, reject) => {
          if (chrome?.runtime?.sendMessage) {
            console.log(
              "📤 About to send to background:",
              JSON.stringify(safeOptions, null, 2)
            );
            chrome.runtime.sendMessage(
              {
                type: "fetch",
                url,
                method: safeOptions.method,
                headers: safeOptions.headers,
                body: safeOptions.body,
              },
              (response: any) => {
                console.log("Popup sending request:", { url, safeOptions });
                if (chrome.runtime.lastError)
                  return reject(new Error(chrome.runtime.lastError.message));

                if (!response)
                  return reject(new Error("No response from background"));

                if (response.ok) resolve(response);
                else reject(new Error(response.error || "Unknown error"));
              }
            );
          } else {
            // Fallback for localhost dev
            fetch(url, safeOptions)
              .then(async (res) => {
                const text = await res.text();
                resolve({ ok: res.ok, body: text, status: res.status });
              })
              .catch(reject);
          }
        }
      );
    };

    try {
      const result: any = await sendRequest(finalUrl, options);
      const end = performance.now();

      let parsed: any;
      try {
        parsed = JSON.parse(result.body);
      } catch {
        parsed = result.body;
      }

      setResponse({
        raw: result.body,
        parsed,
        statusCode: result.status,
        statusText: result.statusText,
        timeMs: end - start,
        request: {
          method,
          url: finalUrl,
          headers: finalHeaders,
          body,
        },
      });

      setStatus(result.ok ? "success" : "error");
      saveHistory(
        method,
        finalUrl,
        result.ok ? "success" : "error",
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
      const updated = [...prev];
      const collectionIndex = updated.findIndex((c) => c.id === collectionId);

      if (collectionIndex === -1) return prev;

      const col = updated[collectionIndex];

      const exists = col.requests.some(
        (r) =>
          r.method.toLowerCase() === method.toLowerCase() &&
          r.url.trim() === url.trim()
      );

      if (exists) {
        setShowTooltip(`Request already exists in "${col.name}"`);

        setTimeout(() => setShowTooltip(null), 2500);
        return prev;
      }

      const newRequest = { method, url, headers, body };
      updated[collectionIndex] = {
        ...col,
        requests: [...(col.requests || []), newRequest],
      };

      const isExtension = window.location.protocol === "chrome-extension:";
      if (isExtension && chrome?.storage?.local) {
        chrome.storage.local.set({ collections: updated });
      } else {
        localStorage.setItem("collections", JSON.stringify(updated));
      }

      setShowTooltip(`Saved to "${col.name}"`);
      setShowAddToCollection(false);
      setTimeout(() => setShowTooltip(null), 2500);

      return updated;
    });
  };

  return (
    <div>
      <div className="row">
        <select
          value={method}
          onChange={(e) =>
            setCurrentRequest((prev) => ({ ...prev, method: e.target.value }))
          }
        >
          {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        {/* Show {baseURL} only if exists */}
        {baseUrl && (
          <div className="baseurl-tag" data-title={baseUrl}>
            {"{baseURL}"}
          </div>
        )}

        <input
          placeholder="Enter request URL"
          value={url}
          onChange={(e) =>
            setCurrentRequest((prev) => ({ ...prev, url: e.target.value }))
          }
        />

        <button onClick={handleSend}>Send</button>
      </div>

      <HeaderTable
        headers={headers}
        setHeaders={(newHeaders) =>
          setCurrentRequest((prev) => ({
            ...prev,
            headers:
              typeof newHeaders === "function"
                ? newHeaders(prev.headers)
                : newHeaders,
          }))
        }
      />

      <BodyInput
        method={method}
        body={body}
        setBody={(newBody) =>
          setCurrentRequest((prev) => ({
            ...prev,
            body: typeof newBody === "function" ? newBody(prev.body) : newBody,
          }))
        }
      />
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

      {showTooltip && (
        <div
          className={
            showTooltip.includes("exists")
              ? "tooltip-warning"
              : "tooltip-success"
          }
        >
          {showTooltip}
        </div>
      )}
    </div>
  );
};

export default RequestForm;
