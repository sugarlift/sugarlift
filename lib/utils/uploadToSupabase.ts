import { supabaseAdmin } from "@/lib/supabase";
import { StoredAttachment, AirtableAttachment } from "@/lib/types";

export async function uploadToSupabase(
  attachment: AirtableAttachment,
  options: {
    bucket: "attachments_artists" | "attachments_artwork";
    folderName: string;
  },
): Promise<StoredAttachment> {
  const { bucket, folderName } = options;

  const cleanFolderName = folderName
    .toLowerCase()
    .replace(/[^a-zA-Z0-9.-]/g, "-");
  const cleanFilename = attachment.filename
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .toLowerCase();
  const storagePath = `${cleanFolderName}/${cleanFilename}`;

  const response = await fetch(attachment.url);
  const blob = await response.blob();

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(storagePath, blob, {
      contentType: attachment.type,
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const {
    data: { publicUrl },
  } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);

  return {
    url: publicUrl,
    width: attachment.width,
    height: attachment.height,
    filename: attachment.filename,
    type: attachment.type,
  };
}
