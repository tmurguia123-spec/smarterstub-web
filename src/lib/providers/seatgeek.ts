import "server-only";

import { ProviderConnector } from "@/lib/providers/types";

export const seatGeekConnector: ProviderConnector = {
  providerId: "seatgeek",
  async searchEvents() {
    // TODO: Add SeatGeek client credentials / OAuth flow when access is available.
    // Keep returning an empty result so provider aggregation can fail gracefully.
    return [];
  },
  async getEventById() {
    // TODO: Normalize SeatGeek event + listing payloads into the shared SmarterStub model.
    return null;
  }
};
