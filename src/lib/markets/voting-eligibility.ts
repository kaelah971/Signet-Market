import type { Market, UserVote } from "@/types/market";

export type MarketAvailability = "open" | "closed" | "expired" | "resolved";

export function isMarketExpired(market: Market, now = new Date()) {
  return new Date(market.closesAt).getTime() <= now.getTime();
}

export function getMarketAvailability(market: Market, now = new Date()): MarketAvailability {
  if (market.status === "resolved") {
    return "resolved";
  }

  if (market.status === "closed") {
    return "closed";
  }

  if (isMarketExpired(market, now)) {
    return "expired";
  }

  return "open";
}

export function isMarketVotable(market: Market, userVote?: UserVote, now = new Date()) {
  return getMarketAvailability(market, now) === "open" && !userVote;
}

export function getMarketUnavailableMessage(market: Market, userVote?: UserVote, now = new Date()) {
  if (userVote) {
    return "You already voted on this market.";
  }

  const availability = getMarketAvailability(market, now);

  if (availability === "closed") {
    return "This market is closed. Voting is no longer available.";
  }

  if (availability === "resolved") {
    return "This market has been resolved. Voting is no longer available.";
  }

  if (availability === "expired") {
    return "This market has expired and is waiting for resolution.";
  }

  return null;
}
