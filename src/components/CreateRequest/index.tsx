import { useState, useEffect } from "react";
import HeaderTable from "../RequestForm/Headers/HeaderTable";
import BodyInput from "../RequestForm/BodyInput";

interface Props {
  onSave: (data: {
    method: string;
    url: string;
    headers: { key: string; value: string; enabled: boolean }[];
    body: string;
  }) => void;
  onCancel: () => void;
  initialData?: {
    method: string;
    url: string;
    headers?: { key: string; value: string; enabled: boolean }[];
    body?: string;
  };
}

const CreateRequestForm = ({ onSave, onCancel, initialData }: Props) => {
  const [method, setMethod] = useState(initialData?.method || "GET");
  const [url, setUrl] = useState(initialData?.url || "");
  const [headers, setHeaders] = useState(
    initialData?.headers || [
      { key: "Content-Type", value: "application/json", enabled: true },
    ]
  );
  const [body, setBody] = useState(initialData?.body || "");

  // 🧠 Reapply data when editing existing request
  useEffect(() => {
    if (initialData) {
      setMethod(initialData.method || "GET");
      setUrl(initialData.url || "");
      setHeaders(
        initialData.headers || [
          { key: "Content-Type", value: "application/json", enabled: true },
        ]
      );
      setBody(initialData.body || "");
    }
  }, [initialData]);

  // 🧠 Clear body automatically when switching to GET
  useEffect(() => {
    if (method === "GET" && body.trim().length > 0) {
      setBody("");
    }
  }, [method]);

  const handleSave = () => {
    if (!url.trim()) return alert("Enter request URL");
    onSave({ method, url, headers, body });
  };

  return (
    <div style={{ marginBottom: 10 }}>
      <h3
        style={{
          marginLeft: 10,
          fontFamily: "monospace",
          fontSize: 18,
        }}
      >
        {initialData ? "Edit Request" : "New Request"}
      </h3>

      <div className="create-request-form">
        <div className="row2">
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <input
            placeholder="Enter request URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <HeaderTable headers={headers} setHeaders={setHeaders} />

        {/* 🧠 Disable body input for GET */}
        {method !== "GET" && (
          <BodyInput method={method} body={body} setBody={setBody} />
        )}
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
        <button className="add-btn" onClick={handleSave}>
          {initialData ? "Update" : "Save"}
        </button>
        <button className="add-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CreateRequestForm;
