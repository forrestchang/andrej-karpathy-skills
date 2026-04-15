import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Penguin Trailers. Call (647) 221-8888 or visit our yard in Milton, Ontario.",
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-dark">
            Contact Us
          </h1>
          <p className="mt-3 text-lg text-grey font-body max-w-2xl">
            Have a question about our inventory or services? Reach out — we&apos;re
            here to help.
          </p>
        </div>
      </section>

      {/* Contact Split */}
      <section className="bg-light py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white rounded-lg p-6 sm:p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-dark mb-6">
                Send Us a Message
              </h2>
              <ContactForm subject="Contact Page Inquiry" />
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-lg font-semibold text-dark mb-3">
                  Phone
                </h3>
                <a
                  href="tel:6472218888"
                  className="text-lg text-blue font-body font-semibold hover:underline"
                >
                  (647) 221-8888
                </a>
              </div>

              <div>
                <h3 className="font-heading text-lg font-semibold text-dark mb-3">
                  Email
                </h3>
                <a
                  href="mailto:jason@penguintrailers.com"
                  className="text-lg text-blue font-body font-semibold hover:underline"
                >
                  jason@penguintrailers.com
                </a>
              </div>

              <div>
                <h3 className="font-heading text-lg font-semibold text-dark mb-3">
                  Yard Location
                </h3>
                <p className="text-grey font-body leading-relaxed">
                  5393 Steeles Ave W.<br />
                  Milton, ON L9E 0R7
                </p>
              </div>

              <div>
                <h3 className="font-heading text-lg font-semibold text-dark mb-3">
                  Mailing Address
                </h3>
                <p className="text-grey font-body leading-relaxed">
                  3-1750 The Queensway<br />
                  Etobicoke, ON M9C 5H5
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="h-[400px] bg-grey/10">
        <iframe
          title="Penguin Trailers Yard Location"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2888.8!2d-79.87!3d43.58!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s5393+Steeles+Ave+W+Milton+ON!5e0!3m2!1sen!2sca!4v1"
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      <CTABanner
        headline="Prefer to Talk?"
        subline="Give us a call and we'll get back to you right away."
        buttonText="Call Now"
        buttonHref="tel:6472218888"
      />
    </>
  );
}
