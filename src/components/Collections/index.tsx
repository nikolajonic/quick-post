import { useState } from "react";
import "./index.css";

export interface Collection {
  id: string;
  name: string;
  collapsed: boolean;
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

const Collections = ({
  collections,
  setCollections,
  addCollection,
  removeCollection,
  toggleCollapse,
  onSelectRequest,
}: Props) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const [adding, setAdding] = useState(false);

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
      localStorage.setItem("collections", JSON.stringify(updated));
      return updated;
    });
  };

  // ✅ Instant delete — no confirm dialog
  const deleteCollection = (id: string) => {
    setCollections((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      localStorage.setItem("collections", JSON.stringify(updated));
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
                  style={{ cursor: "pointer" }}
                >
                  {col.name}
                </span>
                <button
                  className="remove-btn"
                  onClick={() => deleteCollection(col.id)}
                  title="Delete this collection"
                >
                  ✕
                </button>
              </div>

              {!col.collapsed && (
                <div className="collection-body">
                  {col.requests.length === 0 ? (
                    <p className="empty">No APIs yet.</p>
                  ) : (
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
                    </ul>
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
