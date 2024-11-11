"use client";

import { useState } from "react";
import { Link } from "@/components/Link";
import { COMPANY_METADATA } from "../app/lib/constants";
import { Dialog, DialogPanel } from "@headlessui/react";
import { usePathname } from "next/navigation";
import Logo from "../components/Logo";

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
    <header className="sticky top-0 border-b-[1px] border-[#F1F1F0]">
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
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`${navPadding} inline-flex items-center justify-center rounded-md text-gray-700`}
          >
            <span className="sr-only">Open main menu</span>
            OPEN
          </button>
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
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="md:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link href="/" className="">
              <span className="sr-only">{COMPANY_METADATA.name}</span>
              <Logo />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              CLOSE
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
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
        </DialogPanel>
      </Dialog>
    </header>
  );
}
