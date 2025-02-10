import { COMPANY_METADATA } from "@/app/lib/constants";
import { QuickLink } from "@/components/Link";
import Logo from "@/components/Logo";

const Footer = () => {
  const headingStyle = "mb-2 font-medium";
  const linkStyle = "text-sm text-zinc-600 hover:text-zinc-950 py-0.5 block";

  return (
    <footer className="mt-auto w-full border-t">
      <div className="container py-10 md:py-[4vw]">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-7">
          {/* Logo and Description */}
          <div className="col-span-2 mt-1">
            <div className="block">
              <span className="sr-only">{COMPANY_METADATA.name}</span>
              <Logo />
            </div>
            <p className="mb-0 mt-4 max-w-none text-sm leading-6 tracking-tight text-zinc-700 md:mb-8 md:max-w-48">
              Mission-driven art gallery founded in 2014
            </p>
            <QuickLink
              href="https://instagram.com/sugarlift"
              className="text-sm text-zinc-700 hover:text-zinc-950"
              target="_blank"
              rel="noopener noreferrer"
            >
              @sugarlift
            </QuickLink>
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
            <h3 className={`${headingStyle} mt-8`}>Exhibitions</h3>
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
            </ul>
          </div>

          <div>
            <h3 className={headingStyle}>Sugarlift</h3>
            <ul>
              <li>
                <QuickLink href="/about" className={linkStyle}>
                  About
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/about#mission" className={linkStyle}>
                  Mission
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/about#faq" className={linkStyle}>
                  FAQ
                </QuickLink>
              </li>
              <li>
                <QuickLink href="/about#contact" className={linkStyle}>
                  Contact
                </QuickLink>
              </li>
            </ul>
          </div>

          {/* Gallery Info */}
          <div>
            <h3 className={headingStyle}>Gallery</h3>
            <div>
              <div className="flex justify-between">
                <p className="text-sm text-zinc-700">Tue - Fri</p>
                <p className="text-sm text-zinc-700">10AM – 6PM</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-zinc-700">Sat</p>
                <p className="text-sm text-zinc-700">12PM – 6PM</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm text-zinc-700">Sun - Mon</p>
                <p className="text-sm text-zinc-700">Closed</p>
              </div>

              <QuickLink
                href="#"
                className={`${linkStyle} mt-4 leading-6`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="block">508 W 28th Street</span>
                <span>New York, NY</span>
              </QuickLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
