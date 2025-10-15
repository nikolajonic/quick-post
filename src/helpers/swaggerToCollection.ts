// src/helpers/swaggerToCollection.ts

export interface CollectionRequest {
  method: string;
  url: string;
  headers: { key: string; value: string; enabled: boolean }[];
  body: string;
}

export interface Collection {
  id: string;
  name: string;
  collapsed: boolean;
  baseUrl: string;
  requests: CollectionRequest[];
  auth?: { key: string; token: string };
}

/**
 * Converts a Swagger/OpenAPI (2.0 or 3.0) JSON spec into
 * your app's simplified collection structure.
 */
export function swaggerToCollection(
  swagger: any,
  collectionName: string
): Collection {
  if (!swagger || typeof swagger !== "object") {
    throw new Error("Invalid Swagger JSON");
  }

  const baseUrl =
    swagger.schemes && swagger.host
      ? `${swagger.schemes[0]}://${swagger.host}${swagger.basePath ?? ""}`
      : swagger.servers?.[0]?.url ?? "";

  const paths: Record<string, any> = swagger.paths || {};
  const requests: CollectionRequest[] = [];

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries<any>(methods)) {
      const consumes = details.consumes ?? swagger.consumes ?? [];
      const defaultHeader =
        consumes.includes("application/json") || consumes.length === 0
          ? [{ key: "Content-Type", value: "application/json", enabled: true }]
          : [];

      const hasBodyParam = details.parameters?.some(
        (p: any) => p.in === "body"
      );

      requests.push({
        method: method.toUpperCase(),
        url: path,
        headers: defaultHeader,
        body: hasBodyParam
          ? JSON.stringify(
              exampleFromSchema(
                details.parameters.find((p: any) => p.in === "body")?.schema
              ),
              null,
              2
            )
          : "",
      });
    }
  }

  return {
    id: Date.now().toString(),
    name: collectionName,
    collapsed: false,
    baseUrl,
    requests,
  };
}

function exampleFromSchema(schema: any): any {
  if (!schema) return {};
  if (schema.example) return schema.example;
  if (schema.type === "object" && schema.properties) {
    const obj: Record<string, any> = {};
    for (const [key, val] of Object.entries<any>(schema.properties)) {
      obj[key] = exampleFromSchema(val);
    }
    return obj;
  }
  if (schema.type === "array" && schema.items) {
    return [exampleFromSchema(schema.items)];
  }
  if (schema.type === "string") return "";
  if (schema.type === "integer" || schema.type === "number") return 0;
  if (schema.type === "boolean") return false;
  return {};
}
