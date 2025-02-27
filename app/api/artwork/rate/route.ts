import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { artworkId, ratingType } = await request.json();

    if (!artworkId || !ratingType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (!["like", "dislike", "love"].includes(ratingType)) {
      return NextResponse.json(
        { error: "Invalid rating type" },
        { status: 400 },
      );
    }

    // First, get the current counts
    const { data, error } = await supabaseAdmin
      .from("artwork")
      .select("likes, dislikes, loves")
      .eq("id", artworkId)
      .single();

    if (error) {
      console.error("Error fetching current ratings:", error);
      return NextResponse.json(
        { error: "Failed to fetch artwork" },
        { status: 500 },
      );
    }

    // Update the appropriate count
    const updates: { likes?: number; dislikes?: number; loves?: number } = {};

    if (ratingType === "like") {
      updates.likes = (data?.likes || 0) + 1;
    } else if (ratingType === "dislike") {
      updates.dislikes = (data?.dislikes || 0) + 1;
    } else if (ratingType === "love") {
      updates.loves = (data?.loves || 0) + 1;
    }

    // Update the artwork with the new count
    const { error: updateError } = await supabaseAdmin
      .from("artwork")
      .update(updates)
      .eq("id", artworkId);

    if (updateError) {
      console.error("Error updating rating:", updateError);
      return NextResponse.json(
        { error: "Failed to update rating" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
