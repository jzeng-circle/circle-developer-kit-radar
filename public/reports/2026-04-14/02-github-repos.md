# Circle Developer Kit — GitHub Repos Report
**Source**: `circle-developer-kit-radar/docs/github-repos-snapshot.json`
**Compiled**: April 14, 2026

---

## At a Glance

| Kit | Repos | Stars | Forks | Activity |
|---|---|---|---|---|
| App Kit | 12 | 6 | 3 | All within 2 weeks of launch |
| Bridge Kit | 11 | 29 | 19 | Repos going back to Nov 2025 |
| Swap Kit | 0 | — | — | No public adoption detected |

**Total**: 23 repos · 35 stars · 22 forks

> **Verification note**: 1 dashboard-listed App Kit repo (`TarunKoushal6/J14-75`) could not be verified — deep pnpm monorepo with no accessible package.json confirming `@circle-fin/app-kit`. Excluded from count. Dashboard also listed `developermynk/Arc-Wallet` as using `swap-kit` — this was **not confirmed** in package.json; only `app-kit` was found.

---

## Executive Summaries

### App Kit

**Adoption**: 12 confirmed public repos · 6 stars · 3 forks · all activity within 2 weeks of April 10 launch

**What builders are building**: Bridge + send UIs (3), DEX/swap interfaces (2), content payment gating (1), ERC-8183/agent commerce (2), Arc + GenLayer AI-judged escrow (2), multi-protocol hackathon submissions (2), dashboard/wallet UI (2).

**Target chains**: App Kit is used exclusively on **Arc Testnet** across all 12 repos. Several also bridge from Ethereum Sepolia as the source chain, but Arc is always the destination. No mainnet usage and no Solana. This is the narrowest chain footprint of any kit in the snapshot — App Kit is effectively an Arc-first SDK in practice.

**Builder profile**: Primarily early explorers and hackathon participants responding to the April 10 launch. Depth is mixed — 5 repos have live deployed contracts; 2 are scaffolding-level. The most notable pattern is builders pairing App Kit with AI systems: Claude API for agent-to-agent commerce (freelance-arc), GenLayer intelligent contracts for escrow arbitration (proofpay-escrow, sourcebounty-arc-genlayer), and Gemini-powered trading (PolyAgents). This agentic use case is organic and undocumented by Circle.

**Top signal repos**: `freelance-arc` (live agent-to-agent Claude demo + ERC-8183, deployed contracts), `Flowfi` (pay-per-view content marketplace, live on Vercel), `polypop` (ETHGlobal submission combining Arc + Uniswap + Chainlink), `proofpay-escrow` / `sourcebounty` (Arc + GenLayer escrow pattern, both live and deployed).

**Key gaps**: Swap unavailable on Arc Testnet (mainnet-only) — blocks the full send/bridge/swap loop. No Solana support. Dashboard data showing `swap-kit` for Arc-Wallet was a false positive — not confirmed in package.json.

---

### Bridge Kit

**Adoption**: 11 repos · 29 stars · 19 forks · activity spanning Nov 2025 – Apr 2026

**What builders are building**: Standalone bridge UIs (5), full DEX with bridge (3), hackathon/experimental (2), DeFi interface (1).

**Target chains**: Bridge Kit repos cover the widest chain footprint in the snapshot. Every repo supports **Arc Testnet + Ethereum Sepolia** as a baseline. From there: Base Sepolia (6+ repos), Arbitrum Sepolia (3), Solana Devnet (3 — circle-bridge-kit-transfer, fff-cctp-bridge, Presto), Monad testnet via SDK patch (fff-cctp-bridge), and mainnet EVM chains including Ethereum, Base, Arbitrum, HyperEVM (fff-cctp-bridge only). Bridge Kit is the only kit with active Solana usage and the only one reaching mainnet.

**Builder profile**: Broader range than App Kit — from Nov 2025 hackathon submissions to April 2026 production-grade projects. The two official Circle repos (arc-fintech ★18/7 forks, circle-bridge-kit-transfer ★6/7 forks) account for the majority of stars and forks, signaling they are the primary discovery and reference points. Community builders have independently arrived at sophisticated patterns: Permit2 relayer (arc-network-dex), IndexedDB persistence (fff-cctp-bridge, stac-defi), SDK patches for unsupported chains (fff-cctp-bridge + Monad), LavaMoat supply chain security (fff-cctp-bridge), and npm-published widgets (usdc_bridge_widget).

**Top signal repos**: `circlefin/arc-fintech` (most starred, treasury management reference), `fff-cctp-bridge` (most technically advanced community repo — Monad patch, LavaMoat, Storybook), `usdc_bridge_widget` (published as `@honeypot-finance/usdc-bridge-widget` on npm), `Presto` (most feature-complete community DEX — AMM + NFT deploy + analytics).

**Key gaps**: One repo (zentryx) has Bridge Kit declared but `kit.bridge()` is commented out — friction at the final wiring step. Fee/monetization configuration not represented in any repo. The official repos do not demonstrate IndexedDB persistence or bridge recovery, leaving builders to solve it independently.

---

### Swap Kit

**Adoption**: 0 repos · 0 stars · 0 forks

**Target chains**: N/A — no public usage detected.

