import {
  FieldSet,
  Attachment as AirtableAttachmentType,
  Collaborator,
} from "airtable";

export interface Artist {
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
  artwork?: Artwork[];
  featured_image?: string;
  slug?: string;
  created_at: string;
  updated_at: string;
  brand_value: string | null;
}

export interface WebhookError extends Error {
  status?: number;
  response?: {
    message?: string;
    details?: unknown;
  };
}

export interface SyncError {
  record_id: string;
  error: string;
  timestamp: string;
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
  url: string | null;
  width: number | null;
  height: number | null;
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
  brand_value: string | null;
}

// Create a more specific type for Airtable field values
type AirtableFieldValue =
  | string
  | number
  | boolean
  | readonly string[]
  | Collaborator
  | readonly Collaborator[]
  | readonly AirtableAttachmentType[]
  | AirtableAttachment[]
  | undefined
  | null;

// First, let's create a type for the specific fields
export interface AirtableFieldTypes {
  Title: string;
  Artist: string;
  Medium: string;
  Year: string | number;
  "Width (e.)": string;
  "Height (e.)": string;
  Type: string;
  "Artwork images": AirtableAttachment[];
  "Last Modified": string;
  "ADD TO PRODUCTION": boolean;
}

// Then update AirtableFields to use a more flexible index signature
export interface AirtableFields extends AirtableFieldTypes {
  [key: string]:
    | AirtableFieldValue
    | AirtableFieldTypes[keyof AirtableFieldTypes];
}

// Create a type that combines FieldSet and our fields
export type AirtableRecord = FieldSet & AirtableFields;

export interface ArtistAirtableFields {
  "Artist Name": string;
  "Artist Bio": string;
  Born: string;
  City: string;
  "State (USA)": string;
  Country: string;
  Website: string;
  "IG Handle": string;
  "Artist Photo": AirtableAttachment[];
  "Last Modified": string;
  "Add to Website": boolean;
  "Brand Value": string;
}

export interface SyncProgress {
  current: number;
  total: number;
}

export interface SyncOptions {
  mode: "bulk" | "incremental";
  batchSize?: number;
  concurrency?: number;
  skipExistingCheck?: boolean;
  skipImages?: boolean;
  onProgress?: (progress: SyncProgress) => void;
}
