"use client";

import { useRef, useState } from "react";

const placeholderImages = [
  { src: "/images/operations/yard-1.jpg", alt: "Trailer yard operations" },
  { src: "/images/operations/yard-2.jpg", alt: "Rows of trailers" },
  { src: "/images/operations/yard-3.jpg", alt: "Trailer inspection" },
  { src: "/images/operations/yard-4.jpg", alt: "Loading dock" },
  { src: "/images/operations/yard-5.jpg", alt: "Fleet overview" },
  { src: "/images/operations/yard-6.jpg", alt: "Team at work" },
];

export default function ImageStrip() {
  const [paused, setPaused] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  // Double the images for seamless loop
  const images = [...placeholderImages, ...placeholderImages];

  return (
    <section className="overflow-hidden py-8 bg-light">
      <div
        ref={stripRef}
        className="flex gap-4"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{
          animation: `scroll 30s linear infinite`,
          animationPlayState: paused ? "paused" : "running",
          width: "max-content",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="w-[300px] h-[200px] sm:w-[400px] sm:h-[260px] rounded-lg overflow-hidden bg-grey/20 shrink-0 flex items-center justify-center"
          >
            <div className="text-grey/40 text-sm font-body text-center px-4">
              <svg className="w-10 h-10 mx-auto mb-2 text-grey/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {img.alt}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
}
