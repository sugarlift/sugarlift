"use server";

import { supabase } from "@/lib/supabase";

export async function incrementViewCount({
  artistName,
}: {
  artistName: string;
}) {
  // Only increment view count in production
  if (process.env.NODE_ENV === "production") {
    // First get the current count
    const { data } = await supabase
      .from("artists")
      .select("view_count")
      .eq("artist_name", artistName)
      .single();

    const currentCount = data?.view_count || 0;

    // Then update it
    await supabase
      .from("artists")
      .update({
        view_count: currentCount + 1,
      })
      .eq("artist_name", artistName);
  }
}
