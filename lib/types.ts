export interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  biography?: string;
  live_in_production: boolean;
  created_at?: string;
  updated_at?: string;
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
