import { supabaseAdmin } from "@/lib/supabase";

export async function addRatingColumnsToArtworkTable() {
  try {
    console.log("Starting migration: Adding rating columns to artwork table");

    // Check if columns already exist
    const { data: existingColumns, error: columnsError } = await supabaseAdmin
      .from("artwork")
      .select("likes")
      .limit(1);

    if (columnsError) {
      // If the error is because the column doesn't exist, proceed with migration
      console.log("Columns don't exist yet, proceeding with migration");
    } else if (existingColumns) {
      console.log("Rating columns already exist, skipping migration");
      return { success: true, message: "Columns already exist" };
    }

    // Add likes column with default value 0
    const { error: likesError } = await supabaseAdmin.rpc(
      "add_column_if_not_exists",
      {
        table_name: "artwork",
        column_name: "likes",
        column_type: "integer",
        default_value: "0",
      },
    );

    if (likesError) {
      console.error("Error adding likes column:", likesError);
      return { success: false, error: likesError };
    }

    // Add dislikes column with default value 0
    const { error: dislikesError } = await supabaseAdmin.rpc(
      "add_column_if_not_exists",
      {
        table_name: "artwork",
        column_name: "dislikes",
        column_type: "integer",
        default_value: "0",
      },
    );

    if (dislikesError) {
      console.error("Error adding dislikes column:", dislikesError);
      return { success: false, error: dislikesError };
    }

    // Add loves column with default value 0
    const { error: lovesError } = await supabaseAdmin.rpc(
      "add_column_if_not_exists",
      {
        table_name: "artwork",
        column_name: "loves",
        column_type: "integer",
        default_value: "0",
      },
    );

    if (lovesError) {
      console.error("Error adding loves column:", lovesError);
      return { success: false, error: lovesError };
    }

    console.log("Migration completed successfully");
    return { success: true, message: "Added rating columns to artwork table" };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  }
}