**Builder profile**: No builder has published a repo using a standalone `@circle-fin/swap-kit` package. Builders who need swap either use App Kit's bundled swap capability (`kit.swap()`) or deploy custom AMM contracts directly — Presto and arc-network-dex both built their own on-chain AMMs rather than using a kit. Swap Kit either does not exist as a standalone package, or it is not surfaced/discoverable enough to attract adoption.

**Key gap**: The absence of any swap-specific kit adoption is the clearest signal in the snapshot. If Circle intends swap to be a first-class primitive alongside bridge and send, this needs either a dedicated published package or much stronger discoverability of `kit.swap()` within App Kit docs.

---

## Repo Reference Tables

### App Kit Repos

| Repo | Link | ★ | Forks | Last Commit | What It Builds |
|---|---|---|---|---|---|
| Maje53/arc-payment-hub | https://github.com/Maje53/arc-payment-hub | 3 | 1 | 2026-04-11 | USDC bridge + send, uses x402-batching |
| mettin4/zeno | https://github.com/mettin4/zeno | 2 | 1 | 2026-04-10 | Arc App Kit dashboard |
| 0731jiangyujilv/polypop | https://github.com/0731jiangyujilv/polypop | 1 | 0 | 2026-04-05 | Social prediction markets via X + Arc + Uniswap + Chainlink |
| Avnsmith/arcfx | https://github.com/Avnsmith/arcfx | 0 | 0 | 2026-04-02 | Bridge + swap frontend (Sepolia → Arc) |
| Doppler2u/Flowfi | https://github.com/Doppler2u/Flowfi | 0 | 0 | 2026-04-09 | Pay-per-view content marketplace |
| bayrakdarerdem/freelance-arc | https://github.com/bayrakdarerdem/freelance-arc | 0 | 0 | 2026-04-11 | Freelance marketplace + AI agent-to-agent commerce |
| TS-mfon/proofpay-escrow | https://github.com/TS-mfon/proofpay-escrow | 0 | 0 | 2026-04-13 | Escrow with GenLayer AI verdict |
| TS-mfon/sourcebounty-arc-genlayer | https://github.com/TS-mfon/sourcebounty-arc-genlayer | 0 | 0 | 2026-04-13 | Research bounties with GenLayer AI judge |
| Fbiondo00/PolyAgents | https://github.com/Fbiondo00/PolyAgents | 0 | 0 | 2026-04-05 | AI autonomous trading vault (Arc + Hedera + ENS) |
| developermynk/Arc-Wallet | https://github.com/developermynk/Arc-Wallet | 0 | 0 | 2026-04-05 | Arc wallet app |
| mrrobot792/lumina | https://github.com/mrrobot792/lumina | 0 | 0 | 2026-04-13 | DEX reference implementation |
| starlash7/Arc-test | https://github.com/starlash7/Arc-test | 0 | 1 | 2026-04-06 | ERC-8183 escrow + App Kit playground |

### Bridge Kit Repos

| Repo | Link | ★ | Forks | Last Commit | What It Builds |
|---|---|---|---|---|---|
| circlefin/arc-fintech | https://github.com/circlefin/arc-fintech | 18 | 7 | 2026-04-14 | Multi-chain treasury management (Official) |
| circlefin/circle-bridge-kit-transfer | https://github.com/circlefin/circle-bridge-kit-transfer | 6 | 7 | 2026-04-09 | Cross-chain USDC transfer with wallet-connect (Official) |
| dharmanan/Arc-Testnet-Bridge-Swap | https://github.com/dharmanan/Arc-Testnet-Bridge-Swap | 4 | 2 | 2026-03-10 | Uniswap V2 swap + Bridge Kit bridge |
| mjkid221/fff-cctp-bridge | https://github.com/mjkid221/fff-cctp-bridge | 1 | 0 | 2026-04-11 | No-fee CCTP v2 bridge, EVM + Solana |
| tomasfonsecsi/zentryx | https://github.com/tomasfonsecsi/zentryx | 0 | 0 | 2026-04-11 | Stablecoin bridge UI (simulated, not fully wired) |
| Emperoar07/Presto | https://github.com/Emperoar07/Presto | 0 | 0 | 2026-04-10 | Full DEX: AMM + bridge + deploy + analytics |
| Kewe63/arc-network-dex | https://github.com/Kewe63/arc-network-dex | 0 | 1 | 2026-04-02 | USDC↔EURC FX DEX, Permit2, ERC-8004 |
| HongmingWang-Rabbit/usdc_bridge_widget | https://github.com/HongmingWang-Rabbit/usdc_bridge_widget | 0 | 0 | 2026-03-27 | Reusable React bridge widget (published on npm) |
| linux070/stac-defi | https://github.com/linux070/stac-defi | 0 | 0 | 2026-03-01 | Premium DeFi interface, bridge + swap |
| EggsLeggs/usdc-hopper-hackathon | https://github.com/EggsLeggs/usdc-hopper-hackathon | 0 | 0 | 2025-12-10 | Minimalist bridge UI (hackathon) |
| aicarcwallet-arc/hackthone | https://github.com/aicarcwallet-arc/hackthone | 0 | 2 | 2025-11-08 | AI vocab game → earn tokens → bridge USDC |

---

## Detailed Repo Profiles

---

### App Kit — Repo Details

---

#### 1. `Maje53/arc-payment-hub` ★3
**Last commit**: 2026-04-11 | **Kits**: `app-kit`, `adapter-viem-v2`, `x402-batching`

