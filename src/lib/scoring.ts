import { Event, EventRanking, EventTrend, Listing, ListingInsight, PriceComparison } from "@/types";
import { getProvider } from "@/lib/fallback-data";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function parseSectionQuality(section: string) {
  const normalized = section.toUpperCase();

  if (normalized.includes("ORCH") || normalized.startsWith("1") || normalized.startsWith("A")) {
    return 92;
  }

  if (
    normalized.includes("MEZZ") ||
    normalized.startsWith("2") ||
    normalized.startsWith("K") ||
    normalized.startsWith("L")
  ) {
    return 78;
  }

  return 62;
}

function parseRowQuality(row: string) {
  const numeric = Number(row);

  if (!Number.isNaN(numeric)) {
    return clamp(100 - numeric * 2.5);
  }

  const alpha = row.toUpperCase().charCodeAt(0) - 64;
  return clamp(100 - alpha * 3);
}

function getComparableSeatAverage(event: Event, section: string) {
  const sameBucket = event.listings.filter(
    (listing) => parseSectionQuality(listing.section) === parseSectionQuality(section)
  );
  const bucket = sameBucket.length ? sameBucket : event.listings;
  return bucket.reduce((total, listing) => total + listing.totalPrice, 0) / bucket.length;
}

function getDealRating(score: number) {
  if (score >= 90) return "Amazing" as const;
  if (score >= 78) return "Great" as const;
  if (score >= 60) return "Fair" as const;
  return "Overpriced" as const;
}

function getListingRecommendation(score: number, trend: EventTrend) {
  if (score >= 90 && trend.momentum === "rising") return "Buy Now" as const;
  if (score >= 88) return "Good deal relative to similar seats" as const;
  if (trend.momentum === "rising") return "Price likely rising" as const;
  if (trend.momentum === "stable") return "Price likely stable" as const;
  return "Wait" as const;
}

export function getEventTrend(event: Event): EventTrend {
  const series = event.historicalPrices;
  const first = series[0];
  const last = series[series.length - 1];
  const changePct = Number((((last - first) / first) * 100).toFixed(1));
  const marketAverage = Math.round(series.reduce((sum, value) => sum + value, 0) / series.length);

  if (changePct >= 4) {
    return {
      recommendation: "Price likely rising",
      momentum: "rising",
      changePct,
      marketAverage,
      summary: "Prices have trended upward recently and comparable inventory is tightening."
    };
  }

  if (changePct <= -4) {
    return {
      recommendation: "Buy Now",
      momentum: "softening",
      changePct,
      marketAverage,
      summary: "Prices softened recently, and current listings are good relative to the recent market."
    };
  }

  return {
    recommendation: "Price likely stable",
    momentum: "stable",
    changePct,
    marketAverage,
    summary: "Pricing has been relatively stable, so buyers can optimize for seat quality and trust."
  };
}

