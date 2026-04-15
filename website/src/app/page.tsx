import Link from "next/link";
import StatsBar from "@/components/StatsBar";
import ImageStrip from "@/components/ImageStrip";
import CTABanner from "@/components/CTABanner";

const services = [
  {
    title: "Used Trailer Sales",
    description: "Large rotating inventory of dry vans, reefers, and container chassis at competitive prices.",
    href: "/inventory",
  },
  {
    title: "We Buy Trailers",
    description: "Quick-pay acquisition from fleets and carriers across Canada. Fast pickup, fair pricing.",
    href: "/we-buy-trailers",
  },
  {
    title: "Fleet Evaluations",
    description: "Professional assessments of fleet trailer condition and value by industry experts.",
    href: "/fleet-evaluations",
  },
  {
    title: "Consignment",
    description: "Place your equipment with us and gain access to 5,000+ potential buyers in the GTA.",
    href: "/consignment",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-dark text-white min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-dark to-navy/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <span className="inline-block bg-blue/20 text-blue border border-blue/30 text-sm font-body font-semibold px-4 py-1 rounded-full mb-6">
            Trusted Since 2006
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl mx-auto">
            Canada&apos;s Boutique Used Trailer Dealer
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/80 font-body max-w-2xl mx-auto leading-relaxed">
            Buying and selling 600+ trailers per year. Dry vans, reefers, and
            container chassis — with the speed and expertise only 20 years of
            experience can deliver.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/inventory"
              className="bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-colors"
            >
              Browse Inventory
            </Link>
            <Link
              href="/contact"
              className="border border-white/30 hover:border-white/60 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Services Grid */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
              What We Do
            </h2>
            <p className="mt-3 text-grey font-body max-w-2xl mx-auto">
              Full-service trailer solutions for carriers, fleets, and owner-operators across Canada.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group bg-light rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-semibold text-dark group-hover:text-blue transition-colors">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm text-grey font-body leading-relaxed">
                  {service.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Inventory */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
              Featured Inventory
            </h2>
            <p className="mt-3 text-grey font-body">
              A selection of our current stock. Updated weekly.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-48 bg-grey/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-5">
                  <span className="text-xs font-body font-semibold text-blue uppercase tracking-wider">
                    Dry Van
                  </span>
                  <h3 className="mt-1 font-heading font-semibold text-dark">
                    Sample Trailer Listing
                  </h3>
                  <p className="mt-1 text-sm text-grey font-body">2019 &middot; 53&apos; &middot; Tandem</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-heading font-bold text-dark">Call for Pricing</span>
                    <span className="text-blue text-sm font-body font-semibold">View Details &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/inventory"
              className="inline-block border-2 border-navy text-navy hover:bg-navy hover:text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3 rounded transition-colors"
            >
              View All Inventory
            </Link>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
                Built on 20 Years of Hands-On Experience
              </h2>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Penguin Trailers was founded by Jason Hirsch, who started in
                trucking at 18 as a welder and machinist. That hands-on
                manufacturing background means we know exactly how trailers are
                built, how they break down, and what makes a unit worth buying.
              </p>
              <p className="mt-4 text-grey font-body leading-relaxed">
                We work with 50 of the top 100 carriers in Canada and have built
                strong relationships with major manufacturers and local
                dealerships. When you work with Penguin, you get speed, product
                knowledge, and a team that&apos;s kind, easy to speak with, and
                happy to help.
              </p>
              <Link
                href="/about"
                className="inline-block mt-6 text-blue font-body font-semibold hover:underline"
              >
                Learn more about us &rarr;
              </Link>
            </div>
            <div className="h-80 lg:h-96 bg-light rounded-lg flex items-center justify-center">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm font-body">Jason Hirsch — Founder</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Strip */}
      <ImageStrip />

      {/* Testimonials */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark mb-10">
            What Our Clients Say
          </h2>
          <div className="bg-white rounded-lg p-8 sm:p-10 shadow-sm">
            <svg className="w-10 h-10 text-blue/30 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-lg text-dark font-body leading-relaxed italic">
              &ldquo;Testimonials coming soon. We&apos;d love to hear from our
              clients about their experience working with Penguin Trailers.&rdquo;
            </p>
            <div className="mt-6 text-sm text-grey font-body">
              — Your review here
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner />
    </>
  );
}