**What it does**: USDC bridge and send app on Arc Testnet. Uses the `x402-batching` adapter — the only repo in the snapshot to do so — suggesting the builder is exploring App Kit's payment batching capabilities alongside standard bridge/send.

**Stack**: React + Vite

**Notes**: README is the default Vite boilerplate (not customized), but the package.json confirms intentional `x402-batching` integration. Most unique kit combination in the App Kit group. Most-starred App Kit repo despite the sparse README.

---

#### 2. `mettin4/zeno` ★2
**Last commit**: 2026-04-10 | **Kits**: `app-kit`, `adapter-viem-v2`

**What it does**: A dashboard UI for the Arc App Kit. No README available — description is "Zeno - Arc App Kit Dashboard." Based on the package.json (Vite + React + App Kit + dotenv + tsx), this is a lightweight dashboard likely for monitoring or interacting with App Kit operations, possibly including a `send.ts` script for programmatic transfers.

**Stack**: Vite, React 19, Tailwind CSS v4, TypeScript, dotenv, tsx

**Notes**: Second most-starred App Kit repo. No README makes it hard to assess depth, but the presence of a `send.ts` script entry point alongside the dashboard UI suggests a hybrid tool (UI + scripting).

---

#### 3. `0731jiangyujilv/polypop` ★1
**Last commit**: 2026-04-05 | **Kits**: `app-kit`, `adapter-viem-v2` | **Structure**: Monorepo (`webapp/package.json`)

**What it does**: PolyPOP turns live social disagreements on X/Twitter into on-chain prediction markets. When users argue on X, they tag @_PolyPOP which deploys a binary prediction market on Arc Testnet. App Kit handles market creation, liquidity provision, settlement, and cross-chain support. Uniswap converts any ETH on Base → USDC before bridging to Arc. Chainlink CRE resolves outcomes and handles private large payouts.

ETHGlobal submission. Full architecture: X → Uniswap (Base) → Bridge Kit → Arc market → Chainlink settlement → privacy treasury.

**Stack**: Vite + React, wagmi, viem, `@x402/evm` + `@x402/fetch` (x402 payment protocol), `@tma.js/sdk-react` (Telegram Mini App), Uniswap v4, Chainlink CRE + ACE Engine, Solidity (Foundry)

**Notable**: Most architecturally ambitious App Kit project. Uses App Kit alongside three other protocol integrations simultaneously. The x402 payment protocol and Telegram Mini App integration are unique — no other repo in the snapshot uses either. Live contract at `0x65F971b...` on Arc Testnet.

---

#### 4. `Avnsmith/arcfx` ★0
**Last commit**: 2026-04-02 | **Kits**: `app-kit`, `adapter-viem-v2`

**What it does**: ArcFX covers two flows in one UI: bridge USDC from Ethereum Sepolia → Arc Testnet via CCTP, then swap USDC ↔ ETH on Arc Testnet. Private key entered directly in the browser; no external server.

**Stack**: Next.js 15, TypeScript, Tailwind CSS, Radix UI

**Notes**: Well-documented README with clear feature separation (Bridge tab, Swap tab). Explicitly documents Arc Testnet network details (Chain ID 97420, RPC). Security callout needed in Circle docs: the browser private key pattern is common in testnet demos but should not be copied for production.

---

#### 5. `Doppler2u/Flowfi` ★0
**Last commit**: 2026-04-09 | **Kits**: `app-kit`, `adapter-viem-v2` | **Structure**: Monorepo (`frontend/package.json`)

**What it does**: FlowFi is a pay-per-view content marketplace. Creators list articles, videos, and code snippets; buyers pay in USDC on Arc Testnet; content secrets are cryptographically gated until the on-chain payment confirms. Circle App Kit handles bridging liquidity from Sepolia into Arc via CCTP.

Notable engineering: a custom block scanner using 1,000-block micro-chunking and a 10-block safety buffer to handle RPC instability in load-balanced clusters — solving a real problem that standard RPC indexing can't handle.

**Stack**: Next.js 15, Viem/Wagmi, Solidity + Foundry (smart contracts), Tailwind CSS v4

**Live**: Contract `0x392ea3e652f436583514c2aa62761a558c6af9b0` deployed on Arc Testnet. Demo live at `flowfi-three.vercel.app`.

**Notes**: Most ambitious App Kit project in the snapshot. Real product concept, working contract, live demo. The RPC resilience engineering indicates a builder who has hit real infrastructure problems — not just a hackathon scaffold.

---

#### 6. `mrrobot792/lumina` ★0
**Last commit**: 2026-04-13 | **Kits**: `app-kit`, `adapter-viem-v2`

**What it does**: Lumina is a DEX reference implementation for Arc Testnet, explicitly positioned as a "comprehensive demonstration for developers building on Arc." Shows how to build a trading interface using Circle App Kit and the Viem adapter. Architecture includes a `WalletProvider` context, `TradeConsole` component, and custom hooks for wallet state management.

**Stack**: Next.js 16, React 19, Tailwind CSS v4

**Notes**: Teaching project rather than standalone product. Requires a `KIT_KEY` env variable — confirms the builder obtained a valid Circle Kit API key. Good signal for engaged developer onboarding. Most recent commit in the App Kit group (April 13).

