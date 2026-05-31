# Signet Markets

A crypto research validation market built on Injective testnet.

## What is Signet Markets?

Signet Markets is a consumer AI app for crypto research validation. It helps users separate accurate, false, misleading, and unverifiable crypto claims through AI-generated research markets, gasless wallet voting, and reputation-based validation.

Signet Markets turns source-backed crypto research into claims that users can validate. Users vote on whether each claim is **Accurate**, **False**, **Misleading**, or **Unverifiable**. Successful votes are anchored on Injective testnet through a relayer and tied to validator reputation.

It is not a traditional prediction market focused on betting on future outcomes. It is a research validation market. The question is not "What will happen?" — it is "Is this claim accurate based on the available evidence?"

## Why this exists

Crypto does not suffer from a lack of information anymore. It suffers from a lack of trusted verification.

Every day, users see claims about protocols, integrations, funding, governance, AI agents, RWAs, stablecoins, and ecosystem growth. Some claims are true. Some are false. Some are technically true but misleading. Some are impossible to verify.

Signet Markets creates a structured validation process around those claims: research → claim → vote → proof → resolution → reputation.

## How Signet Markets is different

Traditional prediction markets ask: "Will this happen?" Signet Markets asks: "Is this claim accurate based on available evidence?"

This makes it useful for:

- Ecosystem researchers
- Analysts
- Community members
- Protocols, DAOs, and governance watchers
- Crypto users trying to separate signal from noise

## Core workflow

1. **Research input** — Admin provides source-backed crypto research
2. **AI claim generation** — AI extracts verifiable claim drafts
3. **Admin publishes validation markets** — Claims go live as votable markets
4. **Users vote gaslessly** — Users sign a message; no INJ needed
5. **Relayer anchors proof** — Server-side relayer records proof on Injective testnet
6. **tx_hash attached** — Every successful vote gets an onchain transaction hash
7. **Admin confirms final resolution** — Markets are resolved with a final result
8. **Validator reputation updates** — Correct voters earn points, accuracy, streaks

## Key features

- AI-generated claim drafts from pasted research
- Source-backed market creation
- Four-option validation voting (Accurate / False / Misleading / Unverifiable)
- Gasless voting for users (message signing, not transaction signing)
- Injective testnet proof anchoring via server-side relayer
- tx_hash displayed for every successful vote
- Admin resolution controls (close, fast-forward, resolve)
- Validator reputation dashboard
- Leaderboard updates after market resolution
- Duplicate vote prevention
- Resolved and expired markets filtered from Open Claims

## Why Injective

Injective testnet serves as the proof anchoring layer. Each successful vote is connected to an Injective transaction hash through the relayer flow. This is an MVP proof layer — not a fully decentralized network yet, but a working demo of how research validation can be recorded onchain.

## Gasless voting and the relayer

Normal users do not need testnet INJ to vote. The flow:

1. User signs a vote intent message in Keplr (no gas)
2. The signed message is sent to a server API route
3. A server-side relayer wallet pays the transaction gas
4. The relayer broadcasts a proof transaction on Injective testnet
5. The resulting tx_hash is saved alongside the vote in Supabase

The relayer private key is kept server-side and must never be exposed to the client or committed to version control.

## AI Market Generator

Admin can paste clean, source-backed research claims into the AI Market Generator. The generator uses OpenRouter to extract 3–5 claim drafts with titles, summaries, source context, and confidence scores. Best results come from 2–3 clear claims rather than long unstructured text.

## Admin controls

The admin wallet (whitelisted by address) can:

- Generate and publish AI market drafts
- Close or fast-forward markets
- Select final resolution results
- Confirm resolution and trigger validator profile updates

Non-admin users see only the voting, profile, and leaderboard sections.

## Validator reputation

Validators build reputation by voting correctly. When a market resolves:

- Correct votes earn +20 points, +1 correct vote, +1 streak
- Incorrect votes reset the streak to 0
- Reputation tiers: New Validator → Rising Validator → Trusted Validator → Elite Validator

Points, accuracy, streaks, and tier are displayed on the profile dashboard and leaderboard.

## Routes

| Route           | Description          |
| --------------- | -------------------- |
| `/`             | Landing page         |
| `/connectwallet` | Wallet connection    |
| `/dashboard`    | Main app dashboard   |
| `/how-it-works` | User guide           |

## Tech stack

- Next.js (App Router)
- TypeScript
- Supabase (markets, votes, resolutions, validator profiles)
- OpenRouter (AI claim generation)
- Keplr wallet (Injective testnet)
- Injective SDK (`@injectivelabs/sdk-ts`, `@injectivelabs/networks`)
- Server-side relayer wallet

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
AI_PROVIDER_API_KEY=
AI_PROVIDER_BASE_URL=
AI_PROVIDER_MODEL=
INJECTIVE_RELAYER_PRIVATE_KEY=
INJECTIVE_RELAYER_ADDRESS=
```

**Warning:** Never commit `.env.local`. Never expose `INJECTIVE_RELAYER_PRIVATE_KEY`. Do not prefix relayer secrets with `NEXT_PUBLIC`.

## Local setup

```bash
npm install
npm run dev       # start dev server at http://localhost:3000
npx tsc --noEmit # type check
```

## Demo flow

1. Open the landing page (`/`)
2. Visit the How It Works guide (`/how-it-works`)
3. Connect your Injective testnet wallet (`/connectwallet`)
4. As admin, paste 2–3 research claims in the AI Market Generator
5. AI generates market drafts
6. Admin publishes the drafts to Supabase
7. A normal user votes gaslessly on an open market
8. Vote tx_hash appears after submission
9. Admin fast-forwards/close and resolves the market
10. Validator profile and leaderboard update

## Current MVP limitations

- Admin currently controls market publishing and resolution
- Signature verification should be hardened before production
- The relayer is centralized in the MVP
- Research ingestion is manual (paste-based)
- Running on Injective testnet (not mainnet)

## Future improvements

- Automated research ingestion from feeds, blogs, and governance forums
- Source credibility scoring
- Cryptographic signature verification before production
- Decentralized resolver network
- Dispute windows and appeal mechanisms
- Reward distribution for validators
- Protocol/category filters for market browsing
- Public resolved-claim archive
- Richer validator reputation dimensions

---

Built for the Injective ecosystem. Testnet MVP.
