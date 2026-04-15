import type { Metadata } from "next";
import StatsBar from "@/components/StatsBar";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Penguin Trailers — a boutique used trailer dealer serving Canada since 2006.",
};

const team = [
  {
    name: "Jason Hirsch",
    role: "Owner / Founder",
    bio: "Started in trucking at 18 as a welder and machinist. Rose through plant management and corporate sales. Started his first company at 29. Deeply knowledgeable about how trailers are built, break down, and perform.",
    initials: "JH",
  },
  {
    name: "Anthony Buffa",
    role: "General Manager",
    bio: "Oversees logistics, yards, licensing, and repair. Manages the trailer lifecycle from acquisition to sale and has his own extensive customer network.",
    initials: "AB",
  },
  {
    name: "Jeremy Montalban",
    role: "Associate Dealer, BC",
    bio: "Also owns Grizzly Trailer Sales. Extensive buy/sell/rent background. Manages the BC yard in Abbotsford, extending Penguin's reach across Western Canada.",
    initials: "JM",
  },
  {
    name: "Linkon Price",
    role: "Sales Associate",
    bio: "Handles new sales development, social media presence, and special projects. Focused on growing Penguin's market reach.",
    initials: "LP",
  },
  {
    name: "Monique Hirsch",
    role: "Office Manager",
    bio: "Manages accounts payable and receivable. Keeps the business running smoothly behind the scenes.",
    initials: "MH",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-dark text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-navy to-dark" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block bg-blue/20 text-blue border border-blue/30 text-sm font-body font-semibold px-4 py-1 rounded-full mb-6">
            Since 2006
          </span>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold">
            Our Story
          </h1>
          <p className="mt-4 text-lg text-white/80 font-body max-w-2xl mx-auto">
            A family-run business built on hands-on expertise, strong
            relationships, and a genuine commitment to doing right by our clients.
          </p>
        </div>
      </section>

      {/* Company Story */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark">
                From the Shop Floor to the Sales Yard
              </h2>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Jason Hirsch started working in trucking at 18, learning the
                trade as a welder and machinist. He went on to manage
                manufacturing plants and corporate sales teams before
                launching his first company at 29.
              </p>
              <p className="mt-4 text-grey font-body leading-relaxed">
                That hands-on background — knowing how trailers are built from
                the frame up — became the foundation of Penguin Trailers.
                Founded in 2006, the company has grown into a trusted partner
                for carriers and fleets across Canada.
              </p>
            </div>
            <div className="h-64 lg:h-80 bg-light rounded-lg flex items-center justify-center">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-sm font-body">Jason Hirsch photo</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
            <div className="h-64 lg:h-80 bg-light rounded-lg flex items-center justify-center order-2 lg:order-1">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-body">Yard aerial photo</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="font-heading text-3xl font-bold text-dark">
                Boutique Approach, Industry-Scale Results
              </h2>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Penguin moves 600 to 1,200 trailers per year — primarily dry
                vans, reefers, and container chassis. We work with 50 of the
                top 100 carriers in Canada and have built strong relationships
                with major manufacturers and local dealerships.
              </p>
              <p className="mt-4 text-grey font-body leading-relaxed">
                What sets us apart is our boutique approach. Every client gets
                personalized attention, honest advice, and the kind of
                responsiveness that larger dealers can&apos;t match. We&apos;re
                kind, easy to speak with, and genuinely happy to help.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsBar />

      {/* Team */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
              Meet the Team
            </h2>
            <p className="mt-3 text-grey font-body">
              The people behind Penguin Trailers.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member) => (
              <div key={member.name} className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="h-48 bg-navy/5 flex items-center justify-center">
                  <div className="w-20 h-20 bg-navy/10 rounded-full flex items-center justify-center">
                    <span className="font-heading text-2xl font-bold text-navy">
                      {member.initials}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-semibold text-dark">
                    {member.name}
                  </h3>
                  <p className="text-sm text-blue font-body font-semibold">
                    {member.role}
                  </p>
                  <p className="mt-2 text-sm text-grey font-body leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABanner
        headline="Want to Work With Us?"
        subline="Whether you're buying, selling, or just have questions — we're here."
      />
    </>
  );
}