---

#### 7. `bayrakdarerdem/freelance-arc` ★0
**Last commit**: 2026-04-11 | **Kits**: `app-kit`, `adapter-circle-wallets`, `adapter-viem-v2`, `developer-controlled-wallets`

**What it does**: FreelanceArc is a decentralized freelance marketplace on Arc Testnet — an on-chain alternative to Upwork/Fiverr. Every job is an ERC-8183 contract. USDC is locked in escrow at posting, released automatically on approval. The standout feature is an **agent-to-agent commerce demo**: two AI agents (powered by Claude claude-sonnet-4-20250514) interact with each other on-chain with zero human involvement — Agent A posts and funds a job, Agent B accepts and submits work, Agent A evaluates and releases USDC to Agent B.

Live demo: `https://freelance-arc.vercel.app/agent-demo`

**Stack**: Next.js 16, Circle Developer Controlled Wallets, Supabase, Anthropic Claude API, viem, Tailwind CSS, Vercel

**Contracts on Arc Testnet**: ERC-8183 AgenticCommerce at `0x0747EEf0706327138c69792bF28Cd525089e4583`

**Notes**: Most product-complete of the new App Kit repos. The Claude-powered agent demo is the most concrete real-world showcase of Arc's agentic commerce primitives. Uses 4 Circle packages — same depth as starlash7/Arc-test. Live deployment confirmed.

---

#### 8. `TS-mfon/proofpay-escrow` ★0
**Last commit**: 2026-04-13 | **Kits**: `app-kit`, `adapter-circle-wallets`, `adapter-ethers-v6`, `adapter-viem-v2` | **Structure**: Monorepo (`frontend/package.json`)

**What it does**: ProofPay is an escrow dapp combining Arc Testnet with GenLayer's AI verdict system. A buyer creates an escrow job and funds it with Arc USDC. A freelancer/vendor/AI agent submits a deliverable plus evidence URLs. A **GenLayer Studionet intelligent contract** evaluates the deliverable against job requirements and stores an acceptance verdict on-chain. The Arc escrow contract then releases or refunds based on that verdict.

Architecture: Arc (escrow + USDC) + GenLayer (AI judge on Studionet) + Python relay service (bridges verdict between chains).

**Stack**: Vite + React 19, ethers.js v6, viem, TypeScript, Python relay (FastAPI), Foundry (Arc contracts), GenLayer contracts

**Live**: Arc escrow at `0xE9e9d7A...`, GenLayer judge at `0xd1066738...`. Frontend at `proofpay-escrow.vercel.app`.

**Notes**: Introduces a new pattern not seen elsewhere: using an off-chain AI system (GenLayer) to gate on-chain USDC release. Uses `adapter-ethers-v6` — one of very few repos in the snapshot to do so. Same developer also built sourcebounty-arc-genlayer with the same architecture.

---

#### 9. `TS-mfon/sourcebounty-arc-genlayer` ★0
**Last commit**: 2026-04-13 | **Kits**: `app-kit`, `adapter-circle-wallets`, `adapter-ethers-v6`, `adapter-viem-v2` | **Structure**: Monorepo (`frontend/package.json`)

**What it does**: SourceBounty is a research bounty platform using the same Arc + GenLayer hybrid pattern as proofpay-escrow (same developer). A creator posts a funded research question. A responder submits an answer with citation URLs. A GenLayer AI judge evaluates relevance and citation quality, stores a verdict, and the Arc escrow releases or refunds accordingly.

**Stack**: Identical to proofpay-escrow — Vite + React 19, ethers.js v6, viem, Python relay, Foundry, GenLayer

**Live**: Arc bounty escrow at `0x4a38251...`, GenLayer judge at `0xD98cCe0...`. Frontend at `sourcebounty-arc-genlayer.vercel.app`.

**Notes**: Same developer, same template as proofpay-escrow. Two distinct use cases (freelance escrow vs. research bounties) sharing the same Arc + GenLayer architecture. Suggests this pattern is becoming a developer's reusable building block.

---

#### 10. `Fbiondo00/PolyAgents` ★0
**Last commit**: 2026-04-05 | **Kits**: `app-kit`, `adapter-viem-v2`

**What it does**: PolyAgents is an AI-powered autonomous trading vault for Polymarket BTC 5-minute binary markets. Every 5 seconds: discover active market via Gamma API → get AI trade decision (direction, confidence, reasoning) via Vercel AI Gateway (Gemini 2.0 Flash Lite) → place passive limit orders on both YES/NO sides → simulate fills against real order books → log every step to Hedera HCS for full on-chain auditability → update ENS subnames with live agent stats.

Arc is used as the USDC-native prediction markets layer via a deployed `PolyAgentsMarket` contract.

**Stack**: Next.js 16, React 19, Tailwind CSS v4, shadcn/ui, Vercel AI SDK (Gemini), Polymarket CLOB + Gamma API, Hedera SDK (HCS/HTS/Mirror Node), viem (Arc + ENS Sepolia), Privy (wallet auth)

**ETHGlobal Cannes 2026 submission**.

**Notes**: App Kit integration is present in package.json but Arc is one of three sponsor chains alongside Hedera and ENS — not the primary focus. The repo's most distinctive features (Gemini AI decisions, Hedera audit logging, ENS policy commitments) don't involve App Kit directly. App Kit provides the Arc market infrastructure and USDC settlement.

