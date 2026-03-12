"use client";

import { FormEvent, useState } from "react";

interface EmailCaptureFormProps {
  title: string;
  description: string;
  buttonLabel?: string;
  successMessage?: string;
  source: "homepage" | "event-page" | "search-no-results";
  eventId?: string;
  eventTitle?: string;
  compact?: boolean;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailCaptureForm({
  title,
  description,
  buttonLabel = "Get alerts",
  successMessage = "You're signed up for updates.",
  source,
  eventId,
  eventTitle,
  compact = false
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail,
          source,
          eventId,
          eventTitle
        })
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setIsSuccess(true);
      setEmail("");
    } catch {
      setError("Unable to save your email right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white ${compact ? "p-5" : "p-6 sm:p-7"}`}>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">Deal alerts</div>
      <h3 className={`mt-2 font-semibold tracking-tight text-slate-950 ${compact ? "text-2xl" : "text-3xl"}`}>
        {title}
      </h3>
      <p className={`mt-3 text-sm leading-6 text-slate-600 ${compact ? "max-w-lg" : "max-w-2xl"}`}>
        {description}
      </p>

      {isSuccess ? (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : (
        <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit} noValidate>
          <label className="sr-only" htmlFor={`${source}-email`}>
            Email address
          </label>
          <input
            id={`${source}-email`}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-12 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isSubmitting ? "Saving..." : buttonLabel}
          </button>
        </form>
      )}

      {error ? <div className="mt-3 text-sm text-rose-600">{error}</div> : null}
    </div>
  );
}
