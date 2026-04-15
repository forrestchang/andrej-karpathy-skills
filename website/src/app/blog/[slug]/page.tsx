import type { Metadata } from "next";
import Link from "next/link";
import CTABanner from "@/components/CTABanner";

// Placeholder until Sanity is connected
const placeholderPost = {
  title: "Welcome to Penguin Trailers",
  date: "2026-04-15",
  author: "Jason Hirsch",
  category: "Company News",
  body: [
    "We're excited to launch our new website and share a bit about who we are and what we do.",
    "Penguin Trailers has been a trusted name in the Canadian used trailer market since 2006. Based in the Greater Toronto Area, we buy and sell between 600 and 1,200 trailers per year — primarily dry vans, reefers, and container chassis.",
    "What sets us apart is our boutique approach. Every client gets personalized attention, honest advice, and the kind of responsiveness that larger dealers can't match.",
    "Whether you're looking to buy, sell, consign, or evaluate your fleet equipment — we're here to help. Browse our inventory, learn about our services, or get in touch today.",
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: placeholderPost.title,
    description: `Read "${placeholderPost.title}" on the Penguin Trailers blog.`,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      {/* Article Header */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="text-blue text-sm font-body font-semibold hover:underline"
          >
            &larr; Back to Blog
          </Link>
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-body font-semibold text-blue uppercase tracking-wider">
                {placeholderPost.category}
              </span>
              <span className="text-xs text-grey font-body">
                {new Date(placeholderPost.date).toLocaleDateString("en-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-dark">
              {placeholderPost.title}
            </h1>
            <p className="mt-3 text-grey font-body">
              By {placeholderPost.author}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Image Placeholder */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="h-64 sm:h-80 bg-grey/10 rounded-lg flex items-center justify-center">
          <svg className="w-12 h-12 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      </div>

      {/* Article Body */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none font-body text-dark leading-relaxed">
            {placeholderPost.body.map((paragraph, i) => (
              <p key={i} className="mb-4 text-grey leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <p className="mt-8 text-sm text-grey font-body italic">
            Blog content will be rendered from Sanity CMS using Portable Text.
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
