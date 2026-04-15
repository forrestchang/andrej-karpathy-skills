"use client";

import { useState, FormEvent } from "react";

interface ContactFormProps {
  subject?: string;
  submitLabel?: string;
}

export default function ContactForm({
  subject = "General Inquiry",
  submitLabel = "Send Message",
}: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);

    // Honeypot check
    if (data.get("_gotcha")) return;

    try {
      const res = await fetch("https://formspree.io/f/placeholder", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("sent");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="bg-ice border border-blue/20 rounded-lg p-8 text-center">
        <h3 className="font-heading text-xl font-semibold text-navy">Thank You!</h3>
        <p className="mt-2 font-body text-grey">
          We&apos;ve received your message and will get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="_subject" value={subject} />
      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-body font-semibold text-dark mb-1">Name *</label>
          <input
            type="text"
            name="name"
            required
            className="w-full border border-grey/30 rounded px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-body font-semibold text-dark mb-1">Company</label>
          <input
            type="text"
            name="company"
            className="w-full border border-grey/30 rounded px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-body font-semibold text-dark mb-1">Email *</label>
          <input
            type="email"
            name="email"
            required
            className="w-full border border-grey/30 rounded px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-body font-semibold text-dark mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            className="w-full border border-grey/30 rounded px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-body font-semibold text-dark mb-1">Message *</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full border border-grey/30 rounded px-4 py-2.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue/50 focus:border-blue resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="bg-blue hover:bg-blue/90 disabled:opacity-50 text-white font-heading font-semibold text-sm uppercase tracking-wider px-8 py-3 rounded transition-colors"
      >
        {status === "sending" ? "Sending..." : submitLabel}
      </button>

      {status === "error" && (
        <p className="text-red-600 text-sm font-body">
          Something went wrong. Please try again or call us at (647) 221-8888.
        </p>
      )}
    </form>
  );
}