---

#### 11. `developermynk/Arc-Wallet` ★0
**Last commit**: 2026-04-05 | **Kits**: `app-kit`, `adapter-viem-v2`

**What it does**: An Arc wallet application. No README available. Contains `AGENTS.md` and `CLAUDE.md` files alongside standard Next.js project structure (`app/`, `components/`, `contexts/`), suggesting AI-assisted development.

**Stack**: Next.js, React, recharts (for data visualization), framer-motion, Tailwind CSS v4, Lucide icons

**Notes**: No README — limited insight into scope. Dashboard listed `swap-kit` as a dependency but this was **not confirmed** in the actual `package.json` — only `@circle-fin/app-kit` and `@circle-fin/adapter-viem-v2` verified. The recharts dependency suggests some kind of portfolio or activity dashboard view.

---

#### 12. `starlash7/Arc-test` ★0
**Last commit**: 2026-04-06 | **Kits**: `app-kit`, `adapter-circle-wallets`, `adapter-viem-v2`, `developer-controlled-wallets`

**What it does**: A dual-purpose workspace:

1. **ERC-8183 escrow quickstart** — creates wallet sets and two Arc Testnet SCAs, runs the full job lifecycle (createJob → setBudget → approve → fund → submit → complete), saves timestamped reports to `.context/runs/`
2. **App Kit playground** — bootstrap scripts for wallet setup (Arc Testnet + Sepolia), then `send()`, `bridge()`, and `swap()` with separate npm scripts for each

Uses the most Circle packages of any App Kit repo (4 packages), combining wallet infrastructure with App Kit flows.

**Notable**: The README explicitly documents that App Kit `swap` is mainnet-only — `kit.getSupportedChains("swap")` does not include `Arc_Testnet`. This is a confirmed friction point for testnet builders. Also includes a full Arc Testnet activity roadmap referencing the Agentic Economy hackathon (April 20–26).

---

### App Kit — Cross-Repo Findings

**Use cases covered**:
| Use Case | Repos |
|---|---|
| Bridge + Send | arc-payment-hub, arcfx, Arc-test |
| DEX / Swap interface | arcfx, lumina |
| Content payment gating | Flowfi |
| ERC-8183 / agent commerce | Arc-test, freelance-arc |
| Arc + GenLayer AI-judged escrow | proofpay-escrow, sourcebounty-arc-genlayer |
| Multi-protocol hackathon (Arc + others) | polypop, PolyAgents |
| Dashboard / wallet UI | zeno, Arc-Wallet |

**Adapter usage**:
| Adapter | Used by |
|---|---|
| `adapter-viem-v2` | All 12 repos |
| `adapter-circle-wallets` | freelance-arc, proofpay-escrow, sourcebounty-arc-genlayer, Arc-test |
| `developer-controlled-wallets` | freelance-arc, Arc-test |
| `adapter-ethers-v6` | proofpay-escrow, sourcebounty-arc-genlayer |
| `x402-batching` | arc-payment-hub only |

**Developer pain points**:
1. **Swap on Arc Testnet is unsupported** — confirmed by starlash7's README. Builders expecting a full send/bridge/swap loop on testnet hit a wall.
2. **Private key browser UX** — arcfx uses browser-entered private keys. Appropriate for demos; needs a production safety callout in official docs.
3. **No Solana App Kit usage** — all Solana bridge work routes through Bridge Kit.
4. **Dashboard claimed swap-kit for Arc-Wallet but package.json does not confirm it** — potential false positive in the discovery tooling worth investigating.

---

### Bridge Kit — Repo Details

---

#### 1. `circlefin/arc-fintech` ★18 — Official
**Last commit**: 2026-04-14 | **Kits**: `bridge-kit`, `adapter-circle-wallets`, `developer-controlled-wallets`

**What it does**: Official Circle sample app for a multi-chain treasury management system. Uses Circle Developer Controlled Wallets for programmatic transaction management and Bridge Kit with the Forwarding Service for cross-chain USDC transfers. Supabase handles the database and provides real-time UI updates via Supabase Realtime. Includes full migration setup for both local (Docker) and cloud Supabase.

**Stack**: Next.js, Supabase, Circle Developer Controlled Wallets, Bridge Kit, Tailwind CSS, shadcn/ui

**Notes**: Most-starred repo in the entire snapshot; updated today. The only project using Bridge Kit alongside the Forwarding Service. Canonical reference for treasury management use cases.

---

#### 2. `circlefin/circle-bridge-kit-transfer` ★6 — Official
**Last commit**: 2026-04-09 | **Kits**: `bridge-kit`, `adapter-solana`, `adapter-viem-v2`

**What it does**: Official Circle sample showing cross-chain USDC transfers with a wallet-connect experience for both EVM (MetaMask) and Solana (Phantom) testnets. Supported chains are fetched from Bridge Kit at runtime and mapped dynamically to Wagmi config — not hardcoded.

**Stack**: Vite + React, Hono server (preview/API layer), wagmi + viem, Solana adapter

**Notes**: Only official repo supporting Solana. The runtime-dynamic chain config pattern is the cleanest approach in the snapshot and worth promoting to community builders.

---

