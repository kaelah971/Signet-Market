"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { shortenInjectiveAddress, useWallet } from "@/components/wallet/wallet-provider";
import { isAdminWallet } from "@/lib/admin";
import Link from "next/link";

export default function ConnectWalletPage() {
  const { address, status } = useWallet();
  const isConnected = status === "connected" && address;
  const isAdmin = isAdminWallet(address);
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

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

      <section className="section">
        <div className="profile-inner" style={{ padding: "120px 32px", textAlign: "center" }}>
          <div className="section-title">Connect Wallet</div>
          <div className="section-heading">Connect your Injective testnet wallet</div>
          <p className="hero-sub" style={{ margin: "24px auto 32px" }}>
            Connect your wallet to vote on research claims and attach Injective testnet proof to your validation.
          </p>

          {isConnected ? (
            <div>
              <div className="success-check" style={{ margin: "0 auto 16px" }}>✓</div>
              <div className="wallet-note voted-note">
                Connected: <span>{shortenInjectiveAddress(address)}</span>
              </div>
              {isAdmin && <div className="wallet-note vote-message">Admin wallet connected</div>}
            </div>
          ) : (
            <ConnectWalletButton />
          )}
        </div>
      </section>
    </main>
  );
}
