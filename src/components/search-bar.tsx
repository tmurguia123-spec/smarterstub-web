"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Clock3, Search, Sparkles, TrendingUp } from "lucide-react";
import { getAutocompleteSuggestions, trendingSearches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  compact?: boolean;
  showExplore?: boolean;
}

const STORAGE_KEY = "smarterstub-recent-searches";
const MAX_RECENT_SEARCHES = 4;
const MAX_STORED_SEARCH_LENGTH = 80;
const MAX_STORAGE_BYTES = 2048;

function normalizeRecentSearches(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= MAX_STORED_SEARCH_LENGTH)
    .filter((item, index, array) => array.indexOf(item) === index);

  return deduped.slice(0, MAX_RECENT_SEARCHES);
}

export function SearchBar({
  defaultValue = "",
  compact = false,
  showExplore = true
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const blurTimeoutRef = useRef<number | null>(null);
  const suggestions = useMemo(() => getAutocompleteSuggestions(query), [query]);

  useEffect(() => {
    setMounted(true);

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return;
      }

      // Refuse oversized payloads before parsing so corrupted browser state stays cheap to recover from.
      if (saved.length > MAX_STORAGE_BYTES) {
        window.localStorage.removeItem(STORAGE_KEY);
        setRecentSearches([]);
        return;
      }

      const normalized = normalizeRecentSearches(JSON.parse(saved));

      // If the stored payload was malformed or noisy, reset it to the clean bounded version.
      if (JSON.stringify(normalized) !== saved) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      }

      setRecentSearches(normalized);
    } catch {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage reset failures; state is already falling back safely.
      }
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        window.clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  function persistRecentSearches(values: string[]) {
    // Always normalize before writing so localStorage can only hold a tiny, safe, deduped payload.
    const nextRecent = normalizeRecentSearches(values);
    setRecentSearches(nextRecent);

    if (mounted) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecent));
    }

    return nextRecent;
  }

  function navigateToSearch(value: string) {
    const searchParams = new URLSearchParams();
    if (value) {
      searchParams.set("q", value);
    }
    const nextUrl = `/search${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const currentUrl =
      pathname === "/search"
        ? `/search${defaultValue.trim() ? `?q=${encodeURIComponent(defaultValue.trim())}` : ""}`
        : pathname;

    if (nextUrl !== currentUrl) {
      router.push(nextUrl);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    const safeStoredQuery = trimmed.slice(0, MAX_STORED_SEARCH_LENGTH);

    if (trimmed) {
      persistRecentSearches([safeStoredQuery, ...recentSearches]);
    }

    setFocused(false);
    navigateToSearch(trimmed);
  }

  function selectSuggestion(value: string) {
    setQuery(value);
    persistRecentSearches([value.slice(0, MAX_STORED_SEARCH_LENGTH), ...recentSearches]);
    setFocused(false);
    navigateToSearch(value);
  }

  return (
    <div className={cn("w-full", compact ? "max-w-4xl" : "max-w-5xl")}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex w-full items-center gap-3 rounded-[30px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition focus-within:border-teal-300 focus-within:shadow-[0_30px_90px_rgba(15,118,110,0.18)]",
          focused && "rounded-b-[20px]"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-teal-700">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            if (blurTimeoutRef.current) {
              window.clearTimeout(blurTimeoutRef.current);
            }
            blurTimeoutRef.current = window.setTimeout(() => setFocused(false), 120);
          }}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search artist, team, venue, city, or event"
          className="h-12 flex-1 border-0 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Compare deals
        </button>

        {focused ? (
          <div className="absolute inset-x-0 top-[calc(100%-4px)] z-30 rounded-b-[28px] border border-slate-200 border-t-0 bg-white p-4 shadow-[0_28px_60px_rgba(15,23,42,0.16)]">
            <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
              <div className="rounded-3xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  <Sparkles className="h-4 w-4" />
                  Autocomplete
                </div>
                <div className="mt-3 space-y-2">
                  {suggestions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onMouseDown={() => selectSuggestion(item)}
                      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-white hover:text-slate-950"
                    >
                      <span>{item}</span>
                      <Search className="h-4 w-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {trendingSearches.slice(0, 4).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={() => selectSuggestion(item)}
                        className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-teal-300 hover:text-slate-950"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <Clock3 className="h-4 w-4" />
                    Recent
                  </div>
                  <div className="mt-3 space-y-2">
                    {(mounted && recentSearches.length
                      ? recentSearches
                      : trendingSearches.slice(0, 3)
                    ).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={() => selectSuggestion(item)}
                        className="block w-full rounded-2xl bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:text-slate-950"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </form>

      {showExplore ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-600">Trending:</span>
          {trendingSearches.slice(0, compact ? 4 : 5).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectSuggestion(item)}
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
