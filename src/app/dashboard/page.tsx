"use client";

import { useCallback, useState } from "react";
import { MarketVotingSection } from "@/components/markets/market-voting-section";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { ValidatorProfileSection } from "@/components/profile/validator-profile-section";
import { AIMarketGenerator } from "@/components/admin/ai-market-generator";
import { useWallet } from "@/components/wallet/wallet-provider";
import Link from "next/link";

export default function DashboardPage() {
  const { address, status } = useWallet();
  const isConnected = status === "connected" && address;
  const [profileRefreshKey, setProfileRefreshKey] = useState(0);
  const [marketRefreshKey, setMarketRefreshKey] = useState(0);

  const handleResolveComplete = useCallback(() => {
    setProfileRefreshKey((key) => key + 1);
  }, []);

  const handleMarketsPublished = useCallback(() => {
    setMarketRefreshKey((key) => key + 1);
  }, []);

  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="nav-logo" href="/">
          Signet<span>Markets</span>
        </a>
        <Link className="nav-link" href="/connectwallet">
          Markets
        </Link>
        <Link className="nav-link active" href="/dashboard">
          Leaderboard
        </Link>
        <Link className="nav-link active" href="/dashboard">
          Profile
        </Link>
        <Link className="nav-link" href="/#docs">
          Docs
        </Link>
        <div className="nav-spacer" />
        <div className="nav-live">
          <div className="live-dot" />
          TESTNET LIVE
        </div>
        <ConnectWalletButton />
      </nav>

      {isConnected ? (
        <>
          <AIMarketGenerator onMarketsPublished={handleMarketsPublished} />
          <hr className="divider" />

          <section className="section why-validate-section">
            <div className="section-header">
              <div>
                <div className="section-title">Why validate?</div>
                <div className="section-heading">How Signet Markets works</div>
              </div>
            </div>
            <p className="why-validate-body">
              Signet Markets turns fresh crypto research into claims you can judge. Vote on whether each claim is Accurate, False, Misleading, or Unverifiable.
            </p>
            <p className="why-validate-body">
              Your vote is gasless. You sign the vote intent, and Signet anchors the proof on Injective testnet through a relayer.
            </p>
            <p className="why-validate-body">
              When markets resolve, correct validators earn reputation points, improve accuracy, build streaks, and climb the leaderboard.
            </p>
            <div className="why-validate-cards">
              <div className="why-validate-card">
                <div className="why-validate-card-icon">⚡</div>
                <div className="why-validate-card-title">Gasless voting</div>
                <div className="why-validate-card-text">Users sign a message. Signet pays the testnet gas through a relayer.</div>
              </div>
              <div className="why-validate-card">
                <div className="why-validate-card-icon">🔗</div>
                <div className="why-validate-card-title">Proof-backed votes</div>
                <div className="why-validate-card-text">Each successful vote can be verified with an Injective testnet transaction hash.</div>
              </div>
              <div className="why-validate-card">
                <div className="why-validate-card-icon">🏆</div>
                <div className="why-validate-card-title">Research reputation</div>
                <div className="why-validate-card-text">Correct votes improve your validator profile and leaderboard rank.</div>
              </div>
            </div>
          </section>

          <hr className="divider" />

          <MarketVotingSection
            key={`markets-${marketRefreshKey}`}
            onResolveComplete={handleResolveComplete}
          />

          <hr className="divider" />

          <ValidatorProfileSection key={`profile-${profileRefreshKey}`} />
        </>
      ) : (
        <section className="section">
          <div className="profile-inner" style={{ padding: "120px 32px", textAlign: "center" }}>
            <div className="section-title">Signet Markets</div>
            <div className="section-heading">Connect your Injective testnet wallet to access Signet Markets.</div>
            <div style={{ marginTop: 32 }}>
              <ConnectWalletButton />
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
