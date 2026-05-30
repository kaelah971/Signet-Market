import { NextResponse } from "next/server";
import {
  MsgBroadcasterWithPk,
  MsgSend,
  PrivateKey,
} from "@injectivelabs/sdk-ts";
import { Network, getNetworkEndpoints } from "@injectivelabs/networks";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { z } from "zod";

const voteOptions = ["Accurate", "False", "Misleading", "Unverifiable"] as const;

const requestBodySchema = z.object({
  marketId: z.string().min(1),
  voteOption: z.enum(voteOptions),
  voterWallet: z.string().startsWith("inj", { message: "voterWallet must start with inj" }),
  signedMessage: z.string().min(1),
  signature: z.string().min(1),
  timestamp: z.string().min(1),
});

// TODO: verify signedMessage signature against voterWallet before production/mainnet.

export async function POST(request: Request) {
  try {
    const body = requestBodySchema.safeParse(await request.json());

    if (!body.success) {
      return NextResponse.json(
        { ok: false, error: body.error.issues[0]?.message ?? "Invalid request body." },
        { status: 400 },
      );
    }

    const { marketId, voteOption, voterWallet, signedMessage, signature, timestamp } = body.data;

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { ok: false, error: "Database is not configured." },
        { status: 500 },
      );
    }

    // Check duplicate vote
    const { data: existingVote, error: existingVoteError } = await supabase
      .from("votes")
      .select("id")
      .eq("market_id", marketId)
      .eq("wallet_address", voterWallet)
      .maybeSingle();

    if (existingVoteError) {
      return NextResponse.json(
        { ok: false, error: "Failed to check duplicate vote." },
        { status: 500 },
      );
    }

    if (existingVote) {
      return NextResponse.json(
        { ok: false, error: "You already voted on this market." },
        { status: 409 },
      );
    }

    // Check market exists and is open
    const { data: market, error: marketError } = await supabase
      .from("markets")
      .select("id, status, closes_at")
      .eq("id", marketId)
      .single();

    if (marketError || !market) {
      return NextResponse.json(
        { ok: false, error: "Market not found." },
        { status: 404 },
      );
    }

    if (market.status !== "open") {
      return NextResponse.json(
        { ok: false, error: "This market is not open for voting." },
        { status: 400 },
      );
    }

    if (new Date(market.closes_at).getTime() <= Date.now()) {
      return NextResponse.json(
        { ok: false, error: "This market has expired." },
        { status: 400 },
      );
    }

    // Relayer broadcast
    const relayerPrivateKey = process.env.INJECTIVE_RELAYER_PRIVATE_KEY;
    const relayerAddress = process.env.INJECTIVE_RELAYER_ADDRESS;

    if (!relayerPrivateKey || !relayerAddress) {
      return NextResponse.json(
        { ok: false, error: "Relayer wallet is not configured." },
        { status: 500 },
      );
    }

    const network = Network.Testnet;
    const endpoints = getNetworkEndpoints(network);

    const voteCode =
      voteOption === "Accurate" ? "A"
      : voteOption === "False" ? "F"
      : voteOption === "Misleading" ? "M"
      : "U";

    const shortMarketId = marketId.slice(0, 8);
    const shortWallet = `${voterWallet.slice(0, 7)}...${voterWallet.slice(-4)}`;
    const unixTimestamp = Math.floor(Date.now() / 1000);

    const memo = `SM:v1|vote|m:${shortMarketId}|w:${shortWallet}|o:${voteCode}|t:${unixTimestamp}`;

    if (memo.length > 240) {
      return NextResponse.json(
        { ok: false, error: "Vote proof memo was too large. Please try again." },
        { status: 500 },
      );
    }

    const msgSend = MsgSend.fromJSON({
      srcInjectiveAddress: relayerAddress,
      dstInjectiveAddress: relayerAddress,
      amount: { denom: "inj", amount: "100000000000000" },
    });

    const broadcaster = new MsgBroadcasterWithPk({
      privateKey: PrivateKey.fromHex(relayerPrivateKey),
      chainId: "injective-888",
      endpoints,
      network,
      simulateTx: false,
    });

    const txResponse = await broadcaster.broadcast({
      msgs: msgSend,
      memo,
    });

    const txHash = txResponse.txHash;

    // Save vote to Supabase
    const { data: vote, error: insertError } = await supabase
      .from("votes")
      .insert({
        market_id: marketId,
        wallet_address: voterWallet,
        selected_option: voteOption,
        tx_hash: txHash,
        vote_hash: null,
      })
      .select("id,market_id,wallet_address,selected_option,tx_hash,created_at")
      .single();

    if (insertError) {
      console.warn("[votes/submit] Insert failed after broadcast", { txHash, error: insertError });
      return NextResponse.json(
        { ok: false, error: "Vote was recorded on-chain but could not be saved. Please contact support.", txHash },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, txHash, vote });
  } catch (error) {
    console.warn("[votes/submit API error]", {
      message: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Vote could not be anchored on Injective testnet." },
      { status: 500 },
    );
  }
}