#### 3. `dharmanan/Arc-Testnet-Bridge-Swap` ★4
**Last commit**: 2026-03-10 | **Kits**: `bridge-kit`, `adapter-viem-v2`

**What it does**: Two-step flow: swap ETH → USDC on Ethereum Sepolia using Uniswap V2 Router, then bridge that USDC to Arc Testnet via Circle Bridge Kit. Includes a Dashboard tab showing USDC balances on both chains. Rate limited to 0.1 ETH per wallet per 24h to prevent abuse.

**Stack**: React 18, ethers.js v6, wagmi 2, RainbowKit, Uniswap V2 SDK, Framer Motion, canvas-confetti

**Notes**: Only community repo combining Uniswap V2 with Bridge Kit. Shows a realistic multi-protocol flow that production apps need. Older commit (March) but solid implementation.

---

#### 4. `mjkid221/fff-cctp-bridge` ★1
**Last commit**: 2026-04-11 | **Kits**: `bridge-kit`, `adapter-solana`, `adapter-viem-v2`, `provider-cctp-v2`

**What it does**: "Fuck Fees Forever" — a zero-fee CCTP v2 bridge UI for EVM chains (Ethereum, Base, Arbitrum, Monad, HyperLiquid) and Solana. Charges nothing beyond Circle's native rates. Offline-first with IndexedDB transaction history and retry capability. Uses Dynamic Labs for multi-wallet support.

**Stack**: Next.js 15, React 19, Zustand, IndexedDB (idb), Dynamic Labs, Motion (Framer successor), LavaMoat

**Notable** — most technically advanced community Bridge Kit repo:
- Ships SDK patches to add Monad support before Circle's official release
- LavaMoat supply chain attack protection; uses `pnpm safe-install` and explicit allow-scripts config
- Storybook for component development with a live public deployment
- Container/Presentational architecture pattern with documented contribution guidelines
- SUI Network support planned once Circle adds it to Bridge Kit
- Has a Pong mini-game

---

#### 5. `tomasfonsecsi/zentryx` ★0
**Last commit**: 2026-04-11 | **Kits**: `bridge-kit`, `adapter-viem-v2`

**What it does**: Bridge interface for Ethereum Sepolia, Base Sepolia, Arbitrum Sepolia, and Arc Testnet. Includes ENS-aware wallet profile page, transaction history, and a faucet page.

**Stack**: Next.js 14, wagmi v2 + viem v2, RainbowKit v2, Zustand

**Notes**: Bridge Kit is declared in `package.json` but `src/lib/cctp.ts` **simulates** the CCTP lifecycle with realistic timing delays — the actual `kit.bridge()` call is commented out. The developer left explicit instructions to activate it. This is a notable integration friction signal: the builder got through install and scaffolding but did not complete the wiring step.

---

#### 6. `Emperoar07/Presto` ★0
**Last commit**: 2026-04-10 | **Kits**: `bridge-kit`, `adapter-solana-kit`, `adapter-viem-v2`

**What it does**: Presto is the most feature-complete community project in the snapshot. A full DEX covering:
- Hub-and-spoke AMM (USDC as settlement hub) with bidirectional liquidity management
- USDC bridge via CCTP across Arc, Sepolia, Base Sepolia, and Solana Devnet
- Token/memecoin deployment with seed liquidity on the Hub AMM
- NFT collection deployment with shareable public mint pages at `/mint/{address}`
- Generic smart contract deployment from ABI + bytecode with built-in templates
- On-chain analytics: all-time volume, total trades, unique traders (log scan from block 0)
- Portfolio dashboard with LP position tracking

**Stack**: Next.js 16, Solidity 0.8.20 + Hardhat + OpenZeppelin, RainbowKit, wagmi, React Query, Tailwind CSS

**Live contracts on Arc Testnet**: Hub AMM at `0x5794a8...`, multiple token deployments

**Notes**: Uses `adapter-solana-kit` — distinct from `adapter-solana` — the only repo to do so. Broadest feature scope of all community repos. Ships a built-in docs surface at `/docs`.

---

#### 7. `Kewe63/arc-network-dex` ★0
**Last commit**: 2026-04-02 | **Kits**: `bridge-kit`, `adapter-viem-v2`

**What it does**: Arcdex — a stablecoin FX exchange for USDC ↔ EURC swaps at deterministic rates (no impermanent loss, no order books). Unique features:
- Gasless swaps via Permit2 (EIP-712 off-chain signature + Vercel serverless relayer submits on-chain)
- Gamification: volume points, 7-day check-in streaks, referral codes (+500 pts both sides)
- AI Agent Registry implementing ERC-8004 (identity NFT, reputation feedback, validation requests) — fully deployed on Arc Testnet
- Bilingual UI (English/Turkish)
- Bridge tab via Circle Bridge Kit (Sepolia ↔ Arc)

**Stack**: React 18, Vite, ethers.js v6 + viem v2, custom CSS (no Tailwind), Vercel serverless relayer

**Live contracts on Arc Testnet**: FX Escrow, Permit2, ERC-8004 IdentityRegistry, ReputationRegistry, ValidationRegistry — all deployed and verified

**Notes**: Most opinionated and product-complete community project. The Permit2 relayer architecture is sophisticated for a community build. ERC-8004 support shows this builder is actively tracking Arc's emerging standards.

---

