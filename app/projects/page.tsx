// app/projects/page.tsx
import { getAllProjects } from "../lib/markdownProjects";
import ProjectCard from "@/components/ProjectCard";
import type { ProjectFrontmatter } from "../lib/markdownProjects";

const categories: ProjectFrontmatter["category"][] = [
  "Multi-Family",
  "Workplace",
  "Healthcare",
  "Affordable",
];

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Featured projects</h1>

      {/* Category Filter */}
      <div className="flex gap-6 mb-12">
        <button className="font-medium">All projects</button>
        {categories.map((category) => (
          <button key={category} className="text-gray-500 hover:text-gray-900">
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold mb-8">Frequently asked questions</h2>
        <div className="space-y-6">
          <details className="group">
            <summary className="flex justify-between items-center cursor-pointer">
              <span>How to work with Sugarlift?</span>
              <span className="transition group-open:rotate-180">▼</span>
            </summary>
            <p className="mt-4 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
          </details>
          {/* Add more FAQ items as needed */}
        </div>
      </section>

      {/* Partners Section */}
      <section className="text-center mb-16">
        <h2 className="text-2xl font-bold max-w-2xl mx-auto mb-12">
          We are proud to partner with some of the leading design firms and
          brands in the industry.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8 items-center">
          {/* Partner logos would go here */}
        </div>
      </section>
    </div>
  );
}
