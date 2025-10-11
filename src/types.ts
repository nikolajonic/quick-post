export interface Header {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestData {
  method: string;
  url: string;
  headers: Header[];
  body?: string;
}

export interface CollectionAuth {
  key: string;
  token: string;
}

export interface Collection {
  id: string;
  name: string;
  collapsed: boolean;
  baseUrl?: string;
  requests: RequestData[];
  auth?: CollectionAuth;
}

export interface HistoryItem {
  method: string;
  url: string;
  headers: Header[];
  body: string;
  status: "success" | "error";
  timestamp: string;
  baseUrl?: string;
  collectionId?: string;
}
