import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & about */}
          <div>
            <span className="font-heading text-xl font-bold">Penguin Trailers</span>
            <p className="mt-3 text-sm text-white/70 font-body leading-relaxed">
              Boutique used trailer dealer serving Ontario and all of Canada since 2006.
              Dry vans, reefers, and container chassis.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li><Link href="/inventory" className="hover:text-white transition-colors">Inventory</Link></li>
              <li><Link href="/we-buy-trailers" className="hover:text-white transition-colors">We Buy Trailers</Link></li>
              <li><Link href="/fleet-evaluations" className="hover:text-white transition-colors">Fleet Evaluations</Link></li>
              <li><Link href="/consignment" className="hover:text-white transition-colors">Consignment</Link></li>
              <li><Link href="/leasing" className="hover:text-white transition-colors">Leasing / Credit</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-2 font-body text-sm text-white/70">
              <li>
                <a href="tel:6472218888" className="hover:text-white transition-colors">
                  (647) 221-8888
                </a>
              </li>
              <li>
                <a href="mailto:jason@penguintrailers.com" className="hover:text-white transition-colors">
                  jason@penguintrailers.com
                </a>
              </li>
              <li className="leading-relaxed">
                5393 Steeles Ave W.<br />
                Milton, ON L9E 0R7
              </li>
            </ul>
          </div>

          {/* Social / Hours */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-wider mb-4">
              Connect
            </h4>
            <div className="flex gap-3">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded bg-white/10 flex items-center justify-center hover:bg-blue transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-sm font-body text-white/50">
          &copy; {new Date().getFullYear()} Penguin Trailers Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
