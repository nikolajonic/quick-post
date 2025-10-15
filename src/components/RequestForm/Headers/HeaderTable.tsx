import type { FC, Dispatch, SetStateAction } from "react";
import "./HeaderTable.css";

interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

interface HeaderTableProps {
  headers: Header[];
  setHeaders: Dispatch<SetStateAction<Header[]>>;
}

const HeaderTable: FC<HeaderTableProps> = ({ headers, setHeaders }) => {
  const addRow = () =>
    setHeaders([...headers, { key: "", value: "", enabled: true }]);
  const removeRow = (index: number) =>
    setHeaders(headers.filter((_, i) => i !== index));

  const updateHeader = (index: number, field: keyof Header, value: any) => {
    const newHeaders = [...headers];
    (newHeaders[index] as any)[field] = value;
    setHeaders(newHeaders);
  };

  return (
    <div className="header-table">
      <div className="header-table-header">
        <h4>Headers</h4>
        <button onClick={addRow}>+ Add Header</button>
      </div>
      <table className="header-table-grid">
        <thead>
          <tr>
            <th></th>
            <th>Key</th>
            <th>Value</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {headers.map((h, i) => (
            <tr key={i}>
              <td>
                <input
                  type="checkbox"
                  checked={h.enabled}
                  onChange={(e) => updateHeader(i, "enabled", e.target.checked)}
                />
              </td>
              <td>
                <input
                  placeholder="Key"
                  value={h.key}
                  title={h.key}
                  onChange={(e) => updateHeader(i, "key", e.target.value)}
                />
              </td>
              <td>
                <input
                  placeholder="Value"
                  value={h.value}
                  title={h.value}
                  onChange={(e) => updateHeader(i, "value", e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => removeRow(i)} className="remove-btn">
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeaderTable;
