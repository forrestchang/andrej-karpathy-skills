import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import FAQ from "@/components/FAQ";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Leasing / Credit",
  description: "Trailer leasing and financing options from Penguin Trailers. Flexible credit solutions for your business.",
};

const steps = [
  { step: 1, title: "Apply", description: "Fill out our credit application form or call us to get started." },
  { step: 2, title: "Get Approved", description: "We work with multiple lending partners to find the best terms for your situation." },
  { step: 3, title: "Drive Away", description: "Pick your trailer from our inventory and hit the road." },
];

const benefits = [
  { title: "Flexible Terms", description: "Financing terms tailored to your business needs and cash flow." },
  { title: "Competitive Rates", description: "Access to multiple lending partners for the best possible rates." },
  { title: "Quick Approvals", description: "Fast decision turnaround so you can get on the road sooner." },
  { title: "All Credit Levels", description: "We work with businesses at every stage — startups to established fleets." },
];

const financeTypes = [
  { title: "Dry Vans", description: "Finance standard 48' and 53' dry freight trailers." },
  { title: "Reefers", description: "Refrigerated trailer financing with flexible terms." },
  { title: "Container Chassis", description: "Chassis financing for intermodal operations." },
];

const faqItems = [
  {
    question: "What credit score do I need to qualify?",
    answer: "We work with a range of lending partners and can accommodate various credit profiles. Contact us to discuss your specific situation — we'll work to find a solution.",
  },
  {
    question: "How long does the approval process take?",
    answer: "Most applications receive a decision within 24-48 business hours. In many cases, we can provide same-day approvals.",
  },
  {
    question: "What documents do I need to apply?",
    answer: "Typically we need a completed application, business financials, and proof of insurance. We'll let you know exactly what's needed based on your situation.",
  },
  {
    question: "Can I finance multiple trailers at once?",
    answer: "Absolutely. We regularly arrange fleet financing for multiple units. Volume deals may qualify for better rates.",
  },
  {
    question: "What are the typical term lengths?",
    answer: "Terms typically range from 24 to 60 months depending on the equipment age, value, and your preferences. We'll work with you to find the right balance of payment size and term length.",
  },
];

export default function LeasingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-dark text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-navy to-dark" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold">
            Leasing &amp; Credit
          </h1>
          <p className="mt-4 text-lg text-white/80 font-body max-w-2xl mx-auto">
            Flexible financing options to get you on the road. Whether
            you&apos;re an owner-operator or managing a fleet, we&apos;ll
            find the right terms for your business.
          </p>
          <a
            href="#credit-application"
            className="inline-block mt-8 bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-colors"
          >
            Apply Now
          </a>
        </div>
      </section>

      {/* Why Lease */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark">
                Why Lease or Finance?
              </h2>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Preserve your working capital and keep your cash flow healthy.
                Financing lets you acquire the equipment you need without a
                large upfront investment — and the payments are often a
                tax-deductible business expense.
              </p>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Penguin Trailers works with multiple lending partners to find
                financing that fits your business, whether you&apos;re buying
                one trailer or building a fleet.
              </p>
            </div>
            <div className="h-64 lg:h-80 bg-light rounded-lg flex items-center justify-center">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-body">Truck on highway</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

      {/* Benefits */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            Financing Benefits
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="text-center p-6">
                <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-semibold text-dark">{b.title}</h3>
                <p className="mt-2 text-sm text-grey font-body leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Finance */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            What You Can Finance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {financeTypes.map((type) => (
              <div key={type.title} className="bg-white rounded-lg overflow-hidden">
                <div className="h-40 bg-grey/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-dark">{type.title}</h3>
                  <p className="mt-1 text-sm text-grey font-body">{type.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credit Application */}
      <section id="credit-application" className="bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-4">
            Credit Application
          </h2>
          <p className="text-center text-grey font-body mb-8">
            Our credit application is coming soon. In the meantime, call us at{" "}
            <a href="tel:6472218888" className="text-blue font-semibold hover:underline">
              (647) 221-8888
            </a>{" "}
            to discuss financing options.
          </p>
          <ContactForm subject="Leasing / Credit Inquiry" submitLabel="Submit Application" />
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            Frequently Asked Questions
          </h2>
          <FAQ items={faqItems} />
        </div>
      </section>

      <CTABanner
        headline="Ready to Finance Your Next Trailer?"
        subline="Apply now or call us to discuss your options."
      />
    </>
  );
}
