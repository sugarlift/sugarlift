export interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  biography: string;
  live_in_production: boolean;
  attachments: StoredAttachment[];
}

export interface WebhookError extends Error {
  status?: number;
  response?: {
    message?: string;
    details?: unknown;
  };
}

export interface SyncError extends Error {
  code?: string;
  details?: unknown;
  record?: {
    id: string;
    fields?: unknown;
  };
}

export interface AirtableAttachment {
  id: string;
  width: number;
  height: number;
  url: string;
  filename: string;
  type: string;
}

export interface StoredAttachment {
  url: string;
  width: number;
  height: number;
  filename: string;
  type: string;
}
