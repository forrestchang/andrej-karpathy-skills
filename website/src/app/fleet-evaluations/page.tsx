import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Fleet Evaluations",
  description: "Professional fleet trailer assessments by Penguin Trailers. Expert condition and value evaluations.",
};

const evaluationTypes = [
  { title: "Dry Vans", description: "Interior condition, floor integrity, doors, roof, and structural assessment." },
  { title: "Reefers", description: "Refrigeration unit condition, hours, fuel system, insulation, and body." },
  { title: "Container Chassis", description: "Frame integrity, twist locks, suspension, brakes, and tire condition." },
  { title: "Mixed Fleets", description: "Full fleet assessments across multiple trailer types with summary reporting." },
];

const differentiators = [
  { title: "Manufacturing Expertise", description: "Our founder is a welder and machinist — we know how trailers are built." },
  { title: "Market Intelligence", description: "We buy and sell 600+ trailers a year. We know what equipment is actually worth." },
  { title: "Trusted by Top Carriers", description: "We work with 50 of the top 100 carriers in Canada." },
  { title: "Actionable Reports", description: "Clear, practical assessments with repair vs. replace recommendations." },
];

const steps = [
  { step: 1, title: "Request an Evaluation", description: "Contact us with your fleet details and we'll scope the project." },
  { step: 2, title: "On-Site Assessment", description: "Our team inspects each unit on-site at your yard." },
  { step: 3, title: "Receive Your Report", description: "Detailed findings with condition ratings, valuations, and recommendations." },
];

export default function FleetEvaluationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-dark text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-navy to-dark" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold">
            Fleet Evaluations
          </h1>
          <p className="mt-4 text-lg text-white/80 font-body max-w-2xl mx-auto">
            Know exactly what your fleet is worth. Professional trailer
            assessments backed by 20 years of hands-on industry experience.
          </p>
          <a
            href="#evaluation-form"
            className="inline-block mt-8 bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3.5 rounded transition-colors"
          >
            Request an Evaluation
          </a>
        </div>
      </section>

      {/* Why It Matters */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-3xl font-bold text-dark">
                Why Fleet Evaluations Matter
              </h2>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Whether you&apos;re planning to sell, insure, finance, or
                cycle out aging equipment — you need to know what your
                trailers are actually worth. Most fleet managers rely on
                guesswork or outdated book values.
              </p>
              <p className="mt-4 text-grey font-body leading-relaxed">
                Penguin Trailers provides real-world, market-driven
                assessments based on actual transaction data from hundreds
                of trailer sales per year.
              </p>
            </div>
            <div className="h-64 lg:h-80 bg-light rounded-lg flex items-center justify-center">
              <div className="text-center text-grey/40">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <p className="text-sm font-body">Inspection photo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Evaluate */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            What We Evaluate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {evaluationTypes.map((type) => (
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

      {/* Why Penguin */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-12">
            Why Choose Penguin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((d) => (
              <div key={d.title} className="text-center p-6">
                <div className="w-12 h-12 bg-navy/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-heading text-lg font-semibold text-dark">{d.title}</h3>
                <p className="mt-2 text-sm text-grey font-body leading-relaxed">{d.description}</p>
              </div>
            ))}
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

      {/* Pricing */}
      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl font-bold text-dark">Pricing</h2>
          <p className="mt-4 text-grey font-body leading-relaxed">
            Evaluation pricing depends on fleet size, location, and scope.
            Contact us for a custom quote tailored to your needs.
          </p>
          <a
            href="#evaluation-form"
            className="inline-block mt-6 bg-blue hover:bg-blue/90 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3 rounded transition-colors"
          >
            Contact for Pricing
          </a>
        </div>
      </section>

      {/* Contact Form */}
      <section id="evaluation-form" className="bg-light py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-dark text-center mb-8">
            Request a Fleet Evaluation
          </h2>
          <ContactForm subject="Fleet Evaluation Request" submitLabel="Request Evaluation" />
        </div>
      </section>

      <CTABanner />
    </>
  );
}
