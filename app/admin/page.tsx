import { SyncPanel } from "@/components/admin/SyncPanel";
import { PasswordProtection } from "@/components/admin/PasswordProtection";
import { Metadata } from "next";
import { DeployButton } from "./components/DeployButton";
import { COMPANY_METADATA } from "@/app/lib/constants";

export const metadata: Metadata = {
  title: "Admin | Data Sync",
  description: "Manage Airtable to Supabase synchronization",
  alternates: {
    canonical: `${COMPANY_METADATA.url}/admin`,
  },
  openGraph: {
    title: "Admin | Data Sync",
    description: "Manage Airtable to Supabase synchronization",
    url: `${COMPANY_METADATA.url}/admin`,
    siteName: COMPANY_METADATA.name,
    images: [
      {
        url: `${COMPANY_METADATA.url}/og-image.jpg`,
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function AdminPage() {
  return (
    <PasswordProtection>
      <div className="container min-h-[65vh] py-16">
        <h1 className="mb-8 text-2xl font-semibold">Data Synchronization</h1>
        <div className="grid grid-cols-1 space-y-8 md:grid-cols-2 md:space-x-8 md:space-y-0">
          <SyncPanel
            title="Artwork Sync"
            description="Sync artwork data from Airtable to Supabase"
            endpoint="/api/sync/artwork"
          />
          <SyncPanel
            title="Artist Sync"
            description="Sync artist data from Airtable to Supabase"
            endpoint="/api/sync/artists"
          />
        </div>

        <div className="mt-12">
          <DeployButton />
        </div>
      </div>
    </PasswordProtection>
  );
}
