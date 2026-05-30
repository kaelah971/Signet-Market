import type { MarketStatus, VoteOption } from "@/types/market";

export type SupabaseMarket = {
  id: string;
  title: string;
  claim: string;
  ai_summary: string | null;
  sources: unknown;
  ai_confidence: number | null;
  status: MarketStatus;
  duration: "24h" | "48h";
  closes_at: string;
  created_at: string | null;
};

export type SupabaseVote = {
  id?: string;
  market_id: string;
  wallet_address: string;
  selected_option: VoteOption | string;
  vote_hash: string | null;
  tx_hash: string | null;
  created_at: string | null;
};

export type SupabaseResolution = {
  id: string;
  market_id: string;
  final_result: VoteOption | string;
  resolver_note: string | null;
  resolver_confidence: number | null;
  resolved_by: string | null;
  created_at: string | null;
};

export type SupabaseValidatorProfile = {
  wallet_address: string;
  total_votes: number | null;
  correct_votes: number | null;
  current_streak: number | null;
  points: number | null;
  reputation_tier: string | null;
  updated_at: string | null;
};

export type SupabaseAgentLog = {
  id: string;
  message: string;
  level: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
};
