import { useState } from "react";
import type { FC } from "react";
import "./index.css";

export interface HistoryItem {
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  body: string;
  status: "success" | "error";
  timestamp: string;
  baseUrl?: string; // ✅ added
  collectionId?: string; // ✅ added
}
interface HistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onBack: () => void;
}

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const History: FC<HistoryProps> = ({ history, onSelect, onBack }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(history.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentPageItems = history.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="history-view">
      <div className="history-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h4>Request History</h4>
      </div>

      {history.length === 0 && (
        <p className="history-empty">No previous requests yet.</p>
      )}

      <ul className="history-list">
        {currentPageItems.map((item, i) => (
          <li key={i} className="history-item" onClick={() => onSelect(item)}>
            <div className="method-wrap">
              <span className={`method-tag ${item.method.toLowerCase()}`}>
                {item.method}
              </span>
              <span
                className={`status-dot ${
                  item.status === "success" ? "success" : "error"
                }`}
              />
            </div>
            <span className="url">{item.url}</span>
            <span className="timestamp">{formatDateTime(item.timestamp)}</span>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
