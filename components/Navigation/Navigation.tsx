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
  { name: "Clients", href: "/clients" },
];

const CTA = [{ name: "About", href: "/about" }];

// Combine navigation items for mobile
const mobileNavItems = [...navigation, ...CTA];

// Update container animation variants
const containerVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.05,
    },
  },
};

// Add item animation variants
const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const linkStyles =
  "text-zinc-700 py-8 text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] transition hover:text-zinc-950";
const linkStylesActive =
  "shadow-[inset_0_-1px_white,_0_1px_black] transition animate fade-in";
const mobileLinkStyles = "block text-3xl tracking-tight text-zinc-700 pb-1";
const mobileLinkStylesActive = "underline-offset-4 ";

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
        className={`relative z-50 mx-auto flex max-w-[1536px] items-center justify-between`}
      >
        <div className="flex">
          <QuickLink
            href="/"
            className="px-8 py-6 transition hover:opacity-50 md:p-8 md:px-12"
            onClick={() => setMobileMenuOpen(false)}
          >
            <span className="sr-only">{COMPANY_METADATA.name}</span>
            <Logo />
          </QuickLink>
        </div>
        <div className="mr-0 flex md:hidden">
          <Button
            className="group px-10 py-7"
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="pointer-events-none scale-110"
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
                className={`${linkStyles} ${active ? linkStylesActive : ""} px-3 lg:px-6`}
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
                className={`${linkStyles} ${active ? linkStylesActive : ""} px-12`}
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
              className="fixed inset-0 z-20 h-[100vh] bg-zinc-700/90 pt-[60px] md:hidden"
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
              className="fixed inset-y-0 right-0 z-30 mb-10 h-[90dvh] w-full overflow-y-auto rounded-bl-2xl rounded-br-2xl bg-white px-8 py-6 pt-[60px] backdrop-blur-3xl md:hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: "-10%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: "-10%",
                  transition: { duration: 0.075, delay: 0 },
                }}
                transition={{ duration: 0.2, delay: 0.2, ease: "easeInOut" }}
                className="mt-6 flow-root"
              >
                <div>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-2 py-2"
                  >
                    {mobileNavItems.map((item) => {
                      const active = isActive(item.href, pathname);
                      return (
                        <motion.div key={item.name} variants={itemVariants}>
                          <QuickLink
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`${mobileLinkStyles} ${
                              active ? mobileLinkStylesActive : ""
                            }`}
                          >
                            {item.name}
                          </QuickLink>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </motion.div>
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
