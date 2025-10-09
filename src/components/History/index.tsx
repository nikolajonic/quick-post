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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
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
          <li key={i} onClick={() => onSelect(item)}>
            <span
              className={`method-tag ${
                item.status === "success" ? "tag-success" : "tag-error"
              }`}
            >
              {item.method}
            </span>
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