export function getListingInsight(event: Event, listing: Listing): ListingInsight {
  const provider = getProvider(listing.provider);
  const feePercent = (listing.feeEstimate / listing.totalPrice) * 100;
  const sectionQuality = parseSectionQuality(listing.section);
  const rowQuality = parseRowQuality(listing.row);
  const quantityAvailable = clamp(listing.quantity * 18 + 25);
  const comparableSeatAverage = getComparableSeatAverage(event, listing.section);
  const marketValueGap = ((comparableSeatAverage - listing.totalPrice) / comparableSeatAverage) * 100;
  const popularityScarcity = clamp(event.popularity - listing.quantity * 6 + 12);
  const averageTotal = event.listings.reduce((sum, item) => sum + item.totalPrice, 0) / event.listings.length;
  const lowestTotal = Math.min(...event.listings.map((item) => item.totalPrice));
  const highestTotal = Math.max(...event.listings.map((item) => item.totalPrice));
  const trend = getEventTrend(event);

  const totalPriceAfterFees = clamp(
    100 - ((listing.totalPrice - lowestTotal) / Math.max(1, highestTotal - lowestTotal)) * 100
  );
  const feePercentage = clamp(100 - feePercent * 3.1);
  const providerTrust = provider?.trustScore ?? 85;
  const refundFlexibility = provider?.refundFlexibility ?? 70;
  const deliveryReliability = provider?.deliveryReliability ?? 84;
  const comparableSeatValue = clamp(72 + marketValueGap * 7);

  const confidenceScore = Math.round(
    totalPriceAfterFees * 0.2 +
      feePercentage * 0.12 +
      sectionQuality * 0.12 +
      rowQuality * 0.08 +
      quantityAvailable * 0.05 +
      providerTrust * 0.14 +
      refundFlexibility * 0.08 +
      deliveryReliability * 0.08 +
      popularityScarcity * 0.05 +
      comparableSeatValue * 0.08
  );

  const savingsVsHighest = highestTotal - listing.totalPrice;
  const savingsVsAverage = Math.round(averageTotal - listing.totalPrice);
  const dealRating = getDealRating(confidenceScore);
  const recommendation = getListingRecommendation(confidenceScore, trend);
  const summary =
    confidenceScore >= 90
      ? "Strong all-in value with trusted delivery and healthy seat quality."
      : confidenceScore >= 78
        ? "Good total price with balanced fees, trust, and seat position."
        : confidenceScore >= 60
          ? "Reasonable option, but tradeoffs on fees or seat quality are visible."
          : "Market price is rich relative to comparable seats and fee drag is high.";

  return {
    listingId: listing.id,
    confidenceScore,
    dealRating,
    recommendation,
    summary,
    savingsVsHighest,
    savingsVsAverage,
    feePercent: Math.round(feePercent),
    seatQualityScore: Math.round((sectionQuality + rowQuality) / 2),
    scoreFactors: {
      totalPriceAfterFees: Math.round(totalPriceAfterFees),
      feePercentage: Math.round(feePercentage),
      sectionQuality: Math.round(sectionQuality),
      rowQuality: Math.round(rowQuality),
      quantityAvailable: Math.round(quantityAvailable),
      providerTrust: Math.round(providerTrust),
      refundFlexibility: Math.round(refundFlexibility),
      deliveryReliability: Math.round(deliveryReliability),
      popularityScarcity: Math.round(popularityScarcity),
      comparableSeatValue: Math.round(comparableSeatValue)
    }
  };
}

export function getEventRanking(event: Event): EventRanking {
  const scored = event.listings.map((listing) => ({
    listing,
    insight: getListingInsight(event, listing),
    provider: getProvider(listing.provider)
  }));

  const bestOverallBuy = [...scored].sort((a, b) => b.insight.confidenceScore - a.insight.confidenceScore)[0];
  const budgetPool = [...scored]
    .sort((a, b) => a.listing.totalPrice - b.listing.totalPrice)
    .slice(0, Math.max(2, Math.ceil(scored.length / 2)));
  const bestBudgetBuy = [...budgetPool].sort((a, b) => b.insight.confidenceScore - a.insight.confidenceScore)[0];
  const bestPremiumValue = [...scored].sort(
    (a, b) => b.insight.seatQualityScore - a.insight.seatQualityScore || b.insight.confidenceScore - a.insight.confidenceScore
  )[0];
  const lowestTotalPrice = [...scored].sort((a, b) => a.listing.totalPrice - b.listing.totalPrice)[0];
  const lowestFees = [...scored].sort((a, b) => a.listing.feeEstimate - b.listing.feeEstimate)[0];
  const mostTrustedSeller = [...scored].sort(
    (a, b) => (b.provider?.trustScore ?? 0) - (a.provider?.trustScore ?? 0)
  )[0];

  return {
    bestOverallBuy: bestOverallBuy.listing.id,
    bestBudgetBuy: bestBudgetBuy.listing.id,
    bestPremiumValue: bestPremiumValue.listing.id,
    lowestTotalPrice: lowestTotalPrice.listing.id,
    lowestFees: lowestFees.listing.id,
    mostTrustedSeller: mostTrustedSeller.listing.id
  };
}

export function getEventComparison(event: Event): PriceComparison {
  const sortedByTotal = [...event.listings].sort((a, b) => a.totalPrice - b.totalPrice);
  const sortedByBase = [...event.listings].sort((a, b) => a.basePrice - b.basePrice);
  const bestValue = [...event.listings].sort(
    (a, b) => getListingInsight(event, b).confidenceScore - getListingInsight(event, a).confidenceScore
  )[0];
  const highest = sortedByTotal[sortedByTotal.length - 1];

  return {
    eventId: event.id,
    lowestBasePrice: sortedByBase[0].basePrice,
    lowestTotalPrice: sortedByTotal[0].totalPrice,
    highestTotalPrice: highest.totalPrice,
    bestValueProvider: bestValue.provider,
    comparedProviders: event.listings.length,
    savingsVsHighest: highest.totalPrice - sortedByTotal[0].totalPrice
  };
}
