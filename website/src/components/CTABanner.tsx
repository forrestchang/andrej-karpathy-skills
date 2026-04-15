import Link from "next/link";

interface CTABannerProps {
  headline?: string;
  subline?: string;
  buttonText?: string;
  buttonHref?: string;
  showPhone?: boolean;
}

export default function CTABanner({
  headline = "Ready to Get Started?",
  subline = "Whether you're buying, selling, or need an evaluation — we're here to help.",
  buttonText = "Contact Us",
  buttonHref = "/contact",
  showPhone = true,
}: CTABannerProps) {
  return (
    <section className="bg-navy text-white py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold">
          {headline}
        </h2>
        <p className="mt-4 text-lg text-white/80 font-body">{subline}</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={buttonHref}
            className="inline-block bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3 rounded transition-colors"
          >
            {buttonText}
          </Link>
          {showPhone && (
            <a
              href="tel:6472218888"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white font-body font-semibold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              (647) 221-8888
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
