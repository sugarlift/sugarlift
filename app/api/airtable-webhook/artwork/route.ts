import { NextResponse } from "next/server";
import { getArtworkTable } from "@/lib/airtable";
import { supabaseAdmin } from "@/lib/supabase";
import { Artwork, StoredAttachment, AirtableAttachment } from "@/lib/types";

async function uploadArtworkImageToSupabase(
  attachment: AirtableAttachment,
  artwork: { title: string },
): Promise<StoredAttachment> {
  const folderName = artwork.title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${folderName}/${cleanFilename}`;

  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("attachments_artwork")
    .upload(storagePath, blob, {
      contentType: attachment.type,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage
    .from("attachments_artwork")
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
    console.log(
      "Received artwork webhook payload:",
      JSON.stringify(payload, null, 2),
    );

    // Get the record ID from the webhook payload
    let recordId;

    // Handle payload.payloads array structure
    if (payload.payloads && Array.isArray(payload.payloads)) {
      const latestPayload = payload.payloads[0]; // Get the most recent payload

      if (latestPayload.changedTablesById) {
        const tableIds = Object.keys(latestPayload.changedTablesById);
        if (tableIds.length > 0) {
          const tableChanges = latestPayload.changedTablesById[tableIds[0]];
          if (tableChanges.changedRecordsById) {
            // Get the first changed record ID
            recordId = Object.keys(tableChanges.changedRecordsById)[0];
          }
        }
      }
    }

    console.log("Extracted recordId:", recordId);

    if (!recordId) {
      console.log("No record ID provided, running full sync");
      // If no record ID, fall back to full sync
      const { syncArtworkToSupabase } = await import(
        "@/lib/syncArtworkToSupabase"
      );
      return NextResponse.json(await syncArtworkToSupabase());
    }

    console.log(`Processing record: ${recordId}`);

    // Get the specific record from Airtable
    const table = getArtworkTable();
    const record = await table.find(recordId);

    // Check if record should be in production
    const isProduction = record.get("ADD TO PRODUCTION");
    if (!isProduction) {
      console.log(`Record ${recordId} is not marked for production, skipping`);
      return NextResponse.json({
        message: "Record skipped - not marked for production",
        recordId,
      });
    }

    // Process images
    const rawAttachments = record.get("Artwork images");
    const artwork_images: StoredAttachment[] = [];

    if (Array.isArray(rawAttachments)) {
      for (const att of rawAttachments) {
        const attachment = await uploadArtworkImageToSupabase(att, {
          title: record.get("Title") as string,
        });
        artwork_images.push(attachment);
      }
    }

    // Create artwork object
    const artwork: Artwork = {
      id: record.id,
      title: (record.get("Title") as string) || null,
      artwork_images,
      medium: (record.get("Medium") as string) || null,
      year: record.get("Year") ? Number(record.get("Year")) : null,
      width: (record.get("Width (e.)") as string) || null,
      height: (record.get("Height (e.)") as string) || null,
      live_in_production: true,
      artist_name: (record.get("Artist") as string) || null,
      type: (record.get("Type") as string) || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Upsert to Supabase
    const { error: upsertError } = await supabaseAdmin
      .from("artwork")
      .upsert(artwork);

    if (upsertError) throw upsertError;

    console.log(`Successfully processed: ${artwork.title}`);

    return NextResponse.json({
      message: "Artwork sync completed",
      timestamp: new Date().toISOString(),
      result: {
        success: true,
        processedCount: 1,
        recordId,
        title: artwork.title,
      },
    });
  } catch (error) {
    console.error("Artwork webhook error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      status: error instanceof Error ? error.cause : undefined,
      response: error instanceof Error ? error.stack : undefined,
      error,
    });

    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
