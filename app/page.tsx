import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";

export default function Home() {
  return (
    <main className="container py-8">
      <h1 className="mb-6 text-2xl font-bold">Featured Exhibitions</h1>
      <FeaturedExhibitions exhibitions={["celia-lees-love-language"]} />

      <h1 className="mb-6 mt-12 text-2xl font-bold">Featured Projects</h1>
      <div className="grid gap-0">
        <FeaturedProjects projects={["450-washington"]} />
      </div>
    </main>
  );
}