#### 8. `HongmingWang-Rabbit/usdc_bridge_widget` ★0
**Last commit**: 2026-03-27 | **Kits**: `bridge-kit`, `adapter-viem-v2`

**What it does**: A reusable, drop-in React bridge widget published as `@honeypot-finance/usdc-bridge-widget` on npm. Designed to be embedded in any wagmi-compatible app. Key capabilities:
- `<BridgeWidget />` with full theme customization (colors, border radius, font family)
- Borderless mode for seamless embedding
- Bridge recovery: state persists to localStorage; shows recovery banner on next visit if transfer was interrupted mid-attestation
- Exports individual hooks for custom UIs: `useBridge`, `useUSDCBalance`, `useBridgeQuote`, `useRecovery`
- 17 CCTP EVM chains supported out of the box

**Stack**: React + wagmi + viem, TypeScript (fully typed props)

**Notes**: Only repo building reusable infrastructure for other builders rather than a standalone app. Represents a different and valuable builder archetype — the ecosystem multiplier.

---

#### 9. `linux070/stac-defi` ★0
**Last commit**: 2026-03-01 | **Kits**: `bridge-kit`, `adapter-viem-v2`

**What it does**: Stac — a DeFi interface for Arc Network covering cross-chain bridge (CCTP), token swapping, and persisted transaction history. Positioned around premium UX: seamless dark/light themes, mobile-first layout using `dvh` units, SVG animations. Uses IndexedDB for transaction history with a deduplication engine that merges on-chain data with local metadata.

**Stack**: React 18, Vite, wagmi, RainbowKit, Framer Motion, i18next (internationalization), Tailwind CSS

**Notes**: Only repo using i18next for internationalization. Older commit (March 1). Design-forward positioning suggests UX polish as a differentiator rather than feature breadth.

---

#### 10. `EggsLeggs/usdc-hopper-hackathon` ★0
**Last commit**: 2025-12-10 | **Kits**: `bridge-kit`, `adapter-viem-v2`

**What it does**: USDC Hopper — a minimalist bridge UI inspired by Across protocol's "card + tabs" layout. Supports Ethereum Sepolia, Base Sepolia, and Arc Testnet. MetaMask-only. Implements the full CCTP v2 flow (approval → burn → attestation → mint) with a step-by-step progress tracker. Transaction history stored in localStorage with receipt polling.

**Stack**: Next.js 14, wagmi, RainbowKit, Tailwind CSS v4

**Notes**: Oldest repo in the snapshot (Dec 2025). Hackathon submission — minimal scope, clean implementation. Demonstrates Bridge Kit works well for simple, single-purpose bridge flows.

---

#### 11. `aicarcwallet-arc/hackthone` ★0
**Last commit**: 2025-11-08 | **Kits**: `bridge-kit`, `adapter-viem-v2`, `developer-controlled-wallets`

**What it does**: AI Cognitive (AIC) Token — an AI-powered vocabulary game on Arc Testnet. End-to-end flow: type a vocabulary word correctly → OpenAI GPT-4 validates accuracy and detects cheating → earn 100–500 AIC tokens (minted on-chain) → swap AIC → USDC via a custom constant-product AMM → bridge USDC to other chains via Circle Bridge Kit. AIC is programmatically pegged 1:1 to USDC using Arc's native FX engine. Supabase handles the backend (game submissions, word bank, user stats).

**Stack**: React, TypeScript, Tailwind CSS, Supabase (DB + Edge Functions), OpenAI GPT-4, Solidity (ERC-20 + AMM), MetaMask

**Notes**: Oldest repo overall (Nov 2025). Hackathon submission for "AI Agents on Arc with USDC." Most novel concept in the snapshot — AI-gated token issuance. Virtual Visa card and banking integration flagged as future features pending a Circle Partnership request.

---

### Bridge Kit — Cross-Repo Findings

**Use case distribution**:
| Use Case | Repos |
|---|---|
| Bridge / transfer UI | arc-fintech, circle-bridge-kit-transfer, zentryx, usdc-hopper, usdc_bridge_widget |
| Full DEX with bridge | Arc-Testnet-Bridge-Swap, Presto, arc-network-dex |
| Hackathon / experimental | aicarcwallet-arc, usdc-hopper |
| DeFi interface | stac-defi |

**Chain coverage**:
| Chain | Repos supporting it |
|---|---|
| Arc Testnet + Ethereum Sepolia | All 11 |
| Base Sepolia | 6+ |
| Arbitrum Sepolia | 3 |
| Solana | fff-cctp-bridge, circle-bridge-kit-transfer, Presto |
| Monad | fff-cctp-bridge (via SDK patch) |
| Mainnet EVM | fff-cctp-bridge only |

**Architecture patterns**:
| Pattern | Used by |
|---|---|
| wagmi + viem v2 + RainbowKit | Majority (7+) |
| IndexedDB transaction persistence | fff-cctp-bridge, stac-defi |
| Serverless relayer | arc-network-dex (Vercel) |
| Published npm package | usdc_bridge_widget |
| SDK patches for unreleased chain support | fff-cctp-bridge (Monad) |

---

## Cross-Kit Findings

### Usage Patterns

