import { QuickLink } from "@/components/Link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  href?: string;
  link?: boolean;
  pageTitle?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  href,
  link = false,
  pageTitle = false,
  className = "mb-4 md:mb-[1.33vw]",
}: SectionHeaderProps) {
  const HeadingTag = pageTitle ? "h1" : "h2";

  if (link && href) {
    return (
      <div className={className}>
        <QuickLink
          href={href}
          className="group flex items-center text-zinc-800 transition hover:text-zinc-950"
        >
          <HeadingTag>{title}</HeadingTag>
          <ArrowRight
            className="-me-1 ms-1 mt-0.5 h-4 transition-transform group-hover:translate-x-1 lg:ms-2 lg:mt-1 lg:h-10"
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </QuickLink>
      </div>
    );
  }

  return (
    <div className={className}>
      <HeadingTag>{title}</HeadingTag>
    </div>
  );
}
