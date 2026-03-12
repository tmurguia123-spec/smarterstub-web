import "server-only";

import { ProviderConnector } from "@/lib/providers/types";

export const stubHubConnector: ProviderConnector = {
  providerId: "stubhub",
  async searchEvents() {
    // TODO: Add StubHub auth and API client once partner credentials are available.
    return [];
  },
  async getEventById() {
    // TODO: Map StubHub inventory, fees, and delivery fields into normalized SmarterStub listings.
    return null;
  }
};
