"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { COMPANY_METADATA } from "@/app/lib/constants";
import { Dialog } from "@headlessui/react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import "@/components/Navigation/MenuButton.scss";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Artists", href: "#" },
  { name: "Exhibitions", href: "/exhibitions" },
  { name: "Art consulting", href: "/projects" },
];

const CTA = [{ name: "Contact", href: "#" }];

const linkStyles =
  "text-[#141414] px-6 py-8 text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] transition hover:opacity-50";
const linkStylesActive =
  "border-b-[1px] border-black transition animate fade-in";
const mobileLinkStyles =
  "block text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] text-[#141414]";
const mobileLinkStylesActive =
  "border-b-[1px] border-black transition animate fade-in";
const navPadding = "px-6 py-8";

export default function Example() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

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
    <header className="sticky top-0 z-50 border-b-[1px] border-[#F1F1F0] bg-white">
      <nav
        aria-label="Global"
        className="mx-auto flex max-w-[1488px] items-center justify-between"
      >
        <div className="flex">
          <Link
            href="/"
            className={`${navPadding} transition hover:opacity-50`}
          >
            <span className="sr-only">{COMPANY_METADATA.name}</span>
            <Logo />
          </Link>
        </div>
        <div className="mr-6 flex md:hidden">
          <label className="menu">
            <input
              type="checkbox"
              checked={mobileMenuOpen}
              onChange={(e) => setMobileMenuOpen(e.target.checked)}
            />
            <div>
              <span></span>
              <span></span>
            </div>
          </label>
        </div>
        <div className="hidden md:flex">
          {navigation.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${linkStyles} ${active ? linkStylesActive : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="hidden md:flex md:justify-end">
          {CTA.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${linkStyles} ${active ? linkStylesActive : ""}`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
      <AnimatePresence>
        {mobileMenuOpen && (
          <Dialog open={true} onClose={setMobileMenuOpen} className="md:hidden">
            <div className="fixed inset-0 z-20" />
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(e, { offset, velocity }) => {
                if (offset.y < -50 || velocity.y < -500) {
                  setMobileMenuOpen(false);
                }
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 top-[73px] z-30 mb-10 w-full overflow-y-auto bg-[#ffffff80] px-6 py-6 backdrop-blur-3xl"
            >
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/10">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => {
                      const active = isActive(item.href, pathname);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`${mobileLinkStyles} ${
                            active ? mobileLinkStylesActive : ""
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                  <div className="py-6">
                    {CTA.map((item) => {
                      const active = isActive(item.href, pathname);
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`${mobileLinkStyles} ${
                            active ? mobileLinkStylesActive : ""
                          }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                <div className="h-1 w-16 rounded-full bg-gray-600" />
              </div>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </header>
  );
}
