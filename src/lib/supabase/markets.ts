import type { Market, MarketResolution, MarketSource, UserVote, VoteBreakdown, VoteOption } from "@/types/market";
import type { SupabaseMarket, SupabaseResolution, SupabaseValidatorProfile, SupabaseVote } from "@/types/supabase";
import { isSupabaseConfigured, supabase } from "./client";

const voteOptions: VoteOption[] = ["Accurate", "False", "Misleading", "Unverifiable"];

export type MarketsWithVotes = {
  markets: Market[];
  resolutions: SupabaseResolution[];
  votes: SupabaseVote[];
};

export type ResolveMarketInput = {
  finalResult: VoteOption;
  marketId: string;
  resolverConfidence: number;
  resolverNote: string;
  resolvedBy: string;
};

type SupabaseLikeError = {
  code?: string | null;
  details?: string | null;
  hint?: string | null;
  message?: string | null;
};

export class SupabaseStepError extends Error {
  raw: unknown;
  step: string;

  constructor(step: string, message: string, raw: unknown) {
    super(message);
    this.name = "SupabaseStepError";
    this.raw = raw;
    this.step = step;
  }
}

function emptyVoteBreakdown(): VoteBreakdown {
  return {
    Accurate: 0,
    False: 0,
    Misleading: 0,
    Unverifiable: 0,
  };
}

export function normalizeVoteOption(option: string): VoteOption | null {
  const normalized = option.toLowerCase();

  return voteOptions.find((voteOption) => voteOption.toLowerCase() === normalized) ?? null;
}

export function getReputationTier(points: number) {
  if (points >= 500) {
    return "Elite Validator";
  }

  if (points >= 200) {
    return "Trusted Validator";
  }

  if (points >= 80) {
    return "Rising Validator";
  }

  return "New Validator";
}

export function formatSupabaseError(step: string, error: unknown) {
  const possibleError = error as SupabaseLikeError | null | undefined;

  return `${step}: ${possibleError?.message ?? "Unknown error"} | code: ${possibleError?.code ?? "none"} | details: ${possibleError?.details ?? "none"} | hint: ${possibleError?.hint ?? "none"}`;
}

function throwSupabaseStepError(step: string, error: unknown): never {
  throw new SupabaseStepError(step, formatSupabaseError(step, error), error);
}

export function mapSupabaseResolutionToMarketResolution(
  resolution: SupabaseResolution,
): MarketResolution | null {
  const finalResult = normalizeVoteOption(String(resolution.final_result));

  if (!finalResult) {
    return null;
  }

  return {
    id: resolution.id,
    marketId: resolution.market_id,
    finalResult,
    resolverNote: resolution.resolver_note,
    resolverConfidence: resolution.resolver_confidence,
    resolvedBy: resolution.resolved_by,
    createdAt: resolution.created_at,
  };
}

function getValidHttpUrl(value: unknown): string | undefined {
  return typeof value === "string" && value.startsWith("http") ? value : undefined;
}

export function normalizeSources(input: unknown): MarketSource[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flatMap((source) => {
    if (typeof source === "string") {
      const label = source.trim();

      return label ? [{ label }] : [];
    }

    if (!source || typeof source !== "object") {
      return [];
    }

    const maybeSource = source as { label?: unknown; url?: unknown };

    if (typeof maybeSource.label !== "string" || !maybeSource.label.trim()) {
      return [];
    }

    const url = getValidHttpUrl(maybeSource.url);
    const normalizedSource: MarketSource = { label: maybeSource.label.trim() };

    if (url) {
      normalizedSource.url = url;
    }

    return [normalizedSource];
  });
}

export function mapSupabaseMarketToMarket(
  market: SupabaseMarket,
  votes: SupabaseVote[],
  resolutions: SupabaseResolution[] = [],
): Market {
  const voteBreakdown = emptyVoteBreakdown();
  const marketVotes = votes.filter((vote) => vote.market_id === market.id);
  const resolution = resolutions.find((item) => item.market_id === market.id);

  for (const vote of marketVotes) {
    const selectedOption = normalizeVoteOption(String(vote.selected_option));

    if (selectedOption) {
      voteBreakdown[selectedOption] += 1;
    }
  }

  return {
    id: market.id,
    title: market.title,
    claim: market.claim,
    aiSummary: market.ai_summary ?? "No AI summary has been attached to this market yet.",
    sources: normalizeSources(market.sources),
    aiConfidence: market.ai_confidence ?? 0,
    status: market.status,
    closesAt: market.closes_at,
    duration: market.duration,
    totalVotes: marketVotes.length,
    voteBreakdown,
    resolution: resolution ? mapSupabaseResolutionToMarketResolution(resolution) ?? undefined : undefined,
  };
}

