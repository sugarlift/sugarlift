import Image from "next/image";
import Link from "next/link";
import { Project } from "../app/lib/markdownProjects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`} className="group">
      <div className="relative aspect-[4/3] mb-4 overflow-hidden">
        <Image
          src={project.frontmatter.coverImage}
          alt={project.frontmatter.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h3 className="font-medium mb-2">{project.frontmatter.title}</h3>
      <p className="text-gray-600">{project.frontmatter.location}</p>
    </Link>
  );
}
