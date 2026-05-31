import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import HeroAnimation from "@/components/landing/hero-animation";
import ScrambleHeadline from "@/components/landing/scramble-headline";
import Link from "next/link";

export default function Home() {
  return (
    <main>
      <nav className="site-nav" aria-label="Main navigation">
        <a className="nav-logo" href="/">
          Signet<span>Markets</span>
        </a>
        <Link className="nav-link active" href="/connectwallet">
          Markets
        </Link>
        <Link className="nav-link" href="/dashboard">
          Leaderboard
        </Link>
        <Link className="nav-link" href="/dashboard">
          Profile
        </Link>
        <Link className="nav-link" href="/how-it-works">
          How it Works
        </Link>
        <div className="nav-spacer" />
        <div className="nav-live">
          <div className="live-dot" />
          TESTNET LIVE
        </div>
        <ConnectWalletButton />
      </nav>

      <section className="hero" id="top">
        <HeroAnimation />
        <div className="hero-inner">
          <div className="hero-eyebrow">PROOF-OF-RESEARCH · INJECTIVE TESTNET</div>
          <ScrambleHeadline />
          <p className="hero-sub">
            AI surfaces fresh crypto research claims. Validators vote on what is accurate, false, misleading, or unverifiable. Every vote can be verified on Injective testnet.
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary" href="/connectwallet">
              Explore Markets →
            </Link>
            <Link className="btn-ghost" href="/how-it-works">
              How it works
            </Link>
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

      <footer className="site-footer" id="docs">
        <div className="footer-brand">
          Signet<span>Markets</span>
        </div>
        <div className="footer-meta">
          Built on Injective Testnet · v1.0
          <br />
          <a href="#docs">Docs</a> · <a href="#docs">GitHub</a> · <a href="#docs">Injective Testnet</a>
        </div>
      </footer>
    </main>
  );
}
