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
    frontmatter: { coverImage, title, artist },
  } = project;

  return (
    <LinkComponent href={`/projects/${project.slug}`}>
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
        <h3 className="text-xl tracking-tight">{title}</h3>
        <p className="mt-2 text-gray-800">{artist}</p>
      </div>
    </LinkComponent>
  );
};
