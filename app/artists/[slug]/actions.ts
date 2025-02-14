"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function incrementViewCount({
  artistName,
}: {
  artistName: string;
}) {
  // Only increment view count in production
  if (process.env.NODE_ENV === "production") {
    try {
      // First get the current count
      const { data, error: fetchError } = await supabaseAdmin
        .from("artists")
        .select("view_count")
        .eq("artist_name", artistName)
        .single();

      if (fetchError) {
        console.error("Error fetching view count:", fetchError);
        return;
      }

      const currentCount = data?.view_count || 0;

      // Then update it
      const { error: updateError } = await supabaseAdmin
        .from("artists")
        .update({
          view_count: currentCount + 1,
        })
        .eq("artist_name", artistName);

      if (updateError) {
        console.error("Error updating view count:", updateError);
      }
    } catch (error) {
      console.error("Unexpected error in incrementViewCount:", error);
    }
  } else {
    console.log("View count not incremented - not in production");
  }
}
