import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Featured Exhibitions</h1>
      <FeaturedExhibitions exhibitions={["celia-lees-love-language"]} />

      <h1 className="mb-8 mt-12 text-4xl font-bold">Featured Projects</h1>
      <FeaturedProjects projects={["450-washington"]} />
    </main>
  );
}
