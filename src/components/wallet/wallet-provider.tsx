"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  injectiveTestnetChainId,
  injectiveTestnetKeplrChainInfo,
  injectiveTestnetNetwork,
} from "@/lib/injective/testnet";

const selectedWallet = "Keplr";

type WalletStatus = "disconnected" | "connecting" | "connected";

type WalletContextValue = {
  address: string | null;
  error: string | null;
  lastError: string | null;
  selectedWallet: string;
  status: WalletStatus;
  targetNetwork: string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

type KeplrProvider = {
  enable: (chainId: string) => Promise<void>;
  experimentalSuggestChain?: (chainInfo: typeof injectiveTestnetKeplrChainInfo) => Promise<void>;
  getKey: (chainId: string) => Promise<{
    bech32Address: string;
  }>;
};

type KeplrWindow = Window & {
  keplr?: KeplrProvider;
};

const WalletContext = createContext<WalletContextValue | null>(null);

function isUserRejected(error: unknown) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const normalized = message.toLowerCase();

  return (
    normalized.includes("reject") ||
    normalized.includes("rejected") ||
    normalized.includes("denied") ||
    normalized.includes("declined") ||
    normalized.includes("cancel")
  );
}

function getReadableError(error: unknown) {
  return error instanceof Error ? error.message : String(error ?? "Unknown error");
}

export function shortenInjectiveAddress(address: string) {
  if (address.length <= 14) {
    return address;
  }

  return `${address.slice(0, 7)}...${address.slice(-3)}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("disconnected");

  const disconnect = useCallback(async () => {
    setAddress(null);
    setError(null);
    setLastError(null);
    setStatus("disconnected");
  }, []);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    setLastError(null);

    try {
      const keplr = typeof window === "undefined" ? undefined : (window as KeplrWindow).keplr;

      if (!keplr) {
        throw new Error("Keplr wallet is not installed. Please install Keplr to connect to Injective testnet.");
      }

      try {
        await keplr.experimentalSuggestChain?.(injectiveTestnetKeplrChainInfo);
      } catch (suggestError) {
        if (isUserRejected(suggestError)) {
          throw new Error("Wallet connection rejected.");
        }

        console.error("Failed to suggest Injective testnet to Keplr", suggestError);
        throw new Error(`Keplr could not add Injective testnet: ${getReadableError(suggestError)}`);
      }

      try {
        await keplr.enable(injectiveTestnetChainId);
      } catch (enableError) {
        if (isUserRejected(enableError)) {
          throw new Error("Wallet connection rejected.");
        }

        console.error("Failed to enable Injective testnet in Keplr", enableError);
        throw new Error(`Keplr could not enable Injective testnet: ${getReadableError(enableError)}`);
      }

      const key = await keplr.getKey(injectiveTestnetChainId);
      const nextAddress = key.bech32Address;

      if (!nextAddress?.startsWith("inj1")) {
        throw new Error("Keplr did not return an Injective address.");
      }

      setAddress(nextAddress);
      setStatus("connected");
    } catch (connectError) {
      const message = getReadableError(connectError);

      setAddress(null);
      setStatus("disconnected");
      setError(message);
      setLastError(message);
    }
  }, []);

  const value = useMemo(
    () => ({
      address,
      connect,
      disconnect,
      error,
      lastError,
      selectedWallet,
      status,
      targetNetwork: `${injectiveTestnetNetwork} (${injectiveTestnetChainId})`,
    }),
    [address, connect, disconnect, error, lastError, status],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }

  return context;
}
