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

    // Get the table
    const table = getArtworkTable();

    // Get records that are marked for production and have a Record_ID
    const records = await table
      .select({
        filterByFormula: `
          AND(
            {ADD TO PRODUCTION} = 1,
            NOT({Record_ID} = ''),
            OR(
              {Synced} = '',
              {Synced} = 0,
              IS_BEFORE({Last Modified}, NOW())
            )
          )
        `,
        maxRecords: 1,
      })
      .firstPage();

    if (records.length === 0) {
      console.log("No new records to sync");
      return NextResponse.json({ message: "No new records to process" });
    }

    const record = records[0];
    console.log(
      `Processing new record with Record_ID: ${record.get("Record_ID")}`,
    );

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
      id: record.get("Record_ID") as string,
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

    // Upsert to Supabase using the Record_ID as the key
    const { error: upsertError } = await supabaseAdmin
      .from("artwork")
      .upsert(artwork, {
        onConflict: "id",
      });

    if (upsertError) throw upsertError;

    console.log(`Successfully processed: ${artwork.title}`);

    // After successful upsert to Supabase, mark the record as synced in Airtable
    await table.update([
      {
        id: record.id,
        fields: {
          Synced: true,
        },
      },
    ]);

    return NextResponse.json({
      message: "Artwork sync completed",
      timestamp: new Date().toISOString(),
      result: {
        success: true,
        processedCount: 1,
        recordId: record.get("Record_ID"),
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
