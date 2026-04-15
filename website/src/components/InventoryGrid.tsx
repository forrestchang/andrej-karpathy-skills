"use client";

import { useState } from "react";

type TrailerType = "all" | "dry-van" | "reefer" | "chassis" | "other";

const sampleListings = [
  { id: "1", title: "2019 Hyundai Translead Dry Van", trailerType: "dry-van" as const, year: 2019, length: "53'", axles: "Tandem", price: "Call for Pricing", quantity: 5 },
  { id: "2", title: "2018 Utility Reefer", trailerType: "reefer" as const, year: 2018, length: "53'", axles: "Tandem", price: "$22,500", quantity: 3 },
  { id: "3", title: "2020 CIMC Container Chassis", trailerType: "chassis" as const, year: 2020, length: "40'", axles: "Tri-axle", price: "$8,900", quantity: 10 },
  { id: "4", title: "2017 Great Dane Dry Van", trailerType: "dry-van" as const, year: 2017, length: "53'", axles: "Tandem", price: "$15,000", quantity: 2 },
  { id: "5", title: "2021 Carrier Reefer Unit", trailerType: "reefer" as const, year: 2021, length: "53'", axles: "Tandem", price: "$35,000", quantity: 1 },
  { id: "6", title: "2016 Wabash Dry Van", trailerType: "dry-van" as const, year: 2016, length: "53'", axles: "Tandem", price: "$12,500", quantity: 4 },
];

const typeLabels: Record<string, string> = {
  "dry-van": "Dry Van",
  "reefer": "Reefer",
  "chassis": "Container Chassis",
  "other": "Other",
};

export default function InventoryGrid() {
  const [filter, setFilter] = useState<TrailerType>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");

  const filtered = sampleListings
    .filter((item) => filter === "all" || item.trailerType === filter)
    .sort((a, b) => sort === "newest" ? b.year - a.year : a.year - b.year);

  return (
    <>
      {/* Filter Bar */}
      <div className="sticky top-16 sm:top-20 z-30 bg-white rounded-lg shadow-sm p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(["all", "dry-van", "reefer", "chassis", "other"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded text-sm font-body font-semibold transition-colors ${
                filter === type
                  ? "bg-navy text-white"
                  : "bg-light text-dark hover:bg-grey/20"
              }`}
            >
              {type === "all" ? "All Types" : typeLabels[type]}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
          className="border border-grey/30 rounded px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blue/50"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-grey font-body">No trailers match your filters. Try adjusting your selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-48 bg-grey/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-body font-semibold text-blue uppercase tracking-wider">
                    {typeLabels[item.trailerType]}
                  </span>
                  {item.quantity > 1 && (
                    <span className="text-xs font-body bg-ice text-navy px-2 py-0.5 rounded">
                      Qty: {item.quantity}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-semibold text-dark">{item.title}</h3>
                <p className="mt-1 text-sm text-grey font-body">
                  {item.year} &middot; {item.length} &middot; {item.axles}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-heading font-bold text-dark">{item.price}</span>
                  <a
                    href="tel:6472218888"
                    className="text-blue text-sm font-body font-semibold hover:underline"
                  >
                    Inquire &rarr;
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-grey font-body">
        Showing {filtered.length} listing{filtered.length !== 1 ? "s" : ""}. Inventory data will be managed via Sanity CMS.
      </p>
    </>
  );
}
