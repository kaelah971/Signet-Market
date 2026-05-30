"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { mockMarkets } from "@/data/mock-markets";
import {
  getMarketAvailability,
  getMarketUnavailableMessage,
  isMarketExpired,
  isMarketVotable,
} from "@/lib/markets/voting-eligibility";
import {
  closeMarket,
  fastForwardMarket,
  loadMarketsWithVotes,
  mapSupabaseVoteToUserVote,
  resolveMarket,
  SupabaseStepError,
} from "@/lib/supabase/markets";
import type { Market, UserVote, VoteOption } from "@/types/market";
import type { SupabaseVote } from "@/types/supabase";
import { shortenInjectiveAddress, useWallet } from "@/components/wallet/wallet-provider";
import { isAdminWallet } from "@/lib/admin";
import { injectiveTestnetChainId } from "@/lib/injective/testnet";

const voteOptions: VoteOption[] = ["Accurate", "False", "Misleading", "Unverifiable"];

type AdminActionName = "fast-forward" | "close" | "confirm-resolution";

const optionStyles: Record<VoteOption, { dot: string; icon: string; selected: string; state: string }> = {
  Accurate: {
    dot: "dist-accurate",
    icon: "icon-accurate",
    selected: "selected-accurate",
    state: "state-accurate",
  },
  False: {
    dot: "dist-false",
    icon: "icon-false",
    selected: "selected-false",
    state: "state-false",
  },
  Misleading: {
    dot: "dist-misleading",
    icon: "icon-misleading",
    selected: "selected-misleading",
    state: "state-misleading",
  },
  Unverifiable: {
    dot: "dist-unverif",
    icon: "icon-unverif",
    selected: "selected-unverifiable",
    state: "",
  },
};

const optionIcons: Record<VoteOption, string> = {
  Accurate: "✓",
  False: "✗",
  Misleading: "!",
  Unverifiable: "?",
};

function formatCountdown(closesAt: string, mounted: boolean) {
  if (!mounted) {
    return "Syncing...";
  }

  const diffMs = new Date(closesAt).getTime() - Date.now();

  if (diffMs <= 0) {
    return "Closed";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return `${days}d ${remainingHours}h left`;
  }

  return `${hours}h ${minutes}m left`;
}

function getStableMarketAvailability(market: Market, mounted: boolean) {
  if (mounted) {
    return getMarketAvailability(market);
  }

  return market.status;
}

function getBreakdownPercent(market: Market, option: VoteOption) {
  if (market.totalVotes === 0) {
    return 0;
  }

  return Math.round((market.voteBreakdown[option] / market.totalVotes) * 100);
}

function getUserVoteKey(walletAddress: string, marketId: string) {
  return `${walletAddress.toLowerCase()}:${marketId}`;
}

function getMarketStatusLabel(market: Market, mounted: boolean) {
  const availability = getStableMarketAvailability(market, mounted);

  return availability.charAt(0).toUpperCase() + availability.slice(1);
}

function getMarketStatusBadgeClass(market: Market, mounted: boolean) {
  const availability = getStableMarketAvailability(market, mounted);

  if (availability === "open") {
    return "badge-open";
  }

  if (availability === "resolved") {
    return "badge-resolved";
  }

  return "badge-closed";
}

function getVoteEligibility({
  market,
  userVote,
  walletAddress,
  walletStatus,
}: {
  market: Market;
  userVote?: UserVote;
  walletAddress: string | null;
  walletStatus: string;
}) {
  const disabledReason =
    getMarketUnavailableMessage(market, userVote) ??
    (walletStatus !== "connected" || !walletAddress
      ? "Connect your Injective testnet wallet before voting."
      : null);

  return {
    canVote: !disabledReason,
    disabledReason,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof SupabaseStepError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const possibleError = error as { details?: unknown; message?: unknown };

    if (typeof possibleError.message === "string") {
      return possibleError.message;
    }

    if (typeof possibleError.details === "string") {
      return possibleError.details;
    }
  }

  return null;
}

function getAdminErrorStep(error: unknown) {
  return error instanceof SupabaseStepError ? error.step : "unknown";
}

function getAdminErrorRaw(error: unknown) {
  return error instanceof SupabaseStepError ? error.raw : error;
}

function VoteBar({ market }: { market: Market }) {
  return (
    <div className="vote-bar" aria-label="Vote distribution">
      {voteOptions.map((option) => {
        const percent = getBreakdownPercent(market, option);

        if (percent <= 0) {
          return null;
        }

        return (
          <div
            className={option === "Unverifiable" ? "vb-unverif" : `vb-${option.toLowerCase()}`}
            key={option}
            style={{ width: `${percent}%` }}
          />
        );
      })}
    </div>
  );
}

