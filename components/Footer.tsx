import { QuickLink } from "@/components/Link";
import Logo from "@/components/Logo";

const Footer = () => {
  // Define a constant for link styles
  const linkStyle = "text-sm text-gray-600 hover:text-gray-900";

  return (
    <footer className="mt-auto w-full border-t">
      <div className="container py-24">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-7">
          {/* Logo and Description */}
          <div className="col-span-2 space-y-4">
            <Logo />
            <p className="text-sm text-gray-600">
              Mission-driven art gallery
              <br />
              founded in 2014
            </p>
            <QuickLink
              href="https://instagram.com/sugarlift"
              className="text-sm text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              @sugarlift
            </QuickLink>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-4 font-medium">Artists</h3>
            <ul className="space-y-2">
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Featured
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Directory
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  On view
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Past
                </QuickLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Projects</h3>
            <ul className="space-y-2">
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Collectors
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Multi-Family
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Office
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Hospitality
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Healthcare
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Affordable
                </QuickLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Art consulting</h3>
            <ul className="space-y-2">
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Overview
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Process
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Testimonials
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  For designers
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  For developers
                </QuickLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Sugarlift</h3>
            <ul className="space-y-2">
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Mission
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  About
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Awards
                </QuickLink>
              </li>
              <li>
                <QuickLink href="#" className={linkStyle}>
                  Team
                </QuickLink>
              </li>
            </ul>
          </div>

          {/* Gallery Info */}
          <div>
            <h3 className="mb-4 font-medium">Gallery</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Tue - Fri: 10AM – 6PM</p>
              <p className="text-sm text-gray-600">Sat: 12PM – 6PM</p>
              <p className="text-sm text-gray-600">Sun - Mon: Closed</p>
              <QuickLink
                href="#"
                className={linkStyle}
                target="_blank"
                rel="noopener noreferrer"
              >
                508 W 28th Street
                <br />
                New York, NY
              </QuickLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