export function mapSupabaseVoteToUserVote(vote: SupabaseVote): UserVote | null {
  const selectedOption = normalizeVoteOption(String(vote.selected_option));

  if (!selectedOption) {
    return null;
  }

  return {
    marketId: vote.market_id,
    walletAddress: vote.wallet_address,
    option: selectedOption,
    submittedAt: vote.created_at ?? new Date().toISOString(),
    txHash: vote.tx_hash ?? undefined,
  };
}

export async function loadMarketsWithVotes(): Promise<MarketsWithVotes | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("Supabase env vars are missing. Falling back to local mock market data.");
    return null;
  }

  const [
    { data: markets, error: marketsError },
    { data: votes, error: votesError },
    { data: resolutions, error: resolutionsError },
  ] = await Promise.all([
    supabase
      .from("markets")
      .select("id,title,claim,ai_summary,sources,ai_confidence,status,duration,closes_at,created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("votes")
      .select("id,market_id,wallet_address,selected_option,vote_hash,tx_hash,created_at"),
    supabase
      .from("resolutions")
      .select("id,market_id,final_result,resolver_note,resolver_confidence,resolved_by,created_at"),
  ]);

  if (marketsError) {
    throw marketsError;
  }

  if (votesError) {
    throw votesError;
  }

  if (resolutionsError) {
    throw resolutionsError;
  }

  const voteRows = (votes ?? []) as SupabaseVote[];
  const resolutionRows = (resolutions ?? []) as SupabaseResolution[];

  return {
    markets: ((markets ?? []) as SupabaseMarket[]).map((market) =>
      mapSupabaseMarketToMarket(market, voteRows, resolutionRows),
    ),
    resolutions: resolutionRows,
    votes: voteRows,
  };
}

export async function fastForwardMarket(marketId: string) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const pastDate = new Date(Date.now() - 60_000).toISOString();
  const { data, error } = await supabase
    .from("markets")
    .update({ closes_at: pastDate })
    .eq("id", marketId)
    .neq("status", "resolved")
    .select("id,title,claim,ai_summary,sources,ai_confidence,status,duration,closes_at,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as SupabaseMarket;
}

export async function closeMarket(marketId: string) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("markets")
    .update({ status: "closed" })
    .eq("id", marketId)
    .neq("status", "resolved")
    .select("id,title,claim,ai_summary,sources,ai_confidence,status,duration,closes_at,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as SupabaseMarket;
}

