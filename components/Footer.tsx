import Link from "next/link";
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
            <Link
              href="https://instagram.com/sugarlift"
              className="text-sm text-gray-600 hover:text-gray-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              @sugarlift
            </Link>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-4 font-medium">Artists</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className={linkStyle}>
                  Featured
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Directory
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  On view
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Past
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Projects</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className={linkStyle}>
                  Collectors
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Multi-Family
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Office
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Hospitality
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Healthcare
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Affordable
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Art consulting</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className={linkStyle}>
                  Overview
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Process
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  For designers
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  For developers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-medium">Sugarlift</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className={linkStyle}>
                  Mission
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Awards
                </Link>
              </li>
              <li>
                <Link href="#" className={linkStyle}>
                  Team
                </Link>
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
              <Link
                href="#"
                className={linkStyle}
                target="_blank"
                rel="noopener noreferrer"
              >
                508 W 28th Street
                <br />
                New York, NY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
