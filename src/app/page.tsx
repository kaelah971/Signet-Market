"use client";

import { useCallback, useState } from "react";
import { MarketVotingSection } from "@/components/markets/market-voting-section";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { ValidatorProfileSection } from "@/components/profile/validator-profile-section";
import { AIMarketGenerator } from "@/components/admin/ai-market-generator";

export default function Home() {
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
        <a className="nav-logo" href="#top">
          Research<span>Market</span>
        </a>
        <a className="nav-link active" href="#dashboard">
          Markets
        </a>
        <a className="nav-link" href="#leaderboard">
          Leaderboard
        </a>
        <a className="nav-link" href="#profile">
          Profile
        </a>
        <a className="nav-link" href="#docs">
          Docs
        </a>
        <div className="nav-spacer" />
        <div className="nav-live">
          <div className="live-dot" />
          TESTNET LIVE
        </div>
        <ConnectWalletButton />
      </nav>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-eyebrow">PROOF-OF-RESEARCH · INJECTIVE TESTNET</div>
          <h1 className="hero-headline">
            Research claims
            <br />
            deserve a <em>verdict.</em>
          </h1>
          <p className="hero-sub">
            AI surfaces the claims. You validate them. Every outcome is recorded on Injective - building a transparent credibility trail for crypto research.
          </p>
          <div className="hero-ctas">
            <a className="btn-primary" href="#dashboard">
              Explore Markets →
            </a>
            <a className="btn-ghost" href="#detail">
              How it works
            </a>
          </div>
          <div className="hero-stats">
            {[
              ["5", "Open Markets"],
              ["89", "Validators"],
              ["247", "Claims Resolved"],
              ["74%", "Avg Accuracy"],
            ].map(([value, label], index) => (
              <div className="contents" key={label}>
                {index > 0 && <div className="hero-divider" />}
                <div className="hero-stat">
                  <span className="hero-stat-val">{value}</span>
                  <span className="hero-stat-lbl">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line" />
          scroll
        </div>
      </section>

      <hr className="divider" />

      <AIMarketGenerator onMarketsPublished={handleMarketsPublished} />

      <hr className="divider" />

      <MarketVotingSection
        key={`markets-${marketRefreshKey}`}
        onResolveComplete={handleResolveComplete}
      />

      <hr className="divider" />

      <ValidatorProfileSection key={`profile-${profileRefreshKey}`} />

      <hr className="divider" />

      <footer className="site-footer" id="docs">
        <div className="footer-brand">
          Research<span>Market</span>
        </div>
        <div className="footer-meta">
          Built for the Injective Solo AI Builder Sprint · Testnet v1.0
          <br />
          <a href="#docs">Docs</a> · <a href="#docs">GitHub</a> · <a href="#docs">Injective Testnet</a>
        </div>
      </footer>
    </main>
  );
}
