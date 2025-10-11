import { useEffect, useState } from "react";
import ResponseViewer from "../ResponseViewer";
import HeaderTable from "./Headers/HeaderTable";
import BodyInput from "./BodyInput";
import "./index.css";

import { useCollections } from "../../context/CollectionsContext";
import { useHistoryData } from "../../context/HistoryContext";
import { useCurrentCollection } from "../../context/CurrentCollectionContext";

import {
  prefillRequest,
  sendRequest,
  saveToHistory,
  addRequestToCollection,
} from "../../helpers/requestHelpers";

import type { GlobalSettingsData } from "../GlobalSettings";
import type { HistoryItem } from "../../types";

interface RequestFormProps {
  globalSettings: GlobalSettingsData;
  prefill?: HistoryItem | null;
  clearPrefill?: () => void;
  baseUrl: string;
  setBaseUrl: React.Dispatch<React.SetStateAction<string>>;
}

const RequestForm = ({
  globalSettings,
  prefill,
  clearPrefill,
  baseUrl,
  setBaseUrl,
}: RequestFormProps) => {
  const { collections, setCollections } = useCollections();
  const { history, setHistory } = useHistoryData();
  const { currentRequest, setCurrentRequest } = useCurrentCollection();

  const { method, url, headers, body } = currentRequest;

  const [response, setResponse] = useState<any>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [showAddToCollection, setShowAddToCollection] = useState(false);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // ✅ Prefill request from history
  useEffect(() => {
    if (!prefill) return;
    const { currentRequest: filledReq, baseUrl: filledBase } = prefillRequest(
      prefill,
      globalSettings.baseUrl || ""
    );
    setCurrentRequest(filledReq);
    setBaseUrl(filledBase);
  }, [prefill, globalSettings.baseUrl, setBaseUrl, setCurrentRequest]);

  // ✅ Send API request
  const handleSend = async () => {
    if (!url.trim()) return alert("Enter URL");

    try {
      const result = await sendRequest(
        baseUrl || globalSettings.baseUrl || "",
        url,
        method,
        headers,
        body,
        collections,
        globalSettings.auth,
        prefill
      );

      setResponse(result);
      setStatus(result.ok ? "success" : "error");

      saveToHistory(history, setHistory, {
        method,
        url: result.request.url,
        headers,
        body,
        status: result.ok ? "success" : "error",
      });

      setShowAddToCollection(true);
      clearPrefill?.();
    } catch (err: any) {
      setResponse({
        raw: err.message,
        parsed: { error: err.message },
        timeMs: 0,
      });
      setStatus("error");
      clearPrefill?.();
    }
  };

  return (
    <div>
      {/* 🟦 Method + URL bar */}
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

        {baseUrl && (
          <div
            className="baseurl-tag"
            data-title={baseUrl}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "#79c8fdff",
              borderRadius: "4px",
              padding: "2px 6px",
              color: "#304ca8ff",
              fontSize: "12px",
            }}
          >
            <span>{"{baseURL}"}</span>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#eb8181ff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "14px",
                padding: 0,
              }}
              title="Detach baseURL"
              onClick={() => {
                const finalUrl =
                  url.startsWith("http") || url.startsWith("/")
                    ? url
                    : `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;

                setCurrentRequest((prev) => ({
                  ...prev,
                  url: finalUrl,
                }));
                setBaseUrl("");
              }}
            >
              ×
            </button>
          </div>
        )}

        <input
          placeholder="Enter request URL"
          value={url}
          onChange={(e) =>
            setCurrentRequest((prev) => ({ ...prev, url: e.target.value }))
          }
        />

        <button className="send-btn" onClick={handleSend}>
          Send
        </button>
      </div>

      {/* 🟩 Headers Table */}
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

      {/* 🟨 Request Body */}
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

      {/* 🟪 Response Viewer */}
      <ResponseViewer data={response} status={status} />

      {/* 🟧 Add to Collection */}
      {showAddToCollection && collections.length > 0 && (
        <div className="add-to-collection">
          <span>Add to collection:</span>
          <select
            onChange={(e) =>
              addRequestToCollection(
                collections,
                setCollections,
                method,
                url,
                headers,
                body,
                e.target.value,
                setShowTooltip,
                setShowAddToCollection
              )
            }
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

      {/* 🟫 Tooltip */}
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
