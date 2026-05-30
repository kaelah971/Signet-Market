export type VoteOption = "Accurate" | "False" | "Misleading" | "Unverifiable";

export type MarketStatus = "open" | "closed" | "resolved";

export type VoteBreakdown = Record<VoteOption, number>;

export type MarketSource = {
  label: string;
  url?: string;
};

export type MarketResolution = {
  id: string;
  marketId: string;
  finalResult: VoteOption;
  resolverNote: string | null;
  resolverConfidence: number | null;
  resolvedBy: string | null;
  createdAt: string | null;
};

export type Market = {
  id: string;
  title: string;
  claim: string;
  aiSummary: string;
  sources: MarketSource[];
  aiConfidence: number;
  status: MarketStatus;
  closesAt: string;
  duration: "24h" | "48h";
  totalVotes: number;
  voteBreakdown: VoteBreakdown;
  resolution?: MarketResolution;
};

export type UserVote = {
  marketId: string;
  walletAddress: string;
  option: VoteOption;
  submittedAt: string;
  txHash?: string;
};