function ConfirmationModal({
  isSubmitting,
  market,
  onCancel,
  onConfirm,
  selectedOption,
  submittingStage,
  walletAddress,
}: {
  isSubmitting: boolean;
  market: Market;
  onCancel: () => void;
  onConfirm: () => void;
  selectedOption: VoteOption;
  submittingStage?: "signing" | "saving";
  walletAddress: string;
}) {
  const buttonLabel = isSubmitting
    ? submittingStage === "signing"
      ? "Signing with Keplr..."
      : submittingStage === "saving"
        ? "Saving vote..."
        : "Submitting..."
    : "Confirm Vote";

  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-modal="true" className="vote-confirm-modal" role="dialog">
        <div className="card-label">Confirm Vote</div>
        <h3>{market.title}</h3>
        <div className="confirm-row">
          <span>Selected vote</span>
          <strong>{selectedOption}</strong>
        </div>
        <div className="confirm-row">
          <span>Wallet</span>
          <strong>{shortenInjectiveAddress(walletAddress)}</strong>
        </div>
        <p>
          Sign with Keplr to cast this vote. Your signature will be anchored on Injective testnet by the relayer.
        </p>
        <div className="confirm-actions">
          <button className="btn-ghost" disabled={isSubmitting} onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="submit-btn confirm-submit" disabled={isSubmitting} onClick={onConfirm} type="button">
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function VoteSuccessModal({
  market,
  onBackToMarkets,
  onStayHere,
  selectedOption,
  txHash,
}: {
  market: Market;
  onBackToMarkets: () => void;
  onStayHere: () => void;
  selectedOption: VoteOption;
  txHash?: string;
}) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div aria-modal="true" className="vote-confirm-modal vote-success-modal" role="dialog">
        <div className="card-label">Vote Submitted</div>
        <h3>{market.title}</h3>
        <div className="success-check">✓</div>
        <div className="confirm-row">
          <span>Selected vote</span>
          <strong>{selectedOption}</strong>
        </div>
        {txHash ? (
          <>
            <div className="confirm-row">
              <span>tx</span>
              <strong>{txHash.slice(0, 6)}...{txHash.slice(-4)}</strong>
            </div>
            <p>Verified on Injective Testnet</p>
          </>
        ) : (
          <p>Vote saved locally. No Injective proof attached.</p>
        )}
        <div className="confirm-actions">
          <button className="btn-ghost" onClick={onStayHere} type="button">
            Stay Here
          </button>
          <button className="submit-btn confirm-submit" onClick={onBackToMarkets} type="button">
            Back to Markets
          </button>
        </div>
      </div>
    </div>
  );
}

