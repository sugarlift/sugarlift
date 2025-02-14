"use server";

import { supabaseAdmin } from "@/lib/supabase";

// Keep track of recent views to prevent duplicate counts
const recentViews = new Map<string, number>();
const DEBOUNCE_TIME = 60000; // 1 minute in milliseconds

export async function incrementViewCount({
  artistName,
}: {
  artistName: string;
}) {
  console.log(`Attempting to increment view count for ${artistName}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);

  // Only increment view count in production
  if (process.env.NODE_ENV === "production") {
    try {
      // Check if this artist was viewed recently
      const lastView = recentViews.get(artistName);
      const now = Date.now();

      if (lastView && now - lastView < DEBOUNCE_TIME) {
        console.log(
          `Skipping duplicate view for ${artistName} (last view: ${new Date(lastView).toISOString()})`,
        );
        return;
      }

      // Update last view time
      recentViews.set(artistName, now);
      console.log(
        `Setting new view time for ${artistName}: ${new Date(now).toISOString()}`,
      );

      // First get the current count
      const { data, error: fetchError } = await supabaseAdmin
        .from("artists")
        .select("artist_name, view_count")
        .eq("artist_name", artistName)
        .single();

      if (fetchError) {
        console.error("Error fetching view count:", fetchError);
        return;
      }

      const currentCount = data?.view_count || 0;
      console.log(`Current view count for ${artistName}: ${currentCount}`);

      // Then update it
      const { error: updateError } = await supabaseAdmin
        .from("artists")
        .update({
          view_count: currentCount + 1,
        })
        .eq("artist_name", artistName);

      if (updateError) {
        console.error("Error updating view count:", updateError);
      } else {
        console.log(
          `Successfully updated view count for ${artistName} from ${currentCount} to ${currentCount + 1}`,
        );
      }
    } catch (error) {
      console.error("Unexpected error in incrementViewCount:", error);
    }
  } else {
    console.log("View count not incremented - not in production");
  }
}
