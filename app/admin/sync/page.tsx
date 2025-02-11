import { SyncPanel } from "@/components/admin/SyncPanel";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Data Sync",
  description: "Manage Airtable to Supabase synchronization",
};

export default function AdminSyncPage() {
  return (
    <div className="container py-8">
      <h1 className="mb-8 text-2xl font-semibold">Data Synchronization</h1>
      <div className="space-y-8">
        <SyncPanel
          title="Artwork Sync"
          description="Sync artwork data from Airtable to Supabase"
          endpoint="/api/sync/artwork"
        />
      </div>
    </div>
  );
}
