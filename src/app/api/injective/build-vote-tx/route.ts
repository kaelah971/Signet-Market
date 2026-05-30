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
    console.error("[build-vote-tx API error]", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to build vote proof transaction." },
      { status: 500 },
    );
  }
}
