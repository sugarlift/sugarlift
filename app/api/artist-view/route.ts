import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const { firstName, lastName, currentCount, slug } = await request.json();

  const cookieStore = await cookies();
  const viewedCookie = cookieStore.get(`viewed-artist-${slug}`);

  if (!viewedCookie) {
    await supabase
      .from("artists")
      .update({
        view_count: currentCount ? currentCount + 1 : 1,
      })
      .eq("first_name", firstName)
      .eq("last_name", lastName);

    cookieStore.set(`viewed-artist-${slug}`, "true", {
      maxAge: 24 * 60 * 60, // 24 hours
    });

    revalidatePath("/artists");
  }

  return NextResponse.json({ success: true });
}
