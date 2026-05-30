"use client";

import { useEffect, useState } from "react";
import { shortenInjectiveAddress, useWallet } from "./wallet-provider";

export function ConnectWalletButton() {
  const [mounted, setMounted] = useState(false);
  const {
    address,
    connect,
    disconnect,
    error,
    lastError,
    selectedWallet,
    status,
    targetNetwork,
  } = useWallet();
  const safeStatus = mounted ? status : "disconnected";
  const safeAddress = mounted ? address : null;
  const isConnected = safeStatus === "connected" && safeAddress;
  const showDebugPanel = process.env.NODE_ENV === "development";

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="wallet-control">
      <button
        className="wallet-btn"
        onClick={isConnected ? disconnect : connect}
        type="button"
        aria-describedby={mounted && error ? "wallet-error" : undefined}
        disabled={safeStatus === "connecting"}
      >
        {safeStatus === "connecting" && "Connecting..."}
        {isConnected && shortenInjectiveAddress(safeAddress)}
        {safeStatus === "disconnected" && "Connect Wallet"}
      </button>
      {mounted && error && (
        <div className="wallet-error" id="wallet-error" role="status">
          {error}
        </div>
      )}
      {mounted && showDebugPanel && (
        <div className="wallet-debug" aria-label="Wallet debug panel">
          <div>selected wallet: {selectedWallet}</div>
          <div>target network: {targetNetwork}</div>
          <div>connected address: {address ?? "not connected"}</div>
          <div>last error: {lastError ?? "none"}</div>
        </div>
      )}
    </div>
  );
}
