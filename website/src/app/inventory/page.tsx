import type { Metadata } from "next";
import CTABanner from "@/components/CTABanner";
import InventoryGrid from "@/components/InventoryGrid";

export const metadata: Metadata = {
  title: "Inventory",
  description: "Browse our current inventory of used dry vans, reefers, and container chassis. Updated weekly.",
};

export default function InventoryPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-dark">
            Inventory
          </h1>
          <p className="mt-3 text-lg text-grey font-body max-w-2xl">
            Browse our current selection of used trailers. Our stock changes
            weekly — if you don&apos;t see what you need, give us a call.
          </p>
        </div>
      </section>

      {/* Inventory Grid */}
      <section className="bg-light py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <InventoryGrid />
        </div>
      </section>

      <CTABanner
        headline="Don't See What You're Looking For?"
        subline="Our inventory changes weekly. Call us and we'll find what you need."
        buttonText="Call Us"
        buttonHref="tel:6472218888"
      />
    </>
  );
}
