import { NextResponse } from "next/server";
import { getArtistsTable } from "@/lib/airtable";
import { supabaseAdmin } from "@/lib/supabase";
import { Artist, StoredAttachment, AirtableAttachment } from "@/lib/types";

async function uploadArtistPhotoToSupabase(
  attachment: AirtableAttachment,
  artist: { artist_name: string },
): Promise<StoredAttachment> {
  const folderName = artist.artist_name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${folderName}/${cleanFilename}`;

  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("attachments_artists")
    .upload(storagePath, blob, {
      contentType: attachment.type,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("attachments_artists")
    .getPublicUrl(storagePath);

  return {
    url: publicUrl,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}

export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const webhookSecret = request.headers.get("x-airtable-webhook-secret");
    if (webhookSecret !== process.env.AIRTABLE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    console.log("Received artist webhook payload:", payload);

    // Get the record ID from the webhook payload
    const recordId = payload.recordId;
    if (!recordId) {
      console.log("No record ID provided, running full sync");
      // If no record ID, fall back to full sync
      const { syncArtistsToSupabase } = await import(
        "@/lib/syncArtistsToSupabase"
      );
      return NextResponse.json(await syncArtistsToSupabase());
    }

    console.log(`Processing artist record: ${recordId}`);

    // Get the specific record from Airtable
    const table = getArtistsTable();
    const record = await table.find(recordId);

    // Check if record should be in production
    const isProduction = record.get("Add to Website");
    if (!isProduction) {
      console.log(
        `Artist record ${recordId} is not marked for production, skipping`,
      );
      return NextResponse.json({
        message: "Record skipped - not marked for production",
        recordId,
      });
    }

    // Process photos
    const rawPhotos = record.get("Artist Photo");
    const artist_photo: StoredAttachment[] = [];

    if (Array.isArray(rawPhotos)) {
      for (const att of rawPhotos) {
        const attachment = await uploadArtistPhotoToSupabase(att, {
          artist_name: record.get("Artist Name") as string,
        });
        artist_photo.push(attachment);
      }
    }

    // Create artist object
    const artist: Artist = {
      id: record.id,
      artist_name: (record.get("Artist Name") as string) || "Unknown Artist",
      artist_bio: (record.get("Artist Bio") as string) || null,
      born: (record.get("Born") as string) || null,
      city: (record.get("City") as string) || null,
      state: (record.get("State (USA)") as string) || null,
      country: (record.get("Country") as string) || null,
      ig_handle: (record.get("IG Handle") as string) || null,
      website: (record.get("Website") as string) || null,
      live_in_production: true,
      artist_photo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert to Supabase
    const { error: upsertError } = await supabaseAdmin
      .from("artists")
      .upsert(artist);

    if (upsertError) throw upsertError;

    console.log(`Successfully processed artist: ${artist.artist_name}`);

    return NextResponse.json({
      message: "Artist sync completed",
      timestamp: new Date().toISOString(),
      result: {
        success: true,
        processedCount: 1,
        recordId,
        name: artist.artist_name,
      },
    });
  } catch (error) {
    console.error("Artist webhook error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      status: error instanceof Error ? error.cause : undefined,
      response: error instanceof Error ? error.stack : undefined,
      error,
    });

    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
