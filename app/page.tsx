import { FeaturedExhibitions } from "@/components/FeaturedExhibitions";
import { FeaturedProjects } from "@/components/FeaturedProjects";

export default function Home() {
  return (
    <main className="container py-12">
      <h1 className="mb-6 text-2xl font-bold">Featured Exhibitions</h1>
      <div className="grid grid-cols-1 gap-8">
        <FeaturedExhibitions exhibitions={["celia-lees-love-language"]} />
      </div>

      <h1 className="mb-6 mt-12 text-2xl font-bold">Featured Projects</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FeaturedProjects projects={["450-washington", "450-washington-2"]} />
      </div>
    </main>
  );
}
