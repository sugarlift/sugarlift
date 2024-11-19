"use server";

import { supabase } from "@/lib/supabase";

export async function incrementViewCount(
  firstName: string,
  lastName: string,
  currentCount: number | undefined,
  slug: string,
) {
  // Only increment view count in production
  if (process.env.NODE_ENV === "production") {
    await supabase
      .from("artists")
      .update({
        view_count: currentCount ? currentCount + 1 : 1,
      })
      .eq("first_name", firstName)
      .eq("last_name", lastName);
  }
}
