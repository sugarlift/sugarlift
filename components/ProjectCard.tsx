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
    frontmatter: { coverImage, title, location, developer, architect },
  } = project;

  return (
    <LinkComponent href={`/clients/${project.slug}`}>
      <div className="group">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <Image
            src={coverImage}
            alt={`Cover image for ${title}`}
            quality={50}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={priority}
            loading={priority ? "eager" : "lazy"}
          />
        </div>
        <div className="p-3 pl-0 md:p-4 md:pl-0">
          <h3 className="text-zinc-700">{title}</h3>
          <p className="text-sm tracking-tight text-zinc-500 md:mt-0.5">
            {developer}, {architect}
          </p>
          <p className="text-sm tracking-tight text-zinc-500 md:mt-0.5">
            {location}
          </p>
        </div>
      </div>
    </LinkComponent>
  );
};
