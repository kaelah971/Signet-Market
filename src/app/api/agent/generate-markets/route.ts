import { NextResponse } from "next/server";
import { z } from "zod";

const sourceSchema = z.object({
  label: z.string().min(1),
  url: z.string().optional(),
});

const marketDraftSchema = z.object({
  title: z.string().min(1),
  claim: z.string().min(1),
  ai_summary: z.string().min(1),
  sources: z.array(sourceSchema),
  ai_confidence: z.number().min(0).max(100),
  duration: z.enum(["24h", "48h"]),
});

const aiResponseSchema = z.object({
  markets: z.array(marketDraftSchema).min(1).max(5),
});

const requestBodySchema = z.object({
  rawUpdateText: z.string().min(1),
});

function buildExtractionPrompt(rawText: string) {
  return `You are a crypto research extraction agent. Extract 3 to 5 verifiable claims from the raw research text below.

RULES:
- Return ONLY a raw JSON object with the exact shape shown below. No markdown, no backticks, no commentary, no explanation.
- REJECT vague claims: "bullish", "growing fast", "this is the future", "massive ecosystem".
- PREFER verifiable claims: "Project X announced Y", "Protocol X supports Y", "X introduced Y resource", "X uses Y for Z".
- ai_confidence (0-100) = how verifiable the claim looks from the provided text.
- duration = "24h" for single announcements, "48h" for ongoing developments.
- sources: array of { "label": "string" } objects. Only include "url" if a URL is explicitly mentioned.

JSON SHAPE:
{"markets":[{"title":"string","claim":"string","ai_summary":"string","sources":[{"label":"string"}],"ai_confidence":0,"duration":"24h"}]}

RAW RESEARCH TEXT:
${rawText}`;
}

export async function POST(request: Request) {
  try {
    const body = requestBodySchema.safeParse(await request.json());

    if (!body.success) {
      return NextResponse.json({ error: "Missing or empty rawUpdateText." }, { status: 400 });
    }

    const apiKey = process.env.AI_PROVIDER_API_KEY;
    const baseUrl = process.env.AI_PROVIDER_BASE_URL;
    const model = process.env.AI_PROVIDER_MODEL;

    if (!apiKey) {
      return NextResponse.json({ error: "AI provider key is not configured." }, { status: 500 });
    }

    if (!baseUrl) {
      return NextResponse.json({ error: "AI provider base URL is not configured." }, { status: 500 });
    }

    if (!model) {
      return NextResponse.json({ error: "AI provider model is not configured." }, { status: 500 });
    }

    const prompt = buildExtractionPrompt(body.data.rawUpdateText);

    const aiResponse = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: "You are a JSON-only API. Output a raw JSON object with no markdown, no backticks, no commentary, no explanation. Never wrap JSON in code fences." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4096,
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();

      return NextResponse.json({ error: `AI provider error: ${aiResponse.status} ${errorText}` }, { status: 502 });
    }

    const completion = (await aiResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = completion.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: "AI response was empty." }, { status: 502 });
    }

    let parsed: unknown;

    try {
      let sanitized = content.trim();

      const fenceMatch = sanitized.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

      if (fenceMatch?.[1]) {
        sanitized = fenceMatch[1].trim();
      }

      const firstBrace = sanitized.indexOf("{");
      const lastBrace = sanitized.lastIndexOf("}");

      if (firstBrace !== -1 && lastBrace > firstBrace) {
        sanitized = sanitized.slice(firstBrace, lastBrace + 1);
      }

      parsed = JSON.parse(sanitized);
    } catch {
      console.warn("[generate-markets] AI returned invalid JSON", {
        rawContentPreview: content.slice(0, 1000),
      });

      return NextResponse.json(
        { error: "AI returned invalid JSON. Try generating again or switch to a stricter OpenRouter model." },
        { status: 502 },
      );
    }

    const validated = aiResponseSchema.safeParse(parsed);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "AI output failed validation.",
          details: validated.error.issues,
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ markets: validated.data.markets });
  } catch (error) {
    console.error("[generate-markets API error]", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error." },
      { status: 500 },
    );
  }
}
