import type { Market } from "@/types/market";

export const mockMarkets: Market[] = [
  {
    id: "047",
    title: "Project X mainnet integration",
    claim:
      "Project X announced a new Injective mainnet integration, confirmed via official documentation published within the last 24 hours.",
    aiSummary:
      "The agent identified an official announcement on the Project X developer portal dated May 24, 2026, referencing a confirmed Injective mainnet deployment. It cross-referenced the claim against an Injective ecosystem blog post and a public GitHub commit. The claim is specific, recent, and supported by primary-source evidence, but the exact integration scope still needs validator review.",
    sources: [
      { label: "Project X Developer Portal - Injective Mainnet Integration Announcement" },
      { label: "Injective Ecosystem Blog - New Integrations: May 2026" },
      { label: "GitHub - injective-labs/ecosystem / commit 4f3ab9" },
    ],
    aiConfidence: 78,
    status: "open",
    closesAt: "2026-05-27T09:18:00.000Z",
    duration: "24h",
    totalVotes: 18,
    voteBreakdown: {
      Accurate: 11,
      False: 2,
      Misleading: 4,
      Unverifiable: 1,
    },
  },
  {
    id: "048",
    title: "Injective ecosystem TVL milestone",
    claim:
      "Injective ecosystem TVL crossed $250M this week, as reported in the official Injective metrics dashboard.",
    aiSummary:
      "The agent found multiple metric references indicating elevated ecosystem liquidity, including an official dashboard snapshot and two analytics mirrors. The number appears plausible, but validators should verify whether the dashboard includes incentives, bridge liquidity, or only protocol TVL.",
    sources: [
      { label: "Injective Metrics Dashboard - Ecosystem TVL" },
      { label: "DeFiLlama Protocol Snapshot - Injective Ecosystem" },
      { label: "Injective Blog - Weekly Network Metrics" },
      { label: "Community Governance Forum - Liquidity Update" },
    ],
    aiConfidence: 91,
    status: "closed",
    closesAt: "2026-05-26T18:42:00.000Z",
    duration: "24h",
    totalVotes: 34,
    voteBreakdown: {
      Accurate: 26,
      False: 3,
      Misleading: 0,
      Unverifiable: 5,
    },
  },
  {
    id: "049",
    title: "Developer grant allocation",
    claim:
      "A new Injective developer grant program was publicly announced with a confirmed $5M allocation for builder incentives.",
    aiSummary:
      "The agent located social posts and a partner announcement referencing new builder grants, but the exact $5M allocation is only partially supported by available sources. Validators should distinguish between confirmed program size and inferred campaign value.",
    sources: [
      { label: "Injective X Announcement - Builder Grants" },
      { label: "Ecosystem Partner Blog - Developer Incentives" },
    ],
    aiConfidence: 63,
    status: "open",
    closesAt: "2026-05-20T06:05:00.000Z",
    duration: "24h",
    totalVotes: 9,
    voteBreakdown: {
      Accurate: 3,
      False: 0,
      Misleading: 2,
      Unverifiable: 4,
    },
  },
  {
    id: "050",
    title: "Daily spot volume claim",
    claim:
      "Injective's daily spot trading volume exceeded $180M on May 24, 2026, based on on-chain data.",
    aiSummary:
      "The claim is based on an indexed volume aggregate and a matching exchange analytics panel. The agent found consistent directionality across sources, but validators should confirm whether the figure includes derivatives, spot-only markets, and wash-filtered volume.",
    sources: [
      { label: "Injective Explorer - Spot Markets Volume" },
      { label: "Exchange Analytics Panel - Daily Network Activity" },
      { label: "Indexer Query Export - May 24 Trading Data" },
    ],
    aiConfidence: 85,
    status: "open",
    closesAt: "2026-05-27T01:33:00.000Z",
    duration: "24h",
    totalVotes: 22,
    voteBreakdown: {
      Accurate: 15,
      False: 0,
      Misleading: 5,
      Unverifiable: 2,
    },
  },
  {
    id: "051",
    title: "DojoSwap partnership documentation",
    claim:
      "DojoSwap published verifiable documentation confirming a partnership with Injective Labs on May 23, 2026.",
    aiSummary:
      "The agent found a resolved documentation trail with matching public docs, ecosystem references, and a partnership announcement. This market remains visible as a benchmark resolved item for validator calibration.",
    sources: [
      { label: "DojoSwap Docs - Injective Partnership" },
      { label: "Injective Ecosystem Directory - DojoSwap Listing" },
      { label: "Partnership Announcement Archive" },
    ],
    aiConfidence: 88,
    status: "resolved",
    closesAt: "2026-05-25T20:00:00.000Z",
    duration: "48h",
    totalVotes: 51,
    voteBreakdown: {
      Accurate: 42,
      False: 4,
      Misleading: 5,
      Unverifiable: 0,
    },
  },
];
