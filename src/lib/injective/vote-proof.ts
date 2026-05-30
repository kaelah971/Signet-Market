import { TxRestApi, createTxRawFromSigResponse } from "@injectivelabs/sdk-ts";
import { injectiveTestnetChainId, injectiveTestnetEndpoints } from "./testnet";

export async function broadcastVoteProof({
  walletAddress,
  marketId,
  voteOption,
}: {
  walletAddress: string;
  marketId: string;
  voteOption: "Accurate" | "False" | "Misleading" | "Unverifiable";
}): Promise<string> {
  console.warn("[vote proof:config]", {
    network: "testnet",
    chainId: injectiveTestnetChainId,
    walletAddress,
    hasKeplr: typeof window !== "undefined" && !!(window as unknown as { keplr?: unknown }).keplr,
  });

  console.warn("[vote proof:before broadcaster call]", {
    marketId,
    voteOption,
    walletAddress,
  });

  const windowWithKeplr = typeof window === "undefined" ? undefined : (window as unknown as { keplr?: {
    signDirect: (
      chainId: string,
      signerAddress: string,
      signDoc: Record<string, unknown>,
    ) => Promise<{
      signed: { bodyBytes: Uint8Array; authInfoBytes: Uint8Array; chainId: string; accountNumber: string };
      signature: { pub_key: { type: string; value: string }; signature: string };
    }>;
  } });

  const keplr = windowWithKeplr?.keplr;

  if (!keplr) {
    console.warn("[vote proof: failed]", { message: "Keplr not on window" });
    throw new Error("Vote proof could not access the connected Keplr wallet.");
  }

  const restEndpoint = injectiveTestnetEndpoints.rest ?? "https://testnet.sentry.lcd.injective.network";

  console.warn("[vote proof:before account query]", {
    walletAddress,
    chainId: injectiveTestnetChainId,
    network: "testnet",
  });

  const signDocResponse = await fetch("/api/injective/build-vote-tx", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      walletAddress,
      chainId: injectiveTestnetChainId,
      restEndpoint,
    }),
  });

  const signDocBody = (await signDocResponse.json().catch(() => ({}))) as { error?: string; message?: string };

  if (!signDocResponse.ok) {
    console.warn("[vote proof: before wallet prompt]");

    if (signDocBody.error === "account-not-found") {
      throw new Error(
        "This wallet has not been activated on Injective testnet yet. Please fund it with testnet INJ from the faucet, then try voting again.",
      );
    }

    throw new Error(
      `Vote proof could not prepare this wallet for signing. ${signDocBody.error ?? signDocBody.message ?? "Please reconnect Keplr, confirm Injective testnet is selected, and try again."}`,
    );
  }

  const signDocData = signDocBody as {
    chainId: string;
    accountNumber: string;
    bodyBytes: number[];
    authInfoBytes: number[];
  };

  console.warn("[vote proof: before wallet prompt]");

  const signResponse = await keplr.signDirect(injectiveTestnetChainId, walletAddress, {
    chainId: signDocData.chainId,
    accountNumber: signDocData.accountNumber,
    bodyBytes: new Uint8Array(signDocData.bodyBytes),
    authInfoBytes: new Uint8Array(signDocData.authInfoBytes),
  });

  const txRaw = createTxRawFromSigResponse(signResponse as unknown as Parameters<typeof createTxRawFromSigResponse>[0]);

  const txRestApi = new TxRestApi(restEndpoint);

  try {
    const broadcastResponse = await txRestApi.broadcast(txRaw);

    console.warn("[vote proof: success]", { txHash: broadcastResponse.txHash });

    return broadcastResponse.txHash;
  } catch (broadcastError) {
    console.warn("[vote proof:broadcast failed]", {
      message: broadcastError instanceof Error ? broadcastError.message : String(broadcastError),
      raw: broadcastError,
    });
    throw broadcastError;
  }
}
