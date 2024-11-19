export interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  biography: string;
  year_of_birth: string;
  location: string;
  instagram_url: string;
  website_url: string;
  live_in_production: boolean;
  attachments: StoredAttachment[];
  artwork?: Artwork[];
  profile_image?: string;
  view_count?: number;
  latitude?: number;
  longitude?: number;
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

export interface Artwork {
  id: string;
  artist_id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  medium: string | null;
  width: string | null;
  height: string | null;
  year: number | null;
  live_in_production: boolean;
  artwork_images: StoredAttachment[];
  created_at?: string;
  updated_at?: string;
}