function MarketDetailModal({
  mounted,
  market,
  message,
  onBackToMarkets,
  onClose,
  onVote,
  userVote,
}: {
  mounted: boolean;
  market: Market;
  message: string | null;
  onBackToMarkets: () => void;
  onClose: () => void;
  onVote: (option: VoteOption) => void;
  userVote?: UserVote;
}) {
  const unavailableMessage = mounted ? getMarketUnavailableMessage(market, userVote) : null;
  const votingUnavailable = mounted ? !isMarketVotable(market, userVote) : true;
  const statusLabel = getMarketStatusLabel(market, mounted);

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        aria-modal="true"
        className="market-detail-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-topline">
          <div className="card-label">Market Detail</div>
          <button aria-label="Close market detail" className="modal-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className="detail-header">
          <div className="detail-meta">
            <div className={`badge ${getMarketStatusBadgeClass(market, mounted)}`}>
              {statusLabel === "Open" && <div className="badge-dot" />} {statusLabel}
            </div>
            <div className="detail-id">MARKET #{market.id}</div>
            <div className="info-chip">Research Validation</div>
            <div className="info-chip">{market.duration} window</div>
            <div className="market-timer">Closes {formatCountdown(market.closesAt, mounted)}</div>
          </div>
          <h2 className="market-modal-title">{market.title}</h2>
          <div className="detail-claim">&quot;{market.claim}&quot;</div>
          <div className="tx-ref">
            <span>Mock market:</span>
            <span className="tx-hash">local-{market.id}</span>
            <span>· Injective Testnet MVP</span>
          </div>
          {market.resolution && (
            <div className="resolution-result">
              Final result: <span>{market.resolution.finalResult}</span>
              {typeof market.resolution.resolverConfidence === "number" && (
                <> · {market.resolution.resolverConfidence}% confidence</>
              )}
            </div>
          )}
        </div>

        <div className="detail-grid modal-detail-grid">
          <div>
            <div className="evidence-card">
              <div className="evidence-header">
                <span className="card-label">AI Evidence Summary</span>
                <div className="confidence-badge">AI {market.aiConfidence}% Confidence</div>
              </div>
              <div className="evidence-body">
                <div className="ai-summary">{market.aiSummary}</div>
                <div className="card-label">Sources ({market.sources.length})</div>
                {market.sources.map((source, index) => (
                  <div className="source-item" key={`${market.id}-source-${index}`}>
                    <span className="source-num">{String(index + 1).padStart(2, "0")}</span>
                    <div className="source-info">
                      <div className="source-title">
                        {source.url?.startsWith("http") ? (
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.label}
                          </a>
                        ) : (
                          <span>{source.label}</span>
                        )}
                      </div>
                      <div className="source-url">{source.url ?? `mock-source.local/research-market/${market.id}`}</div>
                    </div>
                    <span className="source-icon">↗</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="distribution">
              <div className="dist-header">Current Vote Distribution - {market.totalVotes} validators</div>
              {voteOptions.map((option) => {
                const percent = getBreakdownPercent(market, option);
                const styles = optionStyles[option];

                return (
                  <div className="dist-row" key={option}>
                    <div className="dist-label">
                      <div className={`dist-dot ${styles.dot}`} /> {option}
                    </div>
                    <div className="dist-bar-bg">
                      <div className={`dist-bar-fill ${styles.dot}`} style={{ width: `${percent}%` }} />
                    </div>
                    <div className={`dist-pct ${styles.state}`}>{percent}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="vote-panel modal-vote-panel" aria-label="Cast your validation">
            <div className="vote-panel-header">
              <span className="card-label">Cast Your Validation</span>
              <span className="market-timer">{formatCountdown(market.closesAt, mounted)}</span>
            </div>
            <div className="vote-panel-body">
              <div className="vote-options">
                {voteOptions.map((option) => {
                  const styles = optionStyles[option];
                  const alreadySelected = userVote?.option === option;

                  return (
                    <button
                      aria-disabled={votingUnavailable}
                      className={`vote-option ${alreadySelected ? styles.selected : ""}${votingUnavailable ? " vote-option-unavailable" : ""}`}
                      key={option}
                      onClick={() => onVote(option)}
                      type="button"
                    >
                      <div className={`vote-icon ${styles.icon}`}>{optionIcons[option]}</div>
                      <span className="vote-label">{option}</span>
                      <span className="vote-pct">{getBreakdownPercent(market, option)}%</span>
                    </button>
                  );
                })}
              </div>

              <div className="stake-row">
                <div className="stake-label">Mock Stake</div>
                <div className="stake-value">
                  50 <span>pts</span>
                </div>
              </div>

              {unavailableMessage && <div className="wallet-note voted-note">{unavailableMessage}</div>}
              {userVote && (
                <div className="wallet-note voted-note">
                  Your vote: <span>{userVote.option}</span>
                  {userVote.txHash && (
                    <>
                      {" "}· <span>tx: {userVote.txHash.slice(0, 6)}...{userVote.txHash.slice(-4)}</span>
                    </>
                  )}
                </div>
              )}
              {userVote?.txHash && <div className="wallet-note voted-note">Verified on Injective Testnet</div>}
              {message && <div className="wallet-note vote-message">{message}</div>}
              {!mounted && <div className="wallet-note">Connect Injective testnet wallet to submit local MVP votes</div>}
              <button className="btn-ghost modal-back-button" onClick={onBackToMarkets} type="button">
                Back to Markets
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function AdminResolverPanel({
  actionMessage,
  isActionLoading,
  isAdmin,
  markets,
  mounted,
  onCloseMarket,
  onFastForwardMarket,
  onResolveMarket,
}: {
  actionMessage: string | null;
  isActionLoading: (actionId: string) => boolean;
  isAdmin: boolean;
  markets: Market[];
  mounted: boolean;
  onCloseMarket: (marketId: string) => void;
  onFastForwardMarket: (marketId: string) => void;
  onResolveMarket: (marketId: string, finalResult: VoteOption | "", confidence: number, note: string) => void;
}) {
  const [resolutionForms, setResolutionForms] = useState<
    Record<string, { confidence: number; finalResult: VoteOption | ""; note: string }>
  >({});

  function getForm(marketId: string) {
    return resolutionForms[marketId] ?? { confidence: 80, finalResult: "", note: "" };
  }

  function updateForm(
    marketId: string,
    updates: Partial<{ confidence: number; finalResult: VoteOption | ""; note: string }>,
  ) {
    setResolutionForms((currentForms) => ({
      ...currentForms,
      [marketId]: {
        ...getForm(marketId),
        ...updates,
      },
    }));
  }

  const groupedMarkets = {
    open: markets.filter((market) => getStableMarketAvailability(market, mounted) === "open"),
    pending: markets.filter((market) => {
      const availability = getStableMarketAvailability(market, mounted);

      return availability === "closed" || availability === "expired";
    }),
    resolved: markets.filter((market) => getStableMarketAvailability(market, mounted) === "resolved"),
  };

  function renderMarketCard(market: Market) {
    const availability = getStableMarketAvailability(market, mounted);
    const expired = mounted ? isMarketExpired(market) : false;
    const form = getForm(market.id);
    const canResolve = availability === "closed" || availability === "expired";
    const closeTimeLabel = mounted ? new Date(market.closesAt).toLocaleString() : market.closesAt;

    return (
      <div className="admin-market-card" key={market.id}>
        <div className="admin-market-top">
          <div>
            <div className="admin-market-title">{market.title}</div>
            <div className="admin-market-claim">{market.claim}</div>
          </div>
          <div className={`badge ${getMarketStatusBadgeClass(market, mounted)}`}>{getMarketStatusLabel(market, mounted)}</div>
        </div>

        <div className="admin-market-meta">
          <div className="admin-meta-row">
            <span>Close Time</span>
            <strong>{closeTimeLabel}</strong>
          </div>
          <div className="admin-meta-row">
            <span>Total Votes</span>
            <strong>{market.totalVotes}</strong>
          </div>
          <div className="admin-meta-row">
            <span>Expired</span>
            <strong>{expired ? "Yes" : "No"}</strong>
          </div>
          <div className="admin-meta-row">
            <span>Resolution</span>
            <strong>{market.resolution?.finalResult ?? "Pending"}</strong>
          </div>
        </div>

        <div className="admin-breakdown" aria-label={`Vote breakdown for ${market.title}`}>
          {voteOptions.map((option) => (
            <div className="admin-breakdown-pill" key={option}>
              <span>{option}</span>
              <strong>{market.voteBreakdown[option]}</strong>
            </div>
          ))}
        </div>

        {availability === "open" && (
          <div className="admin-actions">
            <button
              className="btn-ghost admin-action"
              disabled={isActionLoading(`fast-forward:${market.id}`)}
              onClick={() => onFastForwardMarket(market.id)}
              type="button"
            >
              {isActionLoading(`fast-forward:${market.id}`) ? "Fast-forwarding..." : "Fast-forward Market"}
            </button>
            <button
              className="btn-ghost admin-action"
              disabled={isActionLoading(`close:${market.id}`)}
              onClick={() => onCloseMarket(market.id)}
              type="button"
            >
              {isActionLoading(`close:${market.id}`) ? "Closing..." : "Close Market"}
            </button>
          </div>
        )}

        {canResolve && (
          <div className="resolver-controls">
            <div className="resolver-form-grid">
              <label className="resolver-field">
                <span>Final Result</span>
                <select
                  aria-label={`Final result for ${market.title}`}
                  className="resolver-input"
                  onChange={(event) => updateForm(market.id, { finalResult: event.target.value as VoteOption | "" })}
                  value={form.finalResult}
                >
                  <option value="">Select final result</option>
                  {voteOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <label className="resolver-field">
                <span>Confidence</span>
                <input
                  aria-label={`Resolver confidence for ${market.title}`}
                  className="resolver-input"
                  max={100}
                  min={0}
                  onChange={(event) => updateForm(market.id, { confidence: Number(event.target.value) })}
                  type="number"
                  value={form.confidence}
                />
              </label>
            </div>
            <label className="resolver-field resolver-note-field">
              <span>Resolver Note</span>
              <textarea
                aria-label={`Resolver note for ${market.title}`}
                className="resolver-note"
                onChange={(event) => updateForm(market.id, { note: event.target.value })}
                placeholder="Add a short demo resolver note"
                value={form.note}
              />
            </label>
            <button
              className="submit-btn admin-resolve-button"
              disabled={isActionLoading(`resolve:${market.id}`)}
              onClick={() => onResolveMarket(market.id, form.finalResult, form.confidence, form.note)}
              type="button"
            >
              {isActionLoading(`resolve:${market.id}`) ? "Resolving..." : "Confirm Resolution"}
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="section admin-resolver-section" id="admin-resolver">
      <div className="section-header">
        <div>
          <div className="section-title">Demo Resolver</div>
          <div className="section-heading">Admin Resolution Controls</div>
        </div>
        <div className="admin-demo-label">
          {isAdmin
            ? "Demo Resolver: testnet-only admin controls."
            : "Admin only: connect the authorized Injective testnet wallet to resolve markets."}
        </div>
      </div>

      {!isAdmin ? (
        <div className="agent-log empty-state">
          Admin only: connect the authorized Injective testnet wallet to resolve markets.
        </div>
      ) : (
        <>
          {actionMessage && <div className="wallet-note vote-message admin-message">{actionMessage}</div>}
          <div className="admin-groups">
            {[
              ["Open Markets", groupedMarkets.open],
              ["Expired / Pending Resolution", groupedMarkets.pending],
              ["Resolved Markets", groupedMarkets.resolved],
            ].map(([label, group]) => (
              <div className="admin-group" key={label as string}>
                <div className="admin-group-heading">
                  <span>{label as string}</span>
                  <strong>{(group as Market[]).length}</strong>
                </div>
                {(group as Market[]).length > 0 ? (
                  (group as Market[]).map((market) => renderMarketCard(market))
                ) : (
                  <div className="admin-empty">No markets in this group.</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function MarketVotingSection({
  onResolveComplete,
}: {
  onResolveComplete?: () => void;
} = {}) {
  const { address, status } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [rawVotes, setRawVotes] = useState<SupabaseVote[]>([]);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedMarketId, setSelectedMarketId] = useState(mockMarkets[0].id);
  const [detailMarketId, setDetailMarketId] = useState<string | null>(null);
  const [pendingVote, setPendingVote] = useState<{ marketId: string; option: VoteOption } | null>(null);
  const [submittedVote, setSubmittedVote] = useState<{ marketId: string; option: VoteOption } | null>(null);
  const [userVotes, setUserVotes] = useState<Record<string, UserVote>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState<string | null>(null);
  const [adminActionId, setAdminActionId] = useState<string | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [voteStage, setVoteStage] = useState<"signing" | "saving" | null>(null);
  const [submittedTxHash, setSubmittedTxHash] = useState<string | null>(null);

  const selectedMarket = useMemo(
    () => markets.find((market) => market.id === selectedMarketId) ?? markets[0],
    [markets, selectedMarketId],
  );
  const isAdmin = isAdminWallet(address);
  const selectedUserVote = address && selectedMarket ? userVotes[getUserVoteKey(address, selectedMarket.id)] : undefined;
  const openMarketCount = markets.filter((market) => getStableMarketAvailability(market, mounted) === "open").length;
  const [activeFilter, setActiveFilter] = useState<"open" | "all">("open");

  const displayedMarkets = useMemo(
    () =>
      activeFilter === "open"
        ? markets.filter((market) => getStableMarketAvailability(market, mounted) === "open")
        : markets,
    [markets, mounted, activeFilter],
  );

  const refreshMarketData = useCallback(async (shouldApply: () => boolean = () => true) => {
    setIsLoadingMarkets(true);
    setLoadError(null);

    try {
      const result = await loadMarketsWithVotes();

      if (!shouldApply()) {
        return;
      }

      if (!result) {
        setMarkets(mockMarkets);
        setRawVotes([]);
        setSelectedMarketId((currentMarketId) =>
          mockMarkets.some((market) => market.id === currentMarketId) ? currentMarketId : mockMarkets[0].id,
        );
        return;
      }

      setMarkets(result.markets);
      setRawVotes(result.votes);
      setSelectedMarketId((currentMarketId) =>
        result.markets.some((market) => market.id === currentMarketId)
          ? currentMarketId
          : result.markets[0]?.id ?? "",
      );
      setUserVotes(() => {
        const nextVotes: Record<string, UserVote> = {};

        for (const vote of result.votes) {
          const userVote = mapSupabaseVoteToUserVote(vote);

          if (userVote) {
            nextVotes[getUserVoteKey(userVote.walletAddress, userVote.marketId)] = userVote;
          }
        }

        return nextVotes;
      });
    } catch (error) {
      console.error("Failed to load Supabase markets", error);

      if (shouldApply()) {
        setMarkets([]);
        setLoadError("Failed to load markets. Please refresh and try again.");
      }
    } finally {
      if (shouldApply()) {
        setIsLoadingMarkets(false);
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    void refreshMarketData(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [refreshMarketData]);

  useEffect(() => {
    if (!detailMarketId) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDetailMarketId(null);
        setMessage(null);
      }
    }

    window.addEventListener("keydown", closeOnEscape);

    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [detailMarketId]);

  function selectMarket(marketId: string) {
    setSelectedMarketId(marketId);
    setDetailMarketId(marketId);
    setMessage(null);
  }

  function closeDetailModal() {
    setDetailMarketId(null);
    setSelectedMarketId(mockMarkets[0].id);
    setMessage(null);
  }

  function backToMarkets() {
    setPendingVote(null);
    setSubmittedVote(null);
    setDetailMarketId(null);
    setSelectedMarketId(mockMarkets[0].id);
    setMessage(null);
    document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function stayOnMarketResult() {
    if (submittedVote) {
      setSelectedMarketId(submittedVote.marketId);
      setDetailMarketId(submittedVote.marketId);
    }

    setSubmittedVote(null);
  }

  function requestVote(option: VoteOption) {
    if (!selectedMarket) {
      setMessage("Voting is not available for this market.");
      return;
    }

    const { canVote, disabledReason } = getVoteEligibility({
      market: selectedMarket,
      userVote: selectedUserVote,
      walletAddress: address,
      walletStatus: status,
    });
    const alreadyVoted = Boolean(selectedUserVote);

    console.log("[vote option clicked]", {
      marketId: selectedMarket.id,
      option,
      walletAddress: address,
      marketStatus: selectedMarket.status,
      closesAt: selectedMarket.closesAt,
      alreadyVoted,
      canVote,
      disabledReason,
    });

    if (!canVote) {
      setMessage(disabledReason ?? "Voting is not available for this market.");
      return;
    }

    setMessage(null);
    setPendingVote({ marketId: selectedMarket.id, option });
  }

  function isAdminActionLoading(actionId: string) {
    return adminActionId === actionId;
  }

  function runAdminAction({
    action,
    actionId,
    marketId,
    run,
  }: {
    action: AdminActionName;
    actionId: string;
    marketId: string;
    run: () => Promise<string>;
  }) {
    if (adminActionId) {
      return;
    }

    setAdminActionId(actionId);
    setAdminMessage(null);

    void (async () => {
      try {
        const successMessage = await run();
        await refreshMarketData();
        setPendingVote(null);
        setAdminMessage(successMessage);
        if (action === "confirm-resolution") {
          onResolveComplete?.();
        }
      } catch (error) {
        console.warn("[admin action failed]", {
          action,
          marketId,
          step: getAdminErrorStep(error),
          message: error instanceof Error ? error.message : String(error),
          raw: getAdminErrorRaw(error),
        });

        const errorMessage = getErrorMessage(error);

        setAdminMessage(
          process.env.NODE_ENV === "development" && errorMessage
            ? `Admin action failed: ${errorMessage}`
            : "Admin action failed. Please try again.",
        );
      } finally {
        setAdminActionId(null);
      }
    })();
  }

  function handleFastForwardMarket(marketId: string) {
    if (!isAdmin) {
      setAdminMessage("Admin action blocked: unauthorized wallet.");
      return;
    }

    runAdminAction({
      action: "fast-forward",
      actionId: `fast-forward:${marketId}`,
      marketId,
      run: async () => {
        await fastForwardMarket(marketId);

        return "Market fast-forwarded into the past. It is no longer votable.";
      },
    });
  }

  function handleCloseMarket(marketId: string) {
    if (!isAdmin) {
      setAdminMessage("Admin action blocked: unauthorized wallet.");
      return;
    }

    runAdminAction({
      action: "close",
      actionId: `close:${marketId}`,
      marketId,
      run: async () => {
        await closeMarket(marketId);

        return "Market closed. Voting is no longer available.";
      },
    });
  }

  function handleResolveMarket(
    marketId: string,
    finalResult: VoteOption | "",
    resolverConfidence: number,
    resolverNote: string,
  ) {
    if (!isAdmin) {
      setAdminMessage("Admin action blocked: unauthorized wallet.");
      return;
    }

    const market = markets.find((item) => item.id === marketId);

    if (!market) {
      setAdminMessage("Market not found.");
      return;
    }

    if (!market.id) {
      setAdminMessage("Market is missing an id.");
      return;
    }

    if (!finalResult) {
      setAdminMessage("Select a final result before confirming resolution.");
      return;
    }

    if (!voteOptions.includes(finalResult)) {
      setAdminMessage("Final result must be Accurate, False, Misleading, or Unverifiable.");
      return;
    }

    if (!Number.isFinite(resolverConfidence)) {
      setAdminMessage("Resolver confidence must be a number.");
      return;
    }

    if (resolverConfidence < 0 || resolverConfidence > 100) {
      setAdminMessage("Resolver confidence must be between 0 and 100.");
      return;
    }

    if (market.status === "resolved") {
      setAdminMessage("This market has already been resolved.");
      return;
    }

    const marketVotes = rawVotes.filter((vote) => vote.market_id === marketId);

    runAdminAction({
      action: "confirm-resolution",
      actionId: `resolve:${marketId}`,
      marketId,
      run: async () => {
        await resolveMarket({
          finalResult,
          marketId,
          resolverConfidence,
          resolverNote,
          resolvedBy: address || "demo-admin",
        });

        return marketVotes.length > 0
          ? `Market resolved as ${finalResult}. Validator profiles updated for ${marketVotes.length} vote(s).`
          : `Market resolved as ${finalResult}. No votes existed, so no validator profiles were updated.`;
      },
    });
  }

  function confirmVote() {
    if (!pendingVote || !address || isSubmittingVote) {
      return;
    }

    const marketToUpdate = markets.find((market) => market.id === pendingVote.marketId);
    const voteKey = getUserVoteKey(address, pendingVote.marketId);
    const existingVote = userVotes[voteKey];

    if (!marketToUpdate || !isMarketVotable(marketToUpdate, existingVote)) {
      setPendingVote(null);
      setMessage(
        marketToUpdate
          ? getMarketUnavailableMessage(marketToUpdate, existingVote) ?? "Voting is not available for this market."
          : "Voting is not available for this market.",
      );
      return;
    }

    setIsSubmittingVote(true);
    setVoteStage("signing");

    void (async () => {
      const keplrWindow = typeof window === "undefined" ? undefined : (window as unknown as {
        keplr?: {
          signArbitrary: (
            chainId: string,
            signerAddress: string,
            data: string,
          ) => Promise<{ pub_key: { type: string; value: string }; signature: string }>;
        };
      });
      const keplr = keplrWindow?.keplr;

      if (!keplr) {
        setPendingVote(null);
        setIsSubmittingVote(false);
        setVoteStage(null);
        setMessage("Vote proof could not access the connected Keplr wallet.");

        return;
      }

      const timestamp = new Date().toISOString();
      const voteMessage = [
        "Signet Markets Vote",
        "",
        `marketId: ${pendingVote.marketId}`,
        `voteOption: ${pendingVote.option}`,
        `voterWallet: ${address}`,
        `timestamp: ${timestamp}`,
      ].join("\n");

      let signature: string;

      try {
        const signResponse = await keplr.signArbitrary(
          injectiveTestnetChainId,
          address,
          voteMessage,
        );

        signature = signResponse.signature;
      } catch (signError) {
        const message = signError instanceof Error ? signError.message : String(signError);

        console.warn("[vote proof: signature cancelled]", { message });
        setPendingVote(null);
        setIsSubmittingVote(false);
        setVoteStage(null);
        setMessage("Wallet signature was cancelled. Vote was not submitted.");

        return;
      }

      setVoteStage("saving");

      try {
        const apiResponse = await fetch("/api/votes/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            marketId: pendingVote.marketId,
            voteOption: pendingVote.option,
            voterWallet: address,
            signedMessage: voteMessage,
            signature,
            timestamp,
          }),
        });

        const apiBody = (await apiResponse.json()) as {
          ok?: boolean;
          error?: string;
          txHash?: string;
          vote?: { id: string; market_id: string; wallet_address: string; selected_option: string; tx_hash: string; created_at: string };
        };

        if (!apiResponse.ok || !apiBody.ok) {
          setPendingVote(null);
          setIsSubmittingVote(false);
          setVoteStage(null);
          setMessage(apiBody.error ?? "Vote could not be anchored on Injective testnet. Please try again.");

          return;
        }

        const txHash = apiBody.txHash ?? "";
        const nextUserVote = apiBody.vote
          ? {
              marketId: apiBody.vote.market_id,
              walletAddress: apiBody.vote.wallet_address,
              option: pendingVote.option,
              submittedAt: apiBody.vote.created_at ?? new Date().toISOString(),
              txHash: apiBody.vote.tx_hash ?? undefined,
            }
          : {
              marketId: pendingVote.marketId,
              option: pendingVote.option,
              submittedAt: new Date().toISOString(),
              txHash: txHash || undefined,
              walletAddress: address,
            };

        setMarkets((currentMarkets) =>
          currentMarkets.map((market) => {
            if (market.id !== pendingVote.marketId) {
              return market;
            }

            return {
              ...market,
              totalVotes: market.totalVotes + 1,
              voteBreakdown: {
                ...market.voteBreakdown,
                [pendingVote.option]: market.voteBreakdown[pendingVote.option] + 1,
              },
            };
          }),
        );

        if (nextUserVote) {
          setUserVotes((currentVotes) => ({
            ...currentVotes,
            [voteKey]: nextUserVote,
          }));
        }

        setPendingVote(null);
        setSubmittedVote(pendingVote);
        setSubmittedTxHash(txHash || null);
        setMessage("Vote submitted and verified on Injective testnet.");
      } catch (error) {
        console.error("Failed to save vote", error);
        setPendingVote(null);
        setMessage("Vote failed. Please try again.");
      } finally {
        setIsSubmittingVote(false);
        setVoteStage(null);
      }
    })();
  }

  return (
    <>
      <section className="section" id="dashboard">
        <div className="section-header">
          <div>
            <div className="section-title">Daily Signet Markets</div>
            <div className="section-heading">Open Claims - Testnet MVP</div>
          </div>
          <a className="section-link" href="#profile">
            View all resolved →
          </a>
        </div>

        <div className="tab-row" aria-label="Market filters">
          <button
            className={`tab${activeFilter === "open" ? " active" : ""}`}
            onClick={() => setActiveFilter("open")}
            type="button"
          >
            Open ({openMarketCount})
          </button>
          <button
            className={`tab${activeFilter === "all" ? " active" : ""}`}
            onClick={() => setActiveFilter("all")}
            type="button"
          >
            All ({markets.length})
          </button>
        </div>

        <div className="agent-log">
          <div className="agent-log-header">
            <div className="agent-log-title">
              <div className="agent-dot" />
              AI Agent Activity Log - Today
            </div>
            <span className="market-timer">AUTO-REFRESH 60s</span>
          </div>
          <div className="agent-log-body">
            <div className="log-entry">
              <span className="log-time">09:00</span>
              <span className="log-text">
                scanned <span>28 sources</span> - Injective ecosystem updates, official channels, project announcements
              </span>
            </div>
            <div className="log-entry">
              <span className="log-time">09:02</span>
              <span className="log-text">
                extracted <span>14 candidate claims</span> - filtered by verifiability and relevance
              </span>
            </div>
            <div className="log-entry">
              <span className="log-time">09:05</span>
              <span className="log-text">
                ranked claims - <span>{openMarketCount} open</span> for validation; closed and resolved markets remain visible
              </span>
            </div>
            <div className="log-entry typing">
              <span className="log-time">09:07</span>
              <span className="log-text">
                created <span>{markets.length} validation markets</span> - evidence attached, timers set to 24h/48h
              </span>
            </div>
          </div>
        </div>

        {!isLoadingMarkets && !loadError && displayedMarkets.length === 0 && activeFilter === "open" && (
          <div className="agent-log empty-state">
            No open claims right now. New AI-generated markets will appear here when published.
          </div>
        )}
        {!isLoadingMarkets && !loadError && displayedMarkets.length === 0 && activeFilter === "all" && (
          <div className="agent-log empty-state">No markets found.</div>
        )}

        {!isLoadingMarkets && !loadError && displayedMarkets.length > 0 && (
          <div className="market-grid">
            {displayedMarkets.map((market) => {
            const availability = getStableMarketAvailability(market, mounted);
            const isUnavailable = availability !== "open";

            return (
              <button
                className={`market-card market-card-button${market.id === selectedMarket?.id ? " active-market" : ""}${isUnavailable ? " unavailable-market" : ""}`}
                key={market.id}
                onClick={() => selectMarket(market.id)}
                type="button"
              >
                <div className="card-top">
                  <div className={`badge ${getMarketStatusBadgeClass(market, mounted)}`}>
                    {availability === "open" && <div className="badge-dot" />} {getMarketStatusLabel(market, mounted)}
                  </div>
                  <div className="market-timer">{formatCountdown(market.closesAt, mounted)}</div>
                </div>
                <div>
                  <div className="market-title">{market.title}</div>
                  <div className="market-claim">{market.claim}</div>
                </div>
                <div className="market-meta">
                  <div className="meta-item">
                    <span className="meta-conf">AI {market.aiConfidence}%</span>
                  </div>
                  <div className="meta-item">{market.sources.length} sources</div>
                  <div className="meta-item">{market.totalVotes} votes</div>
                </div>
                <VoteBar market={market} />
                <div className="card-bottom">
                  <div className="vote-count">View details →</div>
                </div>
              </button>
            );
            })}
          </div>
        )}
      </section>

      <AdminResolverPanel
        actionMessage={adminMessage}
        isActionLoading={isAdminActionLoading}
        isAdmin={isAdmin}
        markets={markets}
        mounted={mounted}
        onCloseMarket={handleCloseMarket}
        onFastForwardMarket={handleFastForwardMarket}
        onResolveMarket={handleResolveMarket}
      />

      {detailMarketId && selectedMarket && (
        <MarketDetailModal
          mounted={mounted}
          market={selectedMarket}
          message={message}
          onBackToMarkets={backToMarkets}
          onClose={closeDetailModal}
          onVote={requestVote}
          userVote={selectedUserVote}
        />
      )}

      {pendingVote && address && selectedMarket && (
        <ConfirmationModal
          isSubmitting={isSubmittingVote}
          market={selectedMarket}
          onCancel={() => {
            setPendingVote(null);
            setIsSubmittingVote(false);
            setVoteStage(null);
          }}
          onConfirm={confirmVote}
          selectedOption={pendingVote.option}
          submittingStage={voteStage ?? undefined}
          walletAddress={address}
        />
      )}

      {submittedVote && (
        <VoteSuccessModal
          market={markets.find((market) => market.id === submittedVote.marketId) ?? selectedMarket}
          onBackToMarkets={backToMarkets}
          onStayHere={stayOnMarketResult}
          selectedOption={submittedVote.option}
          txHash={submittedTxHash ?? undefined}
        />
      )}
    </>
  );
}
