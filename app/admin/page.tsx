import { SyncPanel } from "@/components/admin/SyncPanel";
import * as Auth from "@/components/admin/PasswordProtection";
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
    <Auth.PasswordProtection>
      <div className="container min-h-[65vh] py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Data Synchronization</h1>
          <Auth.LogoutButton />
        </div>
        <div className="grid grid-cols-1 space-y-8 md:grid-cols-2 md:space-x-8 md:space-y-0">
          <SyncPanel
            title="Artwork Sync"
            description="Sync artworks from Airtable to Supabase"
            endpoint="/api/sync/artwork"
          />
          <SyncPanel
            title="Artist Sync"
            description="Sync artists from Airtable to Supabase"
            endpoint="/api/sync/artists"
          />
        </div>

        <div className="mt-12">
          <DeployButton />
        </div>
      </div>
    </Auth.PasswordProtection>
  );
}
