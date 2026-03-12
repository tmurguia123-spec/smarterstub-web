import { Event } from "@/types";

export interface ProviderSearchParams {
  query: string;
}

export interface ProviderConnector {
  providerId: string;
  searchEvents(params: ProviderSearchParams): Promise<Event[]>;
  getEventById(id: string): Promise<Event | null>;
}