async function updateValidatorProfiles(marketVotes: SupabaseVote[], finalResult: VoteOption) {
  if (!supabase || marketVotes.length === 0) {
    return;
  }

  for (const vote of marketVotes) {
    const profileStep = `Validator profile update failed for wallet ${vote.wallet_address}`;
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from("validator_profiles")
      .select("wallet_address,total_votes,correct_votes,current_streak,points,reputation_tier,updated_at")
      .eq("wallet_address", vote.wallet_address)
      .maybeSingle();

    if (profileFetchError) {
      throwSupabaseStepError(profileStep, profileFetchError);
    }

    const profile = existingProfile as SupabaseValidatorProfile | null;
    const selectedOption = normalizeVoteOption(String(vote.selected_option));
    const isCorrect = selectedOption === finalResult;
    const points = (profile?.points ?? 0) + (isCorrect ? 20 : 0);
    const profileUpdate = {
      wallet_address: vote.wallet_address,
      total_votes: (profile?.total_votes ?? 0) + 1,
      correct_votes: (profile?.correct_votes ?? 0) + (isCorrect ? 1 : 0),
      current_streak: isCorrect ? (profile?.current_streak ?? 0) + 1 : 0,
      points,
      reputation_tier: getReputationTier(points),
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("validator_profiles")
      .upsert(profileUpdate, { onConflict: "wallet_address" });

    if (upsertError) {
      console.warn("[validator profile update failed]", {
        walletAddress: vote.wallet_address,
        isCorrect,
        profilePayload: profileUpdate,
        message: (upsertError as SupabaseLikeError).message ?? "Unknown error",
        code: (upsertError as SupabaseLikeError).code ?? "none",
        details: (upsertError as SupabaseLikeError).details ?? "none",
        hint: (upsertError as SupabaseLikeError).hint ?? "none",
      });
      throwSupabaseStepError(profileStep, upsertError);
    }
  }
}

export async function resolveMarket({
  finalResult,
  marketId,
  resolverConfidence,
  resolverNote,
  resolvedBy,
}: ResolveMarketInput) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const resolutionStep = "Resolution insert failed";
  const { data: resolution, error: resolutionError } = await supabase
    .from("resolutions")
    .insert({
      market_id: marketId,
      final_result: finalResult,
      resolver_note: resolverNote.trim() || null,
      resolver_confidence: resolverConfidence,
      resolved_by: resolvedBy,
    })
    .select("id,market_id,final_result,resolver_note,resolver_confidence,resolved_by,created_at")
    .single();

  if (resolutionError) {
    throwSupabaseStepError(resolutionStep, resolutionError);
  }

  const marketStep = "Market status update failed";
  const { error: updateMarketError } = await supabase
    .from("markets")
    .update({ status: "resolved" })
    .eq("id", marketId);

  if (updateMarketError) {
    throwSupabaseStepError(marketStep, updateMarketError);
  }

  const votesStep = "Market votes fetch failed";
  const { data: marketVotes, error: votesError } = await supabase
    .from("votes")
    .select("*")
    .eq("market_id", marketId);

  if (votesError) {
    throwSupabaseStepError(votesStep, votesError);
  }

  await updateValidatorProfiles((marketVotes ?? []) as SupabaseVote[], finalResult);

  return resolution as SupabaseResolution;
}

export async function insertVote({
  marketId,
  selectedOption,
  txHash,
  walletAddress,
}: {
  marketId: string;
  selectedOption: VoteOption;
  txHash?: string;
  walletAddress: string;
}) {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("votes")
    .insert({
      market_id: marketId,
      wallet_address: walletAddress,
      selected_option: selectedOption,
      vote_hash: null,
      tx_hash: txHash ?? null,
    })
    .select("id,market_id,wallet_address,selected_option,vote_hash,tx_hash,created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as SupabaseVote;
}

export function isDuplicateVoteError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const possibleError = error as { code?: string; message?: string; details?: string };
  const details = `${possibleError.message ?? ""} ${possibleError.details ?? ""}`.toLowerCase();

  return possibleError.code === "23505" || details.includes("one_vote_per_wallet_per_market");
}

export type MarketDraftInput = {
  title: string;
  claim: string;
  ai_summary: string;
  sources: unknown;
  ai_confidence: number;
  duration: "24h" | "48h";
};

export async function insertMarkets(drafts: MarketDraftInput[]) {
  if (!isSupabaseConfigured || !supabase || drafts.length === 0) {
    return [];
  }

  const rows = drafts.map((draft) => {
    const hours = draft.duration === "24h" ? 24 : 48;
    const closesAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();

    return {
      title: draft.title,
      claim: draft.claim,
      ai_summary: draft.ai_summary,
      sources: draft.sources,
      ai_confidence: draft.ai_confidence,
      status: "open" as const,
      duration: draft.duration,
      closes_at: closesAt,
    };
  });

  const { data, error } = await supabase
    .from("markets")
    .insert(rows)
    .select("id,title,claim,ai_summary,sources,ai_confidence,status,duration,closes_at,created_at");

  if (error) {
    throw error;
  }

  return (data ?? []) as SupabaseMarket[];
}

export async function insertAgentLogEntry({
  action,
  details,
}: {
  action: string;
  details: Record<string, unknown>;
}) {
  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  const { error } = await supabase.from("agent_logs").insert({
    message: `Admin ${action}`,
    level: "info",
    metadata: details,
  });

  if (error) {
    console.warn("Failed to insert agent log entry", { action, error });
  }
}
