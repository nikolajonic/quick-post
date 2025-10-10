import { useState } from "react";
import "./index.css";
import HeaderTable from "../RequestForm/Headers/HeaderTable";
import BodyInput from "../RequestForm/BodyInput";
import CollectionSettings from "../CollectionSettings";
import SettingsSVG from "../svgs/settings";

export interface Collection {
  id: string;
  name: string;
  collapsed: boolean;
  baseUrl?: string;
  auth?: {
    key: string;
    token: string;
  };
  requests: {
    method: string;
    url: string;
    headers?: { key: string; value: string; enabled: boolean }[];
    body?: string;
  }[];
}

interface Props {
  collections: Collection[];
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>;
  addCollection: (name: string) => void;
  removeCollection: (id: string) => void;
  toggleCollapse: (id: string) => void;
  onSelectRequest?: (req: {
    method: string;
    url: string;
    headers?: { key: string; value: string; enabled: boolean }[];
    body?: string;
  }) => void;
}

declare const chrome: any;

const Collections = ({
  collections,
  setCollections,
  addCollection,
  toggleCollapse,
  onSelectRequest,
}: Props) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [adding, setAdding] = useState(false);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [openSettings, setOpenSettings] = useState<string | null>(null);

  // Local states for inline request form
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState([
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [body, setBody] = useState("");

  const handleAdd = () => {
    if (!newCollectionName.trim()) return;
    addCollection(newCollectionName.trim());
    setNewCollectionName("");
    setAdding(false);
  };

  const saveRequestToCollection = (collectionId: string) => {
    if (!url.trim()) return alert("Enter request URL");

    setCollections((prev) => {
      const updated = prev.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: [
                ...c.requests,
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

      return updated;
    });

    // Reset form state
    setCreatingFor(null);
    setMethod("GET");
    setUrl("");
    setHeaders([
      { key: "Content-Type", value: "application/json", enabled: true },
    ]);
    setBody("");
  };

  const deleteRequest = (collectionId: string, index: number) => {
    setCollections((prev) => {
      const updated = prev.map((c) =>
        c.id === collectionId
          ? { ...c, requests: c.requests.filter((_, i) => i !== index) }
          : c
      );

      const isExtension = window.location.protocol === "chrome-extension:";
      if (isExtension && chrome?.storage?.local) {
        chrome.storage.local.set({ collections: updated });
      } else {
        localStorage.setItem("collections", JSON.stringify(updated));
      }

      return updated;
    });
  };

  const deleteCollection = (id: string) => {
    setCollections((prev) => {
      const updated = prev.filter((c) => c.id !== id);

      const isExtension = window.location.protocol === "chrome-extension:";
      if (isExtension && chrome?.storage?.local) {
        chrome.storage.local.set({ collections: updated });
      } else {
        localStorage.setItem("collections", JSON.stringify(updated));
      }

      return updated;
    });
  };

  return (
    <div className="collections">
      <div className="collections-header">
        <h4>Collections</h4>
        {!adding && (
          <button className="add-btn" onClick={() => setAdding(true)}>
            + New Collection
          </button>
        )}
      </div>

      {adding && (
        <div className="new-collection-input">
          <input
            type="text"
            placeholder="Collection name..."
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            autoFocus
          />
          <button className="save-btn" onClick={handleAdd}>
            Save
          </button>
          <button className="cancel-btn" onClick={() => setAdding(false)}>
            Cancel
          </button>
        </div>
      )}

      {collections.length === 0 ? (
        <p className="empty">No collections yet.</p>
      ) : (
        <ul className="collection-list">
          {collections.map((col) => (
            <li key={col.id} className="collection-item">
              <div className="collection-title">
                <button
                  className="collapse-btn"
                  onClick={() => toggleCollapse(col.id)}
                >
                  {col.collapsed ? "▶" : "▼"}
                </button>
                <span
                  className="name"
                  onClick={() => toggleCollapse(col.id)}
                  style={{
                    cursor: "pointer",
                    fontFamily: "monospace",
                    fontSize: 16,
                  }}
                >
                  {col.name}
                </span>
                <button
                  className="icon-btn"
                  onClick={() =>
                    setOpenSettings(openSettings === col.id ? null : col.id)
                  }
                  aria-label="Collection settings"
                  title="Collection settings"
                >
                  <SettingsSVG />
                </button>
                <button
                  className="remove-btn"
                  onClick={() => deleteCollection(col.id)}
                  title="Delete this collection"
                >
                  ✕
                </button>
              </div>
              {openSettings === col.id && (
                <CollectionSettings
                  id={col.id}
                  baseUrl={col.baseUrl}
                  auth={col.auth}
                  onSave={(id, data) => {
                    setCollections((prev) => {
                      const updated = prev.map((c) =>
                        c.id === id
                          ? { ...c, baseUrl: data.baseUrl, auth: data.auth }
                          : c
                      );
                      const isExtension =
                        window.location.protocol === "chrome-extension:";
                      if (isExtension && chrome?.storage?.local) {
                        chrome.storage.local.set({ collections: updated });
                      } else {
                        localStorage.setItem(
                          "collections",
                          JSON.stringify(updated)
                        );
                      }
                      return updated;
                    });
                    setOpenSettings(null);
                  }}
                />
              )}
              {!col.collapsed && (
                <div className="collection-body">
                  {col.requests.length === 0 && (
                    <div className="empty">
                      <p>No APIs yet.</p>
                      <button
                        className="add-request-btn"
                        onClick={() => setCreatingFor(col.id)}
                      >
                        + Create Request
                      </button>
                    </div>
                  )}

                  {col.requests.length > 0 && (
                    <ul className="request-list">
                      {col.requests.map((r, i) => (
                        <li key={i} className="request-item">
                          <div
                            className="request-main"
                            onClick={() => onSelectRequest?.(r)}
                          >
                            <span
                              className={`method-tag ${r.method.toLowerCase()}`}
                            >
                              {r.method}
                            </span>
                            <span className="url">{r.url}</span>
                          </div>
                          <button
                            className="delete-btn"
                            onClick={() => deleteRequest(col.id, i)}
                            title="Delete this request"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                      <button
                        className="add-request-btn"
                        onClick={() => setCreatingFor(col.id)}
                      >
                        + Create Request
                      </button>
                    </ul>
                  )}

                  {/* Inline Create Request Form BELOW "No APIs yet." */}
                  {creatingFor === col.id && (
                    <div
                      style={{
                        marginBottom: 10,
                      }}
                    >
                      <h3
                        style={{
                          marginLeft: 10,
                          fontFamily: "monospace",
                          fontSize: 18,
                        }}
                      >
                        New Request
                      </h3>
                      <div className="create-request-form">
                        <div className="row2">
                          <select
                            value={method}
                            onChange={(e) => setMethod(e.target.value)}
                          >
                            {["GET", "POST", "PUT", "PATCH", "DELETE"].map(
                              (m) => (
                                <option key={m}>{m}</option>
                              )
                            )}
                          </select>

                          <input
                            placeholder="Enter request URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                          />
                        </div>

                        <HeaderTable
                          headers={headers}
                          setHeaders={setHeaders}
                        />
                        <BodyInput
                          method={method}
                          body={body}
                          setBody={setBody}
                        />
                      </div>
                      <div
                        style={{
                          gap: 10,
                          display: "flex",
                          justifyContent: "flex-end",
                          marginTop: 10,
                          marginRight: 10,
                        }}
                      >
                        <button
                          className="add-btn"
                          onClick={() => saveRequestToCollection(col.id)}
                        >
                          Save
                        </button>
                        <button
                          className="add-btn"
                          onClick={() => setCreatingFor(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Collections;