**App Kit is an Arc Testnet-first SDK — and it's attracting a wider variety of use cases than initially visible.** All 12 App Kit repos build exclusively on Arc Testnet. The initial 5-repo snapshot suggested mostly bridge/DEX exploration, but the full 12-repo picture shows a much richer spread: AI agent commerce, Arc+GenLayer hybrid dapps, multi-protocol hackathon submissions, and dashboard tooling. This suggests App Kit is being positioned not just as a bridge/swap SDK but as the general onchain backbone for Arc-native applications.

**A new pattern is emerging: App Kit as the onchain layer in AI-judged or AI-driven workflows.** Three repos use App Kit alongside AI systems — freelance-arc (Claude API for agent-to-agent commerce), proofpay-escrow and sourcebounty-arc-genlayer (GenLayer AI verdict for escrow release). None of these patterns are in Circle's official documentation. This is a leading signal: the agentic commerce use case is being discovered organically by builders.

**Bridge Kit is a cross-chain general-purpose SDK.** Bridge Kit repos span a much wider chain footprint: all support Arc Testnet + Ethereum Sepolia as a baseline, but 6+ repos extend to Base Sepolia, 3 to Solana, and 1 has patched in Monad support ahead of Circle's official release. Bridge Kit is being used both for Arc-specific bridging and as a standalone CCTP interface on non-Arc chains. One repo (fff-cctp-bridge) doesn't even focus on Arc at all — it's a general CCTP bridge for EVM + Solana mainnet.

**App Kit attracts "new to Arc" builders; Bridge Kit attracts "deeper into the ecosystem" builders.** All App Kit repos are within 2 weeks of the April 10 launch announcement. Bridge Kit repos span November 2025 to April 2026, showing a longer engagement arc. Several Bridge Kit builders have deployed real contracts, shipped npm packages, and implemented production patterns (relayers, IndexedDB, supply chain security) that take weeks of investment. The two SDKs are serving different stages of the developer journey.

**DEX is the dominant app pattern.** Across both kits, 6 of 16 repos are building some form of decentralized exchange — either a full DEX with an AMM, or a bridge/swap combo. This makes sense: bridge + swap are the primitives, and a DEX is the natural composed product. However, none of these community DEXes are using Circle's native FX engine for the swap leg — they're all building custom AMMs or using Uniswap V2. This suggests an opportunity for better documentation on how Arc's native FX capabilities can replace custom swap contracts.

**Next.js is the dominant frontend framework.** 10 of 16 repos use Next.js (versions 14–16). Vite + React is the alternative (4 repos). No Vue, Svelte, or non-React frameworks. App Router is the standard across Next.js repos. This is consistent with the broader web3 builder ecosystem but worth knowing for targeting docs, tutorials, and starter templates.

**wagmi + viem v2 + RainbowKit is the de facto wallet stack.** The combination appears in 12+ repos. Ethers.js v6 appears alongside viem in 2 repos (for write operations where signers are needed). No Web3.js usage. Dynamic Labs appears once (fff-cctp-bridge) as the most sophisticated wallet integration. This convergence means Circle can invest in wagmi-native examples and be confident they match how the vast majority of builders are wiring wallets.

**Builders are solving infrastructure problems that Circle hasn't documented.** Several community repos have independently arrived at solutions to real production problems — IndexedDB for transaction persistence across page reloads, Permit2 relayers for gasless UX, bridge recovery banners for interrupted attestation waits, and SDK patches for unsupported chains. None of these patterns appear in Circle's official sample apps. This is a leading signal: document and provide official guidance for these patterns before they become ecosystem fragmentation.

---

### Developer Sophistication Tiers

| Tier | Characteristics | Repos |
|---|---|---|
| Scaffolding | Kit in `package.json`, boilerplate README, not fully wired | zentryx, arc-payment-hub |
| Integrated | Working implementation, clean docs, deployed contract | arcfx, lumina, stac-defi, usdc-hopper, aicarcwallet-arc |
| Advanced | Novel architecture, multi-kit, production patterns | fff-cctp-bridge, Flowfi, arc-network-dex, usdc_bridge_widget, Presto |

### Gaps and Pain Points

1. **Swap Kit has zero adoption** — builders who need swap either use App Kit's bundled swap or build custom AMMs. No standalone Swap Kit package appears to exist or be discoverable.
2. **App Kit swap is mainnet-only** — confirmed in starlash7's README. Testnet builders expecting a full send/bridge/swap flow on Arc Testnet hit a wall at swap.
3. **Integration drop-off at Bridge Kit wiring** — zentryx got through install and scaffolding but left `kit.bridge()` commented out. Indicates the final wiring step has friction.
4. **No monetization/revenue-sharing patterns in any repo** — the fee atomicity question raised on Twitter (unanswered) has no answer visible in any community repo either.
5. **No Solana App Kit usage** — all Solana bridge work routes through Bridge Kit.
6. **Private key browser UX** — appears in App Kit demos; needs production safety callout in official docs.

### Strengths

- Bridge Kit has broad, deepening adoption across diverse use cases
- Several community builders have reached production-grade patterns without official guidance (Permit2 relayer, LavaMoat, npm publishing, SDK patches)
- Official Circle repos set a high documentation and architecture bar
- Use cases are diverse: content payments, treasury management, FX trading, GameFi, AI-gated rewards — not just bridge-for-bridge's-sake

---

## Source Data

- Snapshot: `docs/github-repos-snapshot.json`
- READMEs fetched via GitHub API, April 14, 2026
