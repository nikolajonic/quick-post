import { useState } from "react";
import "./index.css";
import CollectionSettings from "../CollectionSettings";
import SettingsSVG from "../svgs/settings";
import CreateRequestForm from "../CreateRequest";
import MoreSVG from "../svgs/more"; // ✅ new SVG for 3-dot menu
import EditSVG from "../svgs/edit";
import DeleteSVG from "../svgs/delete";

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
  const [openMenu, setOpenMenu] = useState<string | null>(null); // ✅ track which request’s menu is open
  const [editingRequest, setEditingRequest] = useState<{
    collectionId: string;
    requestIndex: number;
    data: {
      method: string;
      url: string;
      headers?: { key: string; value: string; enabled: boolean }[];
      body?: string;
    };
  } | null>(null);

  const handleAdd = () => {
    if (!newCollectionName.trim()) return;
    addCollection(newCollectionName.trim());
    setNewCollectionName("");
    setAdding(false);
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

  const saveRequestToCollection = (
    collectionId: string,
    newRequest: {
      method: string;
      url: string;
      headers: { key: string; value: string; enabled: boolean }[];
      body: string;
    }
  ) => {
    setCollections((prev) => {
      const updated = prev.map((c) =>
        c.id === collectionId
          ? { ...c, requests: [...c.requests, newRequest] }
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

    setCreatingFor(null);
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
                  {col.requests.length === 0 ? (
                    <div className="empty">
                      <p>No APIs yet.</p>
                      <button
                        className="add-request-btn"
                        onClick={() => setCreatingFor(col.id)}
                      >
                        + Create Request
                      </button>
                    </div>
                  ) : (
                    <>
                      <ul className="request-list">
                        {col.requests.map((r, i) => {
                          const menuKey = `${col.id}-${i}`;
                          return (
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

                              {/* 3-dot menu */}
                              <div className="menu-wrapper">
                                <button
                                  className="menu-btn"
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === menuKey ? null : menuKey
                                    )
                                  }
                                >
                                  <MoreSVG />
                                </button>

                                {openMenu === menuKey && (
                                  <div className="dropdown-menu">
                                    <button
                                      onClick={() => {
                                        setEditingRequest({
                                          collectionId: col.id,
                                          requestIndex: i,
                                          data: r,
                                        });
                                        setCreatingFor(col.id); // ✅ ensures the form actually shows up
                                        setOpenMenu(null);
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 5,
                                          height: "20px",
                                        }}
                                      >
                                        <EditSVG /> <p> Edit</p>
                                      </div>
                                    </button>
                                    <button
                                      onClick={() => {
                                        deleteRequest(col.id, i);
                                        setOpenMenu(null);
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 5,
                                          height: "18px",
                                        }}
                                      >
                                        <DeleteSVG /> <p> Delete</p>
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      {!editingRequest && (
                        <button
                          className="add-request-btn"
                          onClick={() => setCreatingFor(col.id)}
                        >
                          + Create Request
                        </button>
                      )}
                    </>
                  )}

                  {creatingFor === col.id && (
                    <CreateRequestForm
                      key={editingRequest ? "edit" : "create"}
                      onSave={(data) => {
                        if (editingRequest) {
                          setCollections((prev) => {
                            const updated = prev.map((c) =>
                              c.id === editingRequest.collectionId
                                ? {
                                    ...c,
                                    requests: c.requests.map((req, idx) =>
                                      idx === editingRequest.requestIndex
                                        ? data
                                        : req
                                    ),
                                  }
                                : c
                            );
                            const isExt =
                              window.location.protocol === "chrome-extension:";
                            if (isExt && chrome?.storage?.local)
                              chrome.storage.local.set({
                                collections: updated,
                              });
                            else
                              localStorage.setItem(
                                "collections",
                                JSON.stringify(updated)
                              );
                            return updated;
                          });
                        } else {
                          saveRequestToCollection(col.id, data);
                        }
                        setEditingRequest(null);
                        setCreatingFor(null);
                      }}
                      onCancel={() => {
                        setCreatingFor(null);
                        setEditingRequest(null);
                      }}
                      initialData={editingRequest?.data}
                    />
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
