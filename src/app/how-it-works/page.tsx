"use client";

import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import Link from "next/link";

const steps = [
  {
    num: "01",
    title: "Explore open claims",
    desc: "Open claims are active research markets still accepting votes. Each claim includes a summary, source context, AI confidence score, and voting window.",
  },
  {
    num: "02",
    title: "Connect your wallet",
    desc: "Connect your Injective testnet wallet to create your validator identity and prevent duplicate voting.",
  },
  {
    num: "03",
    title: "Cast your vote",
    desc: "Choose whether the claim is Accurate, False, Misleading, or Unverifiable.",
  },
  {
    num: "04",
    title: "Sign your vote intent",
    desc: "Your wallet asks you to sign a message proving the vote came from you. This is not a gas transaction.",
  },
  {
    num: "05",
    title: "Signet anchors proof",
    desc: "Signet\u2019s relayer anchors your vote proof on Injective testnet and attaches a transaction hash to your vote.",
  },
  {
    num: "06",
    title: "Wait for resolution",
    desc: "Once the market closes, the admin reviews the claim and confirms the final result.",
  },
  {
    num: "07",
    title: "Build reputation",
    desc: "Correct votes improve your validator profile, points, accuracy, streaks, and leaderboard position.",
  },
];

const voteCards = [
  {
    label: "Accurate",
    desc: "The claim is correct and supported by reliable evidence.",
  },
  {
    label: "False",
    desc: "The claim is incorrect based on available sources.",
  },
  {
    label: "Misleading",
    desc: "The claim contains some truth but creates the wrong impression.",
  },
  {
    label: "Unverifiable",
    desc: "The claim cannot be confirmed from reliable public information.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="nav-logo" href="/">
          Signet<span>Markets</span>
        </Link>
        <Link className="nav-link" href="/connectwallet">
          Markets
        </Link>
        <Link className="nav-link" href="/dashboard">
          Leaderboard
        </Link>
        <Link className="nav-link" href="/dashboard">
          Profile
        </Link>
        <Link className="nav-link active" href="/how-it-works">
          How it Works
        </Link>
        <div className="nav-spacer" />
        <div className="nav-live">
          <div className="live-dot" />
          TESTNET LIVE
        </div>
        <ConnectWalletButton />
      </nav>

      <section className="hero" id="top" style={{ minHeight: "auto", padding: "120px 0 80px" }}>
        <div className="hero-grid" />
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-eyebrow">SIGNET GUIDE</div>
          <h1 className="hero-headline" style={{ fontSize: "clamp(36px, 5vw, 56px)" }}>
            How Signet Markets
            <br />
            <em>Works</em>
          </h1>
          <p className="hero-sub">
            A simple guide to validating crypto research claims, signing gasless votes, and building validator reputation.
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary" href="/connectwallet">
              Start Validating →
            </Link>
            <Link className="btn-ghost" href="/">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <section className="section">
        <div className="guide-container">
          <div className="guide-card guide-intro">
            <div className="section-title">What is Signet Markets?</div>
            <p>
              Signet Markets turns fresh crypto research into verifiable claims. Instead of trusting every
              announcement, narrative, or ecosystem update at face value, validators vote on whether each claim is
              Accurate, False, Misleading, or Unverifiable.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="guide-container">
          <div className="section-header">
            <div>
              <div className="section-title">The validation flow</div>
              <div className="section-heading">How voting works</div>
            </div>
          </div>

          <div className="guide-steps">
            {steps.map((step) => (
              <div className="guide-step" key={step.num}>
                <div className="guide-step-num">{step.num}</div>
                <div>
                  <div className="guide-step-title">{step.title}</div>
                  <div className="guide-step-desc">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="guide-container">
          <div className="section-header">
            <div>
              <div className="section-title">How to judge a claim</div>
              <div className="section-heading">Voting options</div>
            </div>
          </div>

          <div className="guide-vote-grid">
            {voteCards.map((card) => (
              <div className="why-validate-card" key={card.label}>
                <div className="why-validate-card-title">{card.label}</div>
                <div className="why-validate-card-text">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="guide-container">
          <div className="guide-card">
            <div className="section-title">Why voting is gasless</div>
            <p>
              Normal users do not need testnet INJ to vote. You sign a vote intent message, while Signet&apos;s
              relayer pays the small testnet gas fee and records the proof on Injective. This keeps validation
              simple while still giving every successful vote an onchain transaction hash.
            </p>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 120 }}>
        <div className="guide-container" style={{ textAlign: "center" }}>
          <div className="section-title" style={{ fontSize: 13, marginBottom: 6 }}>
            Ready to validate your first claim?
          </div>
          <p className="guide-cta-text">
            Browse open claims, vote with your wallet, and start building your validator reputation.
          </p>
          <div className="hero-ctas" style={{ justifyContent: "center", marginTop: 24 }}>
            <Link className="btn-primary" href="/connectwallet">
              Explore Markets →
            </Link>
            <Link className="btn-ghost" href="/dashboard">
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <footer className="site-footer">
        <div className="footer-brand">
          Signet<span>Markets</span>
        </div>
        <div className="footer-meta">
          Built on Injective Testnet · v1.0
          <br />
          <Link href="/how-it-works">Docs</Link> · <a href="#">GitHub</a> · <a href="#">Injective Testnet</a>
        </div>
      </footer>
    </main>
  );
}
