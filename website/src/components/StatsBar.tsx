"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: 2006, label: "Established", prefix: "", suffix: "" },
  { value: 600, label: "Trailers / Year", prefix: "", suffix: "+" },
  { value: 50, label: "Top 100 Carriers", prefix: "", suffix: "+" },
  { value: 20, label: "Years Experience", prefix: "", suffix: "+" },
];

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-navy text-white py-10 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-heading text-3xl sm:text-4xl font-bold">
                {stat.prefix}
                <AnimatedNumber value={stat.value} visible={visible} />
                {stat.suffix}
              </div>
              <div className="mt-1 text-sm font-body text-white/70 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ value, visible }: { value: number; visible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * value);
      setCount(start);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [visible, value]);

  return <span>{visible ? count.toLocaleString() : "0"}</span>;
}
