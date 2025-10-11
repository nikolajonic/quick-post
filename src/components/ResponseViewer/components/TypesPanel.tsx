import { useEffect, useRef } from "react";
import { generateTypesFromJson } from "../../../helpers/typeGenerator";

interface TypesPanelProps {
  visible: boolean;
  onClose: () => void;
  data: any;
}

const TypesPanel = ({ visible, onClose, data }: TypesPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  // ✅ Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (visible) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose]);

  // ✅ Swipe down to close (mobile)
  useEffect(() => {
    let startY = 0;
    const panel = panelRef.current;
    if (!panel) return;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const diff = e.touches[0].clientY - startY;
      if (diff > 70) onClose();
    };

    if (visible) {
      panel.addEventListener("touchstart", handleTouchStart);
      panel.addEventListener("touchmove", handleTouchMove);
    }
    return () => {
      panel?.removeEventListener("touchstart", handleTouchStart);
      panel?.removeEventListener("touchmove", handleTouchMove);
    };
  }, [visible, onClose]);

  return (
    <>
      {visible && (
        <div
          ref={panelRef}
          style={{
            position: "absolute",
            bottom: visible ? "0" : "-50%",
            left: 0,
            right: 0,
            height: "45%",
            background: "#1e1e1e",
            color: "#e6e6e6",
            overflow: "auto",
            borderTop: "2px solid #007bff",
            borderTopLeftRadius: "6px",
            borderTopRightRadius: "6px",
            padding: "10px 14px",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.25)",
            zIndex: 20,
            transition: "bottom 0.20s ease,transform 0.15s ease",
          }}
        >
          <div
            style={{
              fontWeight: 600,
              marginBottom: "8px",
              color: "#66b2ff",
              fontSize: "13px",
            }}
          >
            Generated Types
          </div>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              fontFamily: "Consolas, monospace",
              fontSize: "13px",
              lineHeight: "1.5",
            }}
            dangerouslySetInnerHTML={{ __html: generateTypesFromJson(data) }}
          />
        </div>
      )}
    </>
  );
};

export default TypesPanel;
