import type { MetadataRoute } from "next";
import { buildEventRoute, searchLiveEvents } from "@/lib/ticket-service";
import { getSiteUrl } from "@/lib/site-url";
import type { LiveEvent } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const liveEvents = await searchLiveEvents().catch(() => []);

  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${baseUrl}/search`,
      changeFrequency: "daily",
      priority: 0.8
    },
    ...liveEvents.slice(0, 100).map((event: LiveEvent) => ({
      url: `${baseUrl}${buildEventRoute(event)}`,
      changeFrequency: "hourly" as const,
      priority: 0.7
    }))
  ];
}
