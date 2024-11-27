// components/ProjectCard.tsx

import Image from "next/image";
import Link from "next/link";
import { type Project } from "@/app/lib/markdownProjects";
import { ComponentType } from "react";
import { LinkProps } from "next/link";

interface ProjectCardProps {
  project: Project;
  LinkComponent?: ComponentType<LinkProps & { children: React.ReactNode }>;
  priority?: boolean;
}

export const ProjectCard = ({
  project,
  LinkComponent = Link,
  priority = false,
}: ProjectCardProps) => {
  const {
    frontmatter: { coverImage, title, location, client, architect },
  } = project;

  return (
    <LinkComponent href={`/art-consulting/projects/${project.slug}`}>
      <div className="relative aspect-video w-full">
        <Image
          src={coverImage}
          alt={`Cover image for ${title}`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
      <div className="p-4 pl-0">
        <h3 className="text-zinc-700">{title}</h3>
        <p className="mt-0.5 text-sm tracking-tight text-zinc-500">
          {location}, {client}, {architect}
        </p>
      </div>
    </LinkComponent>
  );
};
