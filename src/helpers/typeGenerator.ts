import hljs from "highlight.js";
import "highlight.js/styles/vs2015.css";

export const generateTypesFromJson = (obj: any): string => {
  if (!obj || typeof obj !== "object") {
    return "/* Cannot infer types from non-object response */";
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const inferType = (value: any, indent = 2): string => {
    const pad = " ".repeat(indent);
    const innerPad = " ".repeat(indent + 2);

    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]";
      return `${inferType(value[0], indent)}[]`;
    }

    if (typeof value === "object" && value !== null) {
      const fields = Object.entries(value)
        .map(([k, v]) => `${innerPad}${k}: ${inferType(v, indent + 2)};`)
        .join("\n");
      return `{\n${fields}\n${pad}}`;
    }

    switch (typeof value) {
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "string":
        return "string";
      default:
        return "any";
    }
  };

  const code = Object.entries(obj)
    .map(([key, value]) => {
      const typeName = capitalize(key);
      return `type ${typeName} = ${inferType(value)};`;
    })
    .join("\n\n");

  // ✅ Proper syntax highlighting
  const { value: highlighted } = hljs.highlight(code, {
    language: "typescript",
  });
  return highlighted;
};
