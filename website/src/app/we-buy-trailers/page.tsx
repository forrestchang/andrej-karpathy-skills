import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "We Buy Trailers",
  description: "Sell your used trailers to Penguin Trailers. Quick payment, fast pickup across Canada.",
};

const valueProps = [
  { title: "Speed", description: "We pay fast and pick up fast. No waiting weeks for an offer or a cheque." },
  { title: "Ease", description: "One call, one quote, one transaction. We handle the logistics and paperwork." },
  { title: "Expertise", description: "20 years of product knowledge means fair, accurate pricing for your equipment." },
];

const steps = [
  { step: 1, title: "Contact Us", description: "Call, email, or submit the form below with details about your trailer(s)." },
  { step: 2, title: "Get a Quote", description: "We'll assess your equipment and provide a competitive offer — usually within 24 hours." },
  { step: 3, title: "Schedule Pickup", description: "Accept the offer and we'll coordinate pickup from your location anywhere in Canada." },
  { step: 4, title: "Get Paid", description: "Payment is processed quickly. No delays, no runaround." },
];

const trailerTypes = [
  { title: "Dry Vans", description: "Standard 48' and 53' dry freight trailers." },
  { title: "Reefers", description: "Refrigerated trailers with or without working units." },
  { title: "Container Chassis", description: "20', 40', and combo chassis." },
  { title: "Other Equipment", description: "Flatbeds, drop decks, and specialty trailers — get in touch." },
];

export default function WeBuyTrailersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-4xl sm:text-5xl font-bold text-dark">
                We Buy Trailers
              </h1>
              <p className="mt-4 text-lg text-grey font-body leading-relaxed">
                Looking to sell your used trailers? Penguin Trailers buys
                equipment from fleets and carriers across Canada. We pay fast,
                pick up fast, and make the process as simple as possible.
              </p>
              <a
                href="#sell-form"
                className="inline-block mt-6 bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-colors"
              >
                Get a Quote
              </a>
            </div>
            <div className="h-64 lg:h-80 bg-light rounded-lg flex items-center justify-center">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-body">Yard volume photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {valueProps.map((prop) => (
              <div key={prop.title} className="bg-white rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-semibold text-dark">{prop.title}</h3>
                <p className="mt-2 text-grey font-body text-sm leading-relaxed">{prop.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-navy text-white rounded-full flex items-center justify-center font-heading font-bold text-lg mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-heading text-lg font-semibold text-dark">{s.title}</h3>
                <p className="mt-2 text-sm text-grey font-body leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Buy */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-dark text-center mb-12">
            What We Buy
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trailerTypes.map((type) => (
              <div key={type.title} className="bg-white rounded-lg overflow-hidden">
                <div className="h-36 bg-grey/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="font-heading font-semibold text-dark">{type.title}</h3>
                  <p className="mt-1 text-sm text-grey font-body">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="sell-form" className="bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-8">
            Tell Us About Your Equipment
          </h2>
          <ContactForm subject="We Buy Trailers Inquiry" submitLabel="Request a Quote" />
        </div>
      </section>

      <CTABanner
        headline="Ready to Sell?"
        subline="Call us now for a quick, no-obligation quote on your equipment."
      />
    </>
  );
}
