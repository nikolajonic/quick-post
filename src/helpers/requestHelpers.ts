import type { Header, HistoryItem, Collection } from "../types";
import type { GlobalSettingsData } from "../components/GlobalSettings";

/* -------------------------------------------------------------
 🧩  URL & Headers Utilities
------------------------------------------------------------- */

/** Normalize base and relative URL into a full HTTPS URL */
export function buildFinalUrl(baseUrl: string, url: string): string {
  let normalizedBase = baseUrl.trim();
  if (normalizedBase && !/^https?:\/\//i.test(normalizedBase))
    normalizedBase = `https://${normalizedBase}`;

  let normalizedUrl = url.trim();
  if (!normalizedBase && normalizedUrl && !/^https?:\/\//i.test(normalizedUrl))
    normalizedUrl = `https://${normalizedUrl}`;

  return normalizedBase && !/^https?:\/\//i.test(url)
    ? `${normalizedBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`
    : normalizedUrl;
}

/** Convert enabled headers array to record */
export function headersToRecord(
  headers: { key: string; value: string; enabled: boolean }[]
): Record<string, string> {
  return headers.reduce((acc, { key, value, enabled }) => {
    if (key && enabled) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

/** Try parsing JSON, fall back to raw text */
export function tryParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* -------------------------------------------------------------
 🔐  Auth Resolution
------------------------------------------------------------- */

/** Decide which auth object to use (collection > global) */
export function resolveAuth(
  prefill: HistoryItem | null | undefined,
  collections: Collection[],
  globalAuth: any
) {
  const collectionAuth =
    prefill?.collectionId &&
    collections.find((c) => c.id === prefill.collectionId)?.auth;

  const auth =
    collectionAuth &&
    typeof collectionAuth === "object" &&
    "token" in collectionAuth
      ? collectionAuth
      : globalAuth && typeof globalAuth === "object" && "token" in globalAuth
      ? globalAuth
      : null;

  return auth;
}

/* -------------------------------------------------------------
 🕓  History Management
------------------------------------------------------------- */

/** Push a new history item (max 20 entries) */
export function pushHistory(
  history: HistoryItem[],
  item: Omit<HistoryItem, "timestamp"> & { timestamp?: string }
): HistoryItem[] {
  const newItem: HistoryItem = {
    ...item,
    timestamp: item.timestamp ?? new Date().toISOString(),
  };
  return [newItem, ...history].slice(0, 20);
}

/** Wrapper to push and update history in context */
export const saveToHistory = (
  history: HistoryItem[],
  setHistory: (h: HistoryItem[]) => void,
  data: Omit<HistoryItem, "timestamp"> & { status: "success" | "error" }
) => {
  const updated = pushHistory(history, {
    ...data,
    timestamp: new Date().toISOString(),
  });
  setHistory(updated);
};

/* -------------------------------------------------------------
 ⚙️  Prefill Request
------------------------------------------------------------- */

/** Prepare prefilled request and baseUrl */
export const prefillRequest = (
  prefill: HistoryItem | null | undefined,
  globalBaseUrl: string
) => {
  if (!prefill)
    return {
      currentRequest: {
        method: "GET",
        url: "",
        headers: [
          { key: "Content-Type", value: "application/json", enabled: true },
        ],
        body: "",
      },
      baseUrl: globalBaseUrl.trim(),
    };

  return {
    currentRequest: {
      method: prefill.method,
      url: prefill.url,
      headers:
        prefill.headers && prefill.headers.length
          ? prefill.headers
          : [{ key: "Content-Type", value: "application/json", enabled: true }],
      body: prefill.body || "",
    },
    baseUrl: prefill.baseUrl?.trim() || globalBaseUrl.trim() || "",
  };
};

/* -------------------------------------------------------------
 🌐  Request Sending
------------------------------------------------------------- */

/** Send HTTP request with timing and normalized result */
export const sendRequest = async (
  baseUrl: string,
  url: string,
  method: string,
  headers: any[],
  body: string,
  collections: Collection[],
  globalAuth?: GlobalSettingsData["auth"],
  prefill?: HistoryItem | null
) => {
  const finalUrl = buildFinalUrl(baseUrl, url);

  const options: RequestInit = {
    method,
    headers: headers
      .filter((h) => h.enabled && h.key)
      .reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
    body: ["GET", "HEAD"].includes(method) ? undefined : body || undefined,
  };

  const start = performance.now();
  let res: Response;
  let raw = "";
  let parsed: any = null;

  try {
    res = await fetch(finalUrl, options);
    raw = await res.text();
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = raw;
    }

    const end = performance.now();
    return {
      ok: res.ok,
      status: res.status,
      raw,
      parsed,
      timeMs: Math.round(end - start),

      // 🟢 include this for UI & history
      request: { url: finalUrl, method, headers, body },
    };
  } catch (err: any) {
    return {
      ok: false,
      raw: err.message,
      parsed: { error: err.message },
      timeMs: 0,

      // still include attempted request info
      request: { url: finalUrl, method, headers, body },
    };
  }
};

/* -------------------------------------------------------------
 📁  Collections Management
------------------------------------------------------------- */

/** Add request to a specific collection (with UI feedback) */
export const addRequestToCollection = (
  collections: Collection[],
  setCollections: React.Dispatch<React.SetStateAction<Collection[]>>,
  method: string,
  url: string,
  headers: any[],
  body: string,
  collectionId: string,
  setShowTooltip: (msg: string | null) => void,
  setShowAddToCollection: (v: boolean) => void
) => {
  setCollections((prev) => {
    const updated = [...prev];
    const index = updated.findIndex((c) => c.id === collectionId);
    if (index === -1) return prev;

    const col = updated[index];
    const exists = col.requests.some(
      (r) =>
        r.method.toLowerCase() === method.toLowerCase() &&
        r.url.trim() === url.trim()
    );

    if (exists) {
      setShowTooltip(`Request already exists in "${col.name}"`);
      setTimeout(() => setShowTooltip(null), 2500);
      return prev;
    }

    const newRequest = { method, url, headers, body };
    updated[index] = { ...col, requests: [...col.requests, newRequest] };

    setShowTooltip(`Saved to "${col.name}"`);
    setShowAddToCollection(false);
    setTimeout(() => setShowTooltip(null), 2500);
    return updated;
  });
};
