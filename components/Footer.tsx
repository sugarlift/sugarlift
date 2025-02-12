import { COMPANY_METADATA } from "@/app/lib/constants";
import { QuickLink } from "@/components/Link";
import Logo from "@/components/Logo";

const Footer = () => {
  const headingStyle = "mb-2 font-medium";
  const linkStyle = "text-sm text-zinc-600 hover:text-zinc-950 py-0.5 block";

  return (
    <footer className="mt-auto w-full border-t">
      <div className="container py-10 md:py-[4vw]">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-6">
          {/* Logo and Description */}
          <div className="col-span-1 mt-1 md:col-span-3">
            <div className="block">
              <span className="sr-only">{COMPANY_METADATA.name}</span>
              <Logo />
            </div>
            <p className="mt-4 max-w-none text-sm leading-6 tracking-tight text-zinc-700 md:max-w-[45ch]">
              Sugarlift is a contemporary art gallery based in New York City.
            </p>
            <QuickLink
              href="https://instagram.com/sugarlift"
              className="text-sm text-zinc-700 hover:text-zinc-950"
              target="_blank"
              rel="noopener noreferrer"
            >
              Follow @sugarlift on Instagram
            </QuickLink>
            <p className="mt-12 hidden text-sm text-zinc-700 md:block">
              @ Sugarlift 2025
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className={headingStyle}>Artists</h3>
            <ul>
              <li>
                <QuickLink href="/artists" className={linkStyle}>
                  Directory
                </QuickLink>
              </li>
            </ul>
            <h3 className={`${headingStyle} mt-10`}>Exhibitions</h3>
            <ul>
              <li>
                <QuickLink href="/exhibitions" className={linkStyle}>
                  Featured exhibitions
                </QuickLink>
              </li>
              <li>
                <QuickLink
                  href="/exhibitions#past-exhibitions"
                  className={linkStyle}
                >
                  Past exhibitions
                </QuickLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingStyle}>Clients</h3>
            <ul>
              <li>
                <QuickLink href="/clients" className={linkStyle}>
                  Featured clients
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/clients#Commercial" className={linkStyle}>
                  Commercial
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/clients#Residential" className={linkStyle}>
                  Residential
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/clients#Hospitality" className={linkStyle}>
                  Hospitality
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/clients#faq" className={linkStyle}>
                  FAQ
                </QuickLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className={headingStyle}>Sugarlift</h3>
            <p className={`${linkStyle}`}>43-01 22nd Street</p>
            <p className={`${linkStyle}`}>Studio 130 + 131</p>
            <p className={`${linkStyle} mb-[24px]`}>
              Long Island City, NY 11101
            </p>
            <ul>
              <li>
                <QuickLink href="/about" className={linkStyle}>
                  About
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/contact" className={linkStyle}>
                  Contact
                </QuickLink>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <p className="mt-0 block border-t p-8 text-sm text-zinc-700 md:hidden">
        @ Sugarlift 2025
      </p>
    </footer>
  );
};

export default Footer;
