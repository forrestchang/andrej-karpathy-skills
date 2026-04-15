import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Consignment",
  description: "Place your trailers with Penguin Trailers for consignment sale. Access 5,000+ potential buyers in the GTA.",
};

const benefits = [
  { title: "Access to 5,000+ Buyers", description: "Tap into Penguin's extensive network of carriers, fleets, and dealers in the GTA." },
  { title: "No Upfront Cost", description: "You only pay when your equipment sells. No listing fees, no marketing costs." },
  { title: "Professional Marketing", description: "Your trailers get professional photos and placement alongside our own inventory." },
  { title: "Secure Yard Storage", description: "Your equipment stays in our secure Milton yard while it's listed for sale." },
  { title: "Expert Pricing", description: "We price your equipment based on real market data from hundreds of transactions." },
  { title: "Hassle-Free Process", description: "We handle all inquiries, showings, negotiations, and paperwork." },
];

const steps = [
  { step: 1, title: "Contact Us", description: "Tell us about your equipment — type, year, condition, and quantity." },
  { step: 2, title: "Inspection & Agreement", description: "We inspect the units, agree on pricing, and sign a consignment agreement." },
  { step: 3, title: "Transport to Yard", description: "Your trailers are moved to our Milton yard for secure staging." },
  { step: 4, title: "Marketing & Sales", description: "We list, market, and show your equipment to our buyer network." },
  { step: 5, title: "Get Paid", description: "Once sold, you receive payment minus the agreed commission." },
];

export default function ConsignmentPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-dark">
                Consignment
              </h1>
              <p className="mt-4 text-lg text-grey font-body leading-relaxed">
                Don&apos;t want to handle selling your trailers yourself? Place
                them with Penguin and let us do the work. You get access to our
                buyer network, professional marketing, and industry expertise —
                with zero upfront cost.
              </p>
              <a
                href="#consignment-form"
                className="inline-block mt-6 bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-colors"
              >
                Start Consignment
              </a>
            </div>
            <div className="h-64 lg:h-80 bg-light rounded-lg flex items-center justify-center">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-body">Staged trailers photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            Why Consignment with Penguin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-lg p-6">
                <div className="w-10 h-10 bg-navy/10 rounded-lg flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading font-semibold text-dark">{b.title}</h3>
                <p className="mt-2 text-sm text-grey font-body leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            How It Works
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((s) => (
              <div key={s.step} className="flex gap-6">
                <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center font-heading font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-dark">{s.title}</h3>
                  <p className="mt-1 text-grey font-body leading-relaxed">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            Consignment vs. Selling On Your Own
          </h2>
          <div className="bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-navy text-white">
                  <th className="py-3 px-4 text-left font-heading font-semibold text-sm"></th>
                  <th className="py-3 px-4 text-center font-heading font-semibold text-sm">Penguin Consignment</th>
                  <th className="py-3 px-4 text-center font-heading font-semibold text-sm">Selling Yourself</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grey/10 font-body text-sm">
                {[
                  ["Buyer network", "5,000+ active buyers", "Your contacts only"],
                  ["Marketing", "Included — photos, listings, inquiries", "You handle everything"],
                  ["Upfront cost", "None", "Ads, listing fees, time"],
                  ["Negotiation", "We handle it", "You handle it"],
                  ["Secure storage", "Our yard", "Your yard or rent space"],
                  ["Time investment", "Minimal", "Significant"],
                ].map(([feature, penguin, self]) => (
                  <tr key={feature}>
                    <td className="py-3 px-4 font-semibold text-dark">{feature}</td>
                    <td className="py-3 px-4 text-center text-navy font-semibold">{penguin}</td>
                    <td className="py-3 px-4 text-center text-grey">{self}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="consignment-form" className="bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-8">
            Consignment Inquiry
          </h2>
          <ContactForm subject="Consignment Inquiry" submitLabel="Submit Inquiry" />
        </div>
      </section>

      <CTABanner />
    </>
  );
}
