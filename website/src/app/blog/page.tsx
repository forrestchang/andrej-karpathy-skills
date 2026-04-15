import type { Metadata } from "next";
import Link from "next/link";
import CTABanner from "@/components/CTABanner";

export const metadata: Metadata = {
  title: "Blog",
  description: "News, updates, and insights from Penguin Trailers — Canada's boutique used trailer dealer.",
};

// Placeholder posts until Sanity is connected
const placeholderPosts = [
  {
    slug: "welcome-to-penguin-trailers",
    title: "Welcome to Penguin Trailers",
    excerpt: "We're excited to launch our new website. Learn about who we are, what we do, and how we can help your business.",
    date: "2026-04-15",
    category: "Company News",
  },
  {
    slug: "what-to-look-for-used-trailer",
    title: "What to Look for When Buying a Used Trailer",
    excerpt: "A guide from our team on the key things to inspect before purchasing a used dry van, reefer, or chassis.",
    date: "2026-04-10",
    category: "Industry Insights",
  },
  {
    slug: "fleet-evaluation-guide",
    title: "Why Every Fleet Needs Regular Equipment Evaluations",
    excerpt: "Understanding the true value of your fleet equipment can save you money and help you make better business decisions.",
    date: "2026-04-05",
    category: "Industry Insights",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Page Header */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-dark">
            Blog
          </h1>
          <p className="mt-3 text-lg text-grey font-body max-w-2xl">
            News, updates, and industry insights from the Penguin Trailers team.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="bg-light py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {placeholderPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-grey/10 flex items-center justify-center">
                  <svg className="w-12 h-12 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-body font-semibold text-blue uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="text-xs text-grey font-body">
                      {new Date(post.date).toLocaleDateString("en-CA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <h2 className="font-heading text-lg font-semibold text-dark group-hover:text-blue transition-colors">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-grey font-body leading-relaxed">
                    {post.excerpt}
                  </p>
                  <span className="inline-block mt-3 text-blue text-sm font-body font-semibold">
                    Read more &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-grey font-body">
            Blog posts will be managed via Sanity CMS.
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
