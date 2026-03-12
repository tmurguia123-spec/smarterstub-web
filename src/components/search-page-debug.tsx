"use client";

import { useEffect } from "react";

export function SearchPageDebug({
  query,
  resultCount
}: {
  query: string;
  resultCount: number;
}) {
  useEffect(() => {
    console.info("[SmarterStub][search] mounted", { query, resultCount });

    return () => {
      console.info("[SmarterStub][search] unmounted", { query, resultCount });
    };
  }, [query, resultCount]);

  useEffect(() => {
    console.info("[SmarterStub][search] data", { query, resultCount });
  }, [query, resultCount]);

  return null;
}
