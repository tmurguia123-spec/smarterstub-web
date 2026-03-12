"use client";

import type { FormEvent, MouseEvent } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Search, Sparkles, TrendingUp } from "lucide-react";
import { getAutocompleteSuggestions, trendingSearches } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  defaultValue?: string;
  compact?: boolean;
  showExplore?: boolean;
  enableOverlay?: boolean;
}

const STORAGE_KEY = "smarterstub-recent-searches";
const MAX_RECENT_SEARCHES = 4;
const MAX_STORED_SEARCH_LENGTH = 60;
const MAX_STORAGE_BYTES = 512;
const MAX_SUGGESTIONS = 6;
const MAX_TRENDING_ITEMS = 4;
const MAX_RECENT_PANEL_ITEMS = 3;
const SEARCH_OVERLAY_EVENT = "smarterstub-search-overlay-open";

function normalizeSearchValue(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_STORED_SEARCH_LENGTH);
}

function normalizeDisplayList(value: unknown, limit: number) {
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

    if (normalizedItems.length >= limit) {
      break;
    }
  }

  return normalizedItems;
}

function normalizeRecentSearches(value: unknown) {
  return normalizeDisplayList(value, MAX_RECENT_SEARCHES);
}

function readRecentSearchesFromStorage() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }

    // Reject oversized payloads before parsing so corrupted storage cannot balloon parse cost or rendered output.
    if (saved.length > MAX_STORAGE_BYTES) {
      window.localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    const normalized = normalizeRecentSearches(JSON.parse(saved));
    const serialized = JSON.stringify(normalized);

    // Rewrite malformed, duplicated, or overgrown payloads back to the only safe persisted shape.
    if (serialized !== saved) {
      window.localStorage.setItem(STORAGE_KEY, serialized);
    }

    return normalized;
  } catch {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage reset failures; the component state still falls back to a safe empty list.
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
      // Ignore storage reset failures; the in-memory recent-search list is already bounded.
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
  showExplore = true,
  enableOverlay = false
}: SearchBarProps) {
  const instanceId = useId();
  const normalizedDefaultValue = normalizeSearchValue(defaultValue);
  const [query, setQuery] = useState(normalizedDefaultValue);
  const [focused, setFocused] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readRecentSearchesFromStorage()
  );
  const router = useRouter();
  const lastNavigationRef = useRef<string | null>(null);
  const suggestions = useMemo(
    () => normalizeDisplayList(getAutocompleteSuggestions(query), MAX_SUGGESTIONS),
    [query]
  );
  const visibleTrendingSearches = useMemo(
    () => normalizeDisplayList(trendingSearches, MAX_TRENDING_ITEMS),
    []
  );
  const visibleRecentSearches = useMemo(
    () =>
      normalizeDisplayList(
        recentSearches.length ? recentSearches : visibleTrendingSearches.slice(0, MAX_RECENT_PANEL_ITEMS),
        MAX_RECENT_PANEL_ITEMS
      ),
    [recentSearches, visibleTrendingSearches]
  );
  const visibleExploreSearches = useMemo(
    () => normalizeDisplayList(trendingSearches, compact ? 4 : 5),
    [compact]
  );
  // The shared homepage search uses the same visual shell but no custom overlay. Keeping dropdowns opt-in
  // avoids duplicate absolute panels during cross-route transitions and makes the homepage submit path deterministic.
  const shouldRenderOverlay =
    enableOverlay &&
    focused &&
    !isNavigating &&
    (suggestions.length > 0 || visibleTrendingSearches.length > 0 || visibleRecentSearches.length > 0);

  useEffect(() => {
    if (!enableOverlay || typeof window === "undefined") {
      return;
    }

    function handleOverlayOpen(event: Event) {
      const customEvent = event as CustomEvent<{ instanceId?: string }>;

      if (customEvent.detail?.instanceId !== instanceId) {
        // Only one search overlay should ever remain open, even if multiple page trees coexist during navigation.
        setFocused(false);
      }
    }

    window.addEventListener(SEARCH_OVERLAY_EVENT, handleOverlayOpen as EventListener);

    return () => {
      window.removeEventListener(SEARCH_OVERLAY_EVENT, handleOverlayOpen as EventListener);
    };
  }, [enableOverlay, instanceId]);

  function openOverlay() {
    if (!enableOverlay || isNavigating) {
      return;
    }

    setFocused(true);

    if (typeof window === "undefined") {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(SEARCH_OVERLAY_EVENT, {
        detail: { instanceId }
      })
    );
  }

  function closeOverlay() {
    setFocused(false);
  }

  function persistRecentSearches(values: string[]) {
    // Keep the persisted payload canonical before state or storage ever sees it.
    const nextRecent = writeRecentSearchesToStorage(values);
    setRecentSearches(nextRecent);

    return nextRecent;
  }

  function navigateToSearch(value: string) {
    const nextUrl = buildSearchUrl(value);
    const currentUrl =
      typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "";

    // Skip same-route pushes and repeated transitions targeting the same URL.
    if (nextUrl === currentUrl || lastNavigationRef.current === nextUrl) {
      setIsNavigating(false);
      return;
    }

    // Hide the dropdown before navigating so overlapping route trees cannot stack multiple absolute panels.
    closeOverlay();
    setIsNavigating(true);
    lastNavigationRef.current = nextUrl;
    router.push(nextUrl);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedQuery = normalizeSearchValue(query);

    if (normalizedQuery) {
      persistRecentSearches([normalizedQuery, ...recentSearches]);
    }

    closeOverlay();
    navigateToSearch(normalizedQuery);
  }

  function selectSuggestion(value: string) {
    const normalizedValue = normalizeSearchValue(value);

    setQuery(normalizedValue);

    if (normalizedValue) {
      persistRecentSearches([normalizedValue, ...recentSearches]);
    }

    closeOverlay();
    navigateToSearch(normalizedValue);
  }

  function handleSuggestionMouseDown(value: string) {
    return (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      selectSuggestion(value);
    };
  }

  return (
    <div className={cn("w-full min-w-0", compact ? "max-w-4xl" : "max-w-5xl")}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex w-full min-w-0 items-center gap-3 rounded-[30px] border border-slate-200/80 bg-white/95 p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition focus-within:border-teal-300 focus-within:shadow-[0_30px_90px_rgba(15,118,110,0.18)]",
          shouldRenderOverlay && "rounded-b-[20px]"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-100 text-teal-700">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={query}
          onFocus={enableOverlay ? openOverlay : undefined}
          onBlur={closeOverlay}
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
          className="rounded-full bg-gradient-to-r from-slate-950 via-slate-900 to-teal-900 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          Compare deals
        </button>

        {shouldRenderOverlay ? (
          <div className="absolute inset-x-0 top-[calc(100%-4px)] z-30 max-h-[70vh] overflow-y-auto rounded-b-[28px] border border-slate-200 border-t-0 bg-white p-4 shadow-[0_28px_60px_rgba(15,23,42,0.16)]">
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
                      onMouseDown={handleSuggestionMouseDown(item)}
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
                    {visibleTrendingSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={handleSuggestionMouseDown(item)}
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
                    {visibleRecentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onMouseDown={handleSuggestionMouseDown(item)}
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
          {visibleExploreSearches.map((item) => (
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
