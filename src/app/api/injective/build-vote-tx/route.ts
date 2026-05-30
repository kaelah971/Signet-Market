import { NextResponse } from "next/server";
import {
  MsgSend,
  createTransactionAndCosmosSignDocForAddressAndMsg,
} from "@injectivelabs/sdk-ts";
import { z } from "zod";

const requestBodySchema = z.object({
  walletAddress: z.string(),
  chainId: z.string(),
  restEndpoint: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = requestBodySchema.safeParse(await request.json());

    if (!body.success) {
      return NextResponse.json({ error: "Missing walletAddress, chainId, or restEndpoint." }, { status: 400 });
    }

    const { walletAddress, chainId, restEndpoint } = body.data;

    const msgSend = MsgSend.fromJSON({
      srcInjectiveAddress: walletAddress,
      dstInjectiveAddress: walletAddress,
      amount: { denom: "inj", amount: "100000000000000" },
    });

    const { cosmosSignDoc } = await createTransactionAndCosmosSignDocForAddressAndMsg({
      address: walletAddress,
      message: msgSend,
      endpoint: restEndpoint,
      chainId,
    });

    return NextResponse.json({
      chainId: cosmosSignDoc.chainId,
      accountNumber: cosmosSignDoc.accountNumber.toString(),
      bodyBytes: Array.from(new Uint8Array(cosmosSignDoc.bodyBytes)),
      authInfoBytes: Array.from(new Uint8Array(cosmosSignDoc.authInfoBytes)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error ?? "");
    const lowerMessage = message.toLowerCase();

    console.warn("[build-vote-tx API error]", { message, raw: error });

    if (
      lowerMessage.includes("account not found") ||
      lowerMessage.includes("does not exist")
    ) {
      return NextResponse.json(
        { error: "account-not-found", message },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: message || "Failed to build vote proof transaction." },
      { status: 500 },
    );
  }
}
