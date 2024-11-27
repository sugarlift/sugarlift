export interface Artist {
  id: string;
  artist_name: string;
  artist_bio: string;
  born: string;
  city: string;
  state: string;
  country: string;
  ig_handle: string;
  website: string;
  live_in_production: boolean;
  artist_photo: StoredAttachment[];
  view_count?: number;
  artwork?: Artwork[];
  featured_image?: string;
  slug: string;
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
  title: string | null;
  artwork_images: StoredAttachment[];
  medium: string | null;
  year: number | null;
  width: string | null;
  height: string | null;
  live_in_production: boolean;
  artist_name: string | null;
  type: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtistTable {
  id: string;
  artist_name: string;
  artist_bio: string | null;
  born: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  ig_handle: string | null;
  website: string | null;
  live_in_production: boolean;
  artist_photo: StoredAttachment[];
  slug: string;
}
