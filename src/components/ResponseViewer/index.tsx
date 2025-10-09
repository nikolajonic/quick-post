import { useState } from "react";
import "./index.css";

interface ResponseViewerProps {
  data: { raw: string; parsed: any } | null;
  status: "success" | "error" | null;
}

const ResponseViewer = ({ data, status }: ResponseViewerProps) => {
  const [view, setView] = useState<"pretty" | "raw">("pretty");
  if (!data) return null;

  const className = `response ${status ?? ""}`;

  const pretty =
    typeof data.parsed === "object"
      ? JSON.stringify(data.parsed, null, 2)
      : data.parsed;

  const raw = data.raw;

  const display = view === "pretty" ? pretty : raw;

  return (
    <div className={className}>
      <div className="response-header">
        <span>
          Response{" "}
          {status === "success" ? (
            <span style={{ color: "#73ad53", fontWeight: 600 }}>✓ Success</span>
          ) : status === "error" ? (
            <span style={{ color: "#ad5c53", fontWeight: 600 }}>✗ Error</span>
          ) : null}
        </span>

        <select
          value={view}
          onChange={(e) => setView(e.target.value as "pretty" | "raw")}
        >
          <option value="pretty">Pretty</option>
          <option value="raw">Raw</option>
        </select>
      </div>
      <pre>{display}</pre>
    </div>
  );
};

export default ResponseViewer;
