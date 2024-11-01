"use client";

import { useState } from "react";
import Link from "next/link";
import { COMPANY_METADATA } from "../app/lib/constants";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";
import Logo from "../components/Logo";

const navigation = [
  { name: "Artists", href: "#" },
  { name: "Exhibitions", href: "/exhibitions" },
  { name: "Art consulting", href: "/projects" },
];

const CTA = [{ name: "Contact", href: "/contact" }];

const linkStyles =
  "text-[#141414] px-6 py-8 text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] transition";
const linkStylesActive =
  "border-b-[1px] border-black transition animate fade-in";
const mobileLinkStyles =
  "block text-[0.8125rem] font-medium uppercase tracking-[0.09375rem] text-[#141414]";
const mobileLinkStylesActive =
  "border-b-[1px] border-black transition animate fade-in";

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
        className="mx-auto flex max-w-7xl items-center justify-between"
      >
        <div className="flex lg:flex-1">
          <Link
            href="/"
            className="px-6 py-7 transition hover:opacity-50 lg:p-8"
          >
            <span className="sr-only">{COMPANY_METADATA.name}</span>
            <Logo />
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex items-center justify-center rounded-md px-6 py-7 text-gray-700 lg:p-8"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <div className="hidden lg:flex">
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
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
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
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10" />
        <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
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
              <XMarkIcon aria-hidden="true" className="h-6 w-6" />
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
