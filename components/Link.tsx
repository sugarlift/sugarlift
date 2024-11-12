"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, MouseEvent } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

export function QuickLink({ children, href, onClick, ...props }: LinkProps) {
  const router = useRouter();
  const hrefString = typeof href === "object" ? href.pathname || "/" : href;

  const handleMouseDown = (e: MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      router.push(hrefString);
    }
  };

  return (
    <NextLink
      href={href}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      {...props}
    >
      {children}
    </NextLink>
  );
}
