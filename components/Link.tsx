"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { ComponentProps, MouseEvent, TouchEvent } from "react";

type LinkProps = ComponentProps<typeof NextLink>;

export function Link({ children, href, onClick, ...props }: LinkProps) {
  const router = useRouter();
  const hrefString = typeof href === "object" ? href.pathname || "/" : href;

  const handleActivation = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    router.push(hrefString);
  };

  return (
    <NextLink
      href={href}
      onClick={onClick}
      onMouseDown={(e) => e.button === 0 && handleActivation(e)}
      onTouchStart={handleActivation}
      {...props}
    >
      {children}
    </NextLink>
  );
}
