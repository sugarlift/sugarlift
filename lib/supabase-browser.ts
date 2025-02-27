import { createClient } from "@supabase/supabase-js";
import { ArtistTable, Artwork } from "./types";

// Make sure we have the required environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Public client for client-side operations
export const supabase = createClient<{
  artists: ArtistTable;
  artwork: Artwork;
}>(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
