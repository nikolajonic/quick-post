import type { FC, Dispatch, SetStateAction } from "react";
import "./index.css";

interface BodyInputProps {
  method: string;
  body: string;
  setBody: Dispatch<SetStateAction<string>>;
}

const BodyInput: FC<BodyInputProps> = ({ method, body, setBody }) => {
  if (["GET", "DELETE"].includes(method)) return null;

  return (
    <div className="body-card">
      <div className="body-header">
        <h4>Body</h4>
        <span className="body-hint">Raw JSON</span>
      </div>
      <textarea
        className="body-textarea"
        placeholder='{ "example": "value" }'
        rows={6}
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
    </div>
  );
};

export default BodyInput;
