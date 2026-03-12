"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { trendingSearches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  compact?: boolean;
  showExplore?: boolean;
}

const STORAGE_KEY = "smarterstub-recent-searches";
const MAX_RECENT_SEARCHES = 4;
const MAX_STORED_SEARCH_LENGTH = 60;
const MAX_STORAGE_BYTES = 512;

function normalizeSearchValue(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_STORED_SEARCH_LENGTH);
}

function normalizeRecentSearches(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const normalizedItems: string[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }

    const normalizedItem = normalizeSearchValue(item);
    const dedupeKey = normalizedItem.toLowerCase();

    if (!normalizedItem || seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    normalizedItems.push(normalizedItem);

    if (normalizedItems.length >= MAX_RECENT_SEARCHES) {
      break;
    }
  }

  return normalizedItems;
}

function readRecentSearchesFromStorage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    if (saved.length > MAX_STORAGE_BYTES) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    const normalized = normalizeRecentSearches(JSON.parse(saved));
    const serialized = JSON.stringify(normalized);

    if (serialized !== saved) {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }

    return normalized;
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage reset failures; navigation can proceed without persisted recents.
    }

    return [];
  }
}

function writeRecentSearchesToStorage(values: string[]) {
  const normalized = normalizeRecentSearches(values);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage reset failures; navigation should remain deterministic.
    }
  }

  return normalized;
}

function buildSearchUrl(value: string) {
  const normalizedValue = normalizeSearchValue(value);
  const params = new URLSearchParams();

  if (normalizedValue) {
    params.set("q", normalizedValue);
  }

  const stringified = params.toString();
  return `/search${stringified ? `?${stringified}` : ""}`;
}

export function SearchBar({
  defaultValue = "",
  compact = false,
  showExplore = true
}: SearchBarProps) {
  const [query, setQuery] = useState(normalizeSearchValue(defaultValue));
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  function persistRecentSearch(value: string) {
    if (!value || typeof window === "undefined") {
      return;
    }

    // Keep storage guardrails in place for future use, but do not render any custom recent-search UI.
    writeRecentSearchesToStorage([value, ...readRecentSearchesFromStorage()]);
  }

  function navigateToSearch(value: string) {
    const normalizedValue = normalizeSearchValue(value);
    const nextUrl = buildSearchUrl(normalizedValue);
    const currentUrl =
      typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";

    if (isNavigating || nextUrl === currentUrl) {
      return;
    }

    // Final production choice: submit-only search bars with no custom overlay or focus lifecycle.
    setIsNavigating(true);
    router.push(nextUrl);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = normalizeSearchValue(query);

    if (normalizedQuery) {
      persistRecentSearch(normalizedQuery);
    }

    navigateToSearch(normalizedQuery);
  }

  function handleTrendingClick(value: string) {
    const normalizedValue = normalizeSearchValue(value);
    setQuery(normalizedValue);
    persistRecentSearch(normalizedValue);
    navigateToSearch(normalizedValue);
  }

  return (
    <div className={cn("w-full min-w-0", compact ? "max-w-4xl" : "max-w-5xl")}>
      <form
        onSubmit={handleSubmit}
        className="relative flex w-full min-w-0 items-center gap-3 rounded-[30px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition focus-within:border-teal-300 focus-within:shadow-[0_30px_90px_rgba(15,118,110,0.18)]"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-teal-700">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search artist, team, venue, city, or event"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="h-12 flex-1 border-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={isNavigating}
          className="rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-80"
        >
          Compare deals
        </button>
      </form>

      {showExplore ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-600">Trending:</span>
          {trendingSearches.slice(0, compact ? 4 : 5).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleTrendingClick(item)}
              className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1.5 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
