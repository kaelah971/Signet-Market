"use client";

import { useState } from "react";
import { insertAgentLogEntry, insertMarkets } from "@/lib/supabase/markets";
import { isAdminWallet } from "@/lib/admin";
import { useWallet } from "@/components/wallet/wallet-provider";

type MarketDraft = {
  title: string;
  claim: string;
  ai_summary: string;
  sources: Array<{ label: string; url?: string }>;
  ai_confidence: number;
  duration: "24h" | "48h";
};

const emptyDrafts: MarketDraft[] = [];

export function AIMarketGenerator({
  onMarketsPublished,
}: {
  onMarketsPublished?: () => void;
}) {
  const { address } = useWallet();
  const isAdmin = isAdminWallet(address);
  const [rawText, setRawText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<MarketDraft[]>(emptyDrafts);
  const [published, setPublished] = useState(false);

  async function handleGenerate() {
    if (!isAdmin) {
      setError("Admin action blocked: unauthorized wallet.");
      return;
    }

    const trimmed = rawText.trim();

    if (!trimmed) {
      setError("Paste research text before generating.");
      return;
    }

    setError(null);
    setPublishMessage(null);
    setPublished(false);
    setIsGenerating(true);
    setDrafts(emptyDrafts);

    try {
      const response = await fetch("/api/agent/generate-markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawUpdateText: trimmed }),
      });

      const body = (await response.json()) as {
        error?: string;
        details?: unknown;
        markets?: MarketDraft[];
      };

      if (!response.ok || body.error) {
        setError(body.error ?? "Market generation failed.");

        return;
      }

      setDrafts(body.markets ?? emptyDrafts);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handlePublish() {
    if (!isAdmin) {
      setError("Admin action blocked: unauthorized wallet.");
      return;
    }

    if (isPublishing || drafts.length === 0) {
      return;
    }

    setPublishMessage(null);
    setIsPublishing(true);

    try {
      const inserted = await insertMarkets(
        drafts.map((draft) => ({
          title: draft.title,
          claim: draft.claim,
          ai_summary: draft.ai_summary,
          sources: draft.sources,
          ai_confidence: draft.ai_confidence,
          duration: draft.duration,
        })),
      );

      void insertAgentLogEntry({
        action: "generated_markets",
        details: {
          count: inserted.length,
          source: "manual-admin-paste",
          generatedAt: new Date().toISOString(),
        },
      });

      setPublished(true);
      setPublishMessage(`${inserted.length} market(s) created successfully.`);
      onMarketsPublished?.();
    } catch (publishError) {
      setPublishMessage(
        `Failed to create markets: ${
          publishError instanceof Error ? publishError.message : "Unknown error"
        }`,
      );
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section className="section ai-generator-section" id="ai-generator">
      <div className="section-header">
        <div>
          <div className="section-title">AI Market Generator</div>
          <div className="section-heading">
            {isAdmin && address ? "Admin wallet connected" : "Testnet demo"}
          </div>
        </div>
        <div className="admin-demo-label">
          {isAdmin
            ? "Paste research text to preview AI-generated market drafts."
            : "Admin only: connect the authorized Injective testnet wallet to generate research markets."}
        </div>
      </div>

      {!isAdmin ? (
        <div className="agent-log empty-state">
          Admin only: connect the authorized Injective testnet wallet to generate research markets.
        </div>
      ) : (
        <>

      <div className="ai-generator-body">
        <textarea
          className="ai-generator-input"
          onChange={(event) => setRawText(event.target.value)}
          placeholder="Paste research text, an announcement, a tweet, or any Injective ecosystem update..."
          rows={6}
          value={rawText}
        />

        <button
          className="submit-btn ai-generator-button"
          disabled={isGenerating}
          onClick={() => void handleGenerate()}
          type="button"
        >
          {isGenerating ? "Generating..." : "Generate Markets"}
        </button>
      </div>

      {error && <div className="wallet-note vote-message ai-generator-error">{error}</div>}

      {drafts.length > 0 && (
        <>
          <div className="ai-drafts">
            {drafts.map((draft, marketIndex) => (
              <div className="ai-draft-card" key={`generated-market-${draft.title}-${marketIndex}`}>
                <div className="ai-draft-top">
                  <div className="ai-draft-title">{draft.title}</div>
                  <div className="info-chip">{draft.duration}</div>
                </div>
                <div className="ai-draft-claim">&quot;{draft.claim}&quot;</div>
                <div className="ai-draft-summary">{draft.ai_summary}</div>
                <div className="ai-draft-meta">
                  <span>
                    AI Confidence: <strong>{draft.ai_confidence}%</strong>
                  </span>
                  <span>
                    Sources: <strong>{draft.sources.length}</strong>
                  </span>
                </div>
                {draft.sources.length > 0 && (
                  <div className="ai-draft-sources">
                    {draft.sources.map((source, sourceIndex) => (
                      <div className="ai-draft-source" key={`generated-source-${draft.title}-${source.label}-${sourceIndex}`}>
                        <span className="source-num">{String(sourceIndex + 1).padStart(2, "0")}</span>
                        <span>{source.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="ai-publish-row">
            <button
              className="submit-btn ai-generator-button"
              disabled={isPublishing || published}
              onClick={() => void handlePublish()}
              type="button"
            >
              {isPublishing
                ? "Creating Markets..."
                : published
                  ? "Published"
                  : "Publish Markets to Supabase"}
            </button>
          </div>

          {publishMessage && (
            <div className="wallet-note vote-message ai-generator-error">{publishMessage}</div>
          )}
        </>
      )}
        </>
      )}
    </section>
  );
}
