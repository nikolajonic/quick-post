import { useEffect, useRef } from "react";
import { generateTypesFromJson } from "../../../helpers/typeGenerator";

interface TypesPanelProps {
  visible: boolean;
  onClose: () => void;
  data: any;
  ignoreRef?: React.RefObject<HTMLElement | null>;
}

const TypesPanel = ({ visible, onClose, data, ignoreRef }: TypesPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        panelRef.current?.contains(target) ||
        ignoreRef?.current?.contains(target)
      ) {
        return;
      }

      onClose();
    };

    if (visible) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [visible, onClose, ignoreRef]);

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

  if (!visible) return null;

  return (
    <div
      ref={panelRef}
      style={{
        position: "absolute",
        bottom: 0,
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
        transition: "transform 0.25s ease, opacity 0.25s ease",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        opacity: visible ? 1 : 0,
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
  );
};

export default TypesPanel;
