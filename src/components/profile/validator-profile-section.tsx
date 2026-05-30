"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { shortenInjectiveAddress, useWallet } from "@/components/wallet/wallet-provider";
import type { SupabaseValidatorProfile } from "@/types/supabase";

type LeaderboardEntry = {
  accuracy: number;
  address: string;
  points: number;
  tier: string;
};

function getReputationTier(points: number) {
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

function computeAccuracy(profile: Pick<SupabaseValidatorProfile, "total_votes" | "correct_votes">) {
  const total = profile.total_votes ?? 0;
  const correct = profile.correct_votes ?? 0;

  if (total === 0) {
    return 0;
  }

  return Math.round((correct / total) * 100);
}

function tierColor(tier: string) {
  if (tier === "Elite Validator") {
    return "state-accurate";
  }

  if (tier === "Trusted Validator" || tier === "Rising Validator") {
    return "top";
  }

  return "";
}

function formatPoints(points: number) {
  if (points >= 1000) {
    return points.toLocaleString();
  }

  return String(points);
}

export function ValidatorProfileSection({ onProfileRefresh }: { onProfileRefresh?: (fn: () => Promise<void>) => void }) {
  const { address, status } = useWallet();
  const [profile, setProfile] = useState<SupabaseValidatorProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);

  const walletAddress = status === "connected" ? address : null;
  const tier = getReputationTier(profile?.points ?? 0);
  const accuracy = computeAccuracy(profile ?? { total_votes: 0, correct_votes: 0 });

  const refreshProfile = async () => {
    if (!supabase) {
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("validator_profiles")
      .select("wallet_address, total_votes, correct_votes, current_streak, points, reputation_tier, updated_at")
      .order("points", { ascending: false });

    if (profileError) {
      console.warn("Failed to load leaderboard", profileError);
      return;
    }

    const allProfiles = (profileData ?? []) as SupabaseValidatorProfile[];
    const leaderboardEntries = allProfiles.map((entry, index) => ({
      accuracy: computeAccuracy(entry),
      address: entry.wallet_address,
      points: entry.points ?? 0,
      tier: entry.reputation_tier ?? getReputationTier(entry.points ?? 0),
    }));

    leaderboardEntries.sort((a, b) => b.points - a.points);
    setLeaderboard(leaderboardEntries);

    if (walletAddress) {
      const userProfile = allProfiles.find(
        (entry) => entry.wallet_address.toLowerCase() === walletAddress.toLowerCase(),
      );

      setProfile(
        userProfile ?? ({
          wallet_address: walletAddress,
          total_votes: 0,
          correct_votes: 0,
          current_streak: 0,
          points: 0,
          reputation_tier: "New Validator",
          updated_at: null,
        } as SupabaseValidatorProfile),
      );
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    void refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  useEffect(() => {
    if (onProfileRefresh) {
      onProfileRefresh(refreshProfile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onProfileRefresh]);

  if (!mounted) {
    return (
      <section className="profile-section" id="profile">
        <div className="profile-inner">
          <div className="section-header">
            <div>
              <div className="section-title">Validator Profile</div>
              <div className="section-heading">Reputation Dashboard</div>
            </div>
          </div>
          <div className="agent-log empty-state">Syncing...</div>
        </div>
      </section>
    );
  }

  const stats = [
    ["Accuracy", walletAddress ? `${accuracy}%` : "N/A", walletAddress ? `${profile?.correct_votes ?? 0} of ${profile?.total_votes ?? 0} correct` : "connect wallet", "state-accurate"],
    ["Markets Voted", String(profile?.total_votes ?? 0), walletAddress ? "total votes" : "connect wallet", ""],
    ["Streak", String(profile?.current_streak ?? 0), walletAddress ? "correct in a row" : "connect wallet", "state-accent"],
    ["Points", formatPoints(profile?.points ?? 0), "testnet pts", profile && (profile.points ?? 0) >= 80 ? "state-accent" : ""],
  ];

  return (
    <section className="profile-section" id="profile">
      <div className="profile-inner">
        <div className="section-header">
          <div>
            <div className="section-title">Validator Profile</div>
            <div className="section-heading">Reputation Dashboard</div>
          </div>
        </div>

        <div className="profile-header">
          <div className="profile-avatar">RM</div>
          <div>
            <span className="profile-addr">
              {walletAddress ? shortenInjectiveAddress(walletAddress) : "Connect Wallet"}
            </span>
            <span className="profile-joined">JOINED MAY 2026 · INJECTIVE TESTNET</span>
          </div>
          <div className="tier-badge">{walletAddress ? tier : "Connect"}</div>
        </div>

        <div className="stats-grid">
          {stats.map(([label, value, sub, color]) => (
            <div className="stat-card" key={label}>
              <span className="stat-label">{label}</span>
              <span className={`stat-value ${color}`}>{value}</span>
              <span className="stat-sub">{sub}</span>
            </div>
          ))}
        </div>

        <div className="leaderboard-wrap" id="leaderboard">
          <div className="history-label">Top Validators - All Time</div>
          <div className="leaderboard">
            <div className="lb-row lb-header">
              <div className="lb-cell">#</div>
              <div className="lb-cell">Validator</div>
              <div className="lb-cell">Tier</div>
              <div className="lb-cell">Points</div>
              <div className="lb-cell">Accuracy</div>
            </div>
            {leaderboard.length === 0 && (
              <div className="lb-row">
                <div className="lb-addr" style={{ gridColumn: "1 / -1" }}>
                  No validators yet.
                </div>
              </div>
            )}
            {leaderboard.map((entry, index) => {
              const rank = String(index + 1).padStart(2, "0");
              const isCurrentUser =
                walletAddress && entry.address.toLowerCase() === walletAddress.toLowerCase();
              const tierStyle = tierColor(entry.tier);

              return (
                <div className="lb-row" key={entry.address}>
                  <div className={`lb-rank ${index < 3 ? "top" : ""}`}>{rank}</div>
                  <div className="lb-addr">{shortenInjectiveAddress(entry.address)}</div>
                  <div className={`lb-tier ${tierStyle}`}>{entry.tier}</div>
                  <div className={`lb-score ${isCurrentUser ? "you" : ""}`}>
                    {formatPoints(entry.points)}
                  </div>
                  <div className="lb-acc">{entry.accuracy}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
