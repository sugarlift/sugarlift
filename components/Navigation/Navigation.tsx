"use client";

import { useState, useEffect } from "react";
import { QuickLink } from "@/components/Link";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Artists", href: "/artists" },
  { name: "Exhibitions", href: "/exhibitions" },
  { name: "Art consulting", href: "/projects" },
];

const CTA = [{ name: "Contact", href: "#" }];

const linkStyles =
  "text-[#141414] px-6 py-8 text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] transition hover:opacity-50";
const linkStylesActive =
  "shadow-[inset_0_-1px_white,_0_1px_black] transition animate fade-in";
const mobileLinkStyles =
  "block text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] text-[#141414]";
const mobileLinkStylesActive = "";
const navPadding = "px-6 py-8";

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (mobileMenuOpen) {
      // Get scrollbar width by creating a temporary div
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Add padding to prevent layout shift
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.paddingRight = "0px";
      document.body.style.overflow = "unset";
    }

    return () => {
      document.documentElement.style.paddingRight = "0px";
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  function isActive(itemHref: string, pathname: string) {
    if (itemHref === "#") {
      return false;
    }
    if (itemHref === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(itemHref);
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b-[1px] border-[#F1F1F0] bg-white transition-[background-color] duration-300 ${
        mobileMenuOpen ? "bg-opacity-100" : "bg-opacity-85"
      } backdrop-blur-xl`}
    >
      <nav
        aria-label="Global"
        className={`relative z-50 mx-auto flex max-w-[1488px] items-center justify-between`}
      >
        <div className="flex">
          <QuickLink
            href="/"
            className={`${navPadding} transition hover:opacity-50`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">{COMPANY_METADATA.name}</span>
            <Logo />
          </QuickLink>
        </div>
        <div className="mr-6 flex md:hidden">
          <Button
            className="group"
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="pointer-events-none"
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 12L20 12"
                className="origin-center -translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
              />
              <path
                d="M4 12H20"
                className="origin-center transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
              />
              <path
                d="M4 12H20"
                className="origin-center translate-y-[7px] transition-all duration-300 [transition-timing-function:cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
              />
            </svg>
          </Button>
        </div>
        <div className="hidden md:flex">
          {navigation.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <QuickLink
                key={item.name}
                href={item.href}
                className={`${linkStyles} ${active ? linkStylesActive : ""}`}
              >
                {item.name}
              </QuickLink>
            );
          })}
        </div>
        <div className="hidden md:flex md:justify-end">
          {CTA.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <QuickLink
                key={item.name}
                href={item.href}
                className={`${linkStyles} ${active ? linkStylesActive : ""}`}
              >
                {item.name}
              </QuickLink>
            );
          })}
        </div>
      </nav>
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-20 h-[100vh] bg-gray-500 pt-[73px] opacity-50 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-30 mb-10 h-[80vh] w-full overflow-y-auto rounded-bl-2xl rounded-br-2xl bg-white px-6 py-6 pt-[73px] backdrop-blur-3xl md:hidden"
            >
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => {
                      const active = isActive(item.href, pathname);
                      return (
                        <QuickLink
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`${mobileLinkStyles} ${
                            active ? mobileLinkStylesActive : ""
                          }`}
                        >
                          {item.name}
                        </QuickLink>
                      );
                    })}
                  </div>
                  <div className="py-6">
                    {CTA.map((item) => {
                      const active = isActive(item.href, pathname);
                      return (
                        <QuickLink
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`${mobileLinkStyles} ${
                            active ? mobileLinkStylesActive : ""
                          }`}
                        >
                          {item.name}
                        </QuickLink>
                      );
                    })}
                  </div>
                </div>
              </div>
              <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.y < -50 || velocity.y < -500) {
                    setMobileMenuOpen(false);
                  }
                }}
                className="fixed bottom-0 left-0 right-0 z-50 cursor-grab active:cursor-grabbing"
                key="drag-handle"
              >
                <div className="flex h-16 w-full items-center justify-center">
                  <div className="h-1 w-16 rounded-full bg-gray-600" />
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
