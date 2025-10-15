import { useEffect, useState, useRef } from "react";
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

  // 🧠 Keep prefill + collection info stable
  const prefillRef = useRef(prefill);
  const fromCollectionRef = useRef(false);

  useEffect(() => {
    prefillRef.current = prefill;
  }, [prefill]);

  useEffect(() => {
    if (!prefill) return;
    const { currentRequest: filledReq, baseUrl: filledBase } = prefillRequest(
      prefill,
      globalSettings.baseUrl || ""
    );

    setCurrentRequest(filledReq);
    setBaseUrl(filledBase);

    // 🟢 Persist "fromCollection" across rerenders
    fromCollectionRef.current = !!prefill.collectionId;
  }, [prefill, globalSettings.baseUrl, setBaseUrl, setCurrentRequest]);

  const handleSend = async () => {
    let updatedHeaders = [...headers];

    const fromCollection = fromCollectionRef.current;

    console.log("fromCollection:", fromCollection);

    if (!fromCollection) {
      updatedHeaders.push({
        key: globalSettings.auth.key,
        value: globalSettings.auth.token,
        enabled: true,
      });
    }

    updatedHeaders = updatedHeaders.filter((h) => h.enabled === true);

    try {
      const result = await sendRequest(
        baseUrl || globalSettings.baseUrl || "",
        url,
        method,
        updatedHeaders,
        body
      );

      setResponse(result);
      setStatus(result.ok ? "success" : "error");

      saveToHistory(history, setHistory, {
        method,
        url: result.request.url,
        headers: updatedHeaders,
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

  const handleDetachBaseUrl = () => {
    fromCollectionRef.current = false;
    if (globalSettings.baseUrl !== undefined) {
      setBaseUrl(globalSettings.baseUrl);
    } else {
      setBaseUrl("");
    }
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
            <span>
              {baseUrl === globalSettings.baseUrl
                ? "G {baseURL}"
                : "C {baseURL}"}
            </span>
            {baseUrl !== globalSettings.baseUrl && (
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
                onClick={handleDetachBaseUrl}
              >
                x
              </button>
            )}
          </div>
        )}

        <input
          placeholder="Enter request URL"
          value={url}
          onChange={(e) =>
            setCurrentRequest((prev) => ({ ...prev, url: e.target.value }))
          }
        />

        <button
          disabled={!url.trim()}
          className="send-btn"
          onClick={handleSend}
        >
          Send
        </button>
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
            onChange={(e) =>
              addRequestToCollection(
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
