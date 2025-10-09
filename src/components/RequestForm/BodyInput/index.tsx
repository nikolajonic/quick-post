import type { FC, Dispatch, SetStateAction } from "react";
import "./index.css";

interface BodyInputProps {
  method: string;
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
}

const BodyInput: FC<BodyInputProps> = ({ method, body, setBody }) => {
  if (["GET", "DELETE"].includes(method)) return null;

  const handleFormat = () => {
    if (!body.trim()) return;
    try {
      const parsed = JSON.parse(body);
      const formatted = JSON.stringify(parsed, null, 2);
      setBody(formatted);
    } catch {
      alert("Invalid JSON — cannot format");
    }
  };

  return (
    <div className="body-card">
      <div className="body-header">
        <h4>Body</h4>
        <span className="body-hint">Raw JSON</span>
      </div>

      {/* ✅ Wrapper that positions the format button */}
      <div className="body-textarea-wrapper">
        <button className="format-btn" onClick={handleFormat}>
          Format
        </button>

        <textarea
          className="body-textarea"
          placeholder='{ "example": "value" }'
          rows={6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>
    </div>
  );
};

export default BodyInput;
