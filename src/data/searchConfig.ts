/**
 * Central search configuration — single source of truth for every query
 * sent to every data source. Edit here, or use the in-dashboard editor.
 *
 * Rule: exact product names only. No generic terms like "bridge" or "cross chain".
 */

export interface QueryDef {
  id: string           // stable key for React
  label: string        // shown in UI (also used as the query string)
  note?: string        // rationale shown below each chip
}

export interface SourceConfig {
  source: string
  queries: QueryDef[]
  packages?: string[]  // npm package names (tracked separately, not text queries)
}

export interface OpportunityKeyword {
  id: string
  label: string         // the search query
  rationale: string     // why this is a good signal for the product
}

export interface ProductConfig {
  id: string
  name: string
  // Terms that must appear in content for it to be considered relevant (client-side filter)
  relevanceTerms: string[]
  searchConfig: SourceConfig[]
  // Keywords that signal a developer has a relevant problem but hasn't found the product yet
  opportunityKeywords: OpportunityKeyword[]
}

// ─── Bridge Kit ──────────────────────────────────────────────────────────────

const BRIDGE_KIT_CONFIG: SourceConfig[] = [
  {
    source: 'GitHub',
    queries: [
      {
        id: 'gh-1',
        label: '"Circle Bridge Kit"',
        note: 'Exact product name — matches issues, PRs and discussions',
      },
      {
        id: 'gh-2',
        label: '"circle-fin/bridge-kit"',
        note: 'References to the official npm package path on GitHub',
      },
      {
        id: 'gh-3',
        label: '"@circle-fin/bridge-kit"',
        note: 'Import statements and package.json references in issues/PRs',
      },
    ],
  },
  {
    source: 'GitHub Repos',
    queries: [
      {
        id: 'ghr-1',
        label: 'circle-bridge-kit',
        note: 'Repos referencing Circle Bridge Kit by package/name — avoids generic "bridge-kit" noise',
      },
    ],
  },
  {
    source: 'GitHub Commits',
    queries: [
      {
        id: 'ghc-1',
        label: '"Circle Bridge Kit" OR "@circle-fin/bridge-kit"',
        note: 'Commit messages referencing the product or package',
      },
    ],
  },
  {
    source: 'Hacker News',
    queries: [
      {
        id: 'hn-1',
        label: '"Circle Bridge Kit"',
        note: 'Exact product name in HN stories and comments',
      },
      {
        id: 'hn-2',
        label: '"@circle-fin/bridge-kit"',
        note: 'Package name references in HN discussions',
      },
    ],
  },
  {
    source: 'Medium',
    queries: [
      {
        id: 'md-1',
        label: 'circle-bridge-kit',
        note: 'Medium tag for Circle Bridge Kit articles',
      },
    ],
  },
  {
    source: 'Reddit',
    queries: [
      {
        id: 'rd-1',
        label: '"Circle Bridge Kit"',
        note: 'Exact product name — avoids unrelated bridge mentions',
      },
      {
        id: 'rd-2',
        label: '"bridge-kit" circle',
        note: 'SDK short name combined with Circle brand',
      },
    ],
  },
  {
    source: 'Dev.to',
    queries: [
      {
        id: 'dt-1',
        label: '"Circle Bridge Kit"',
        note: 'Exact product name',
      },
    ],
  },
  {
    source: 'Stack Overflow',
    queries: [
      {
        id: 'so-1',
        label: '"Circle Bridge Kit"',
        note: 'Exact product name — avoids noise from unrelated bridge SDKs',
      },
      {
        id: 'so-2',
        label: '"@circle-fin/bridge-kit"',
        note: 'Package name as used in import errors and troubleshooting questions',
      },
    ],
  },
  {
    source: 'npm',
    queries: [],
    packages: [
      '@circle-fin/bridge-kit',
    ],
  },
  {
    source: 'News (NewsAPI)',
    queries: [
      {
        id: 'news-1',
        label: '"Circle Bridge Kit"',
        note: 'Exact product name in news and blog coverage',
      },
    ],
  },
  {
    source: 'Google CSE',
    queries: [
      {
        id: 'cse-1',
        label: '"Circle Bridge Kit"',
        note: 'Web-wide search — catches Binance Square, Mirror.xyz, blogs, press releases',
      },
      {
        id: 'cse-2',
        label: '"@circle-fin/bridge-kit"',
        note: 'Package name references in tutorials and technical articles',
      },
      {
        id: 'cse-3',
        label: 'circle bridge kit site:medium.com',
        note: 'Medium articles mentioning Circle Bridge Kit that may not use the exact tag',
      },
    ],
  },
]

// ─── App Kit ─────────────────────────────────────────────────────────────────

const APP_KIT_CONFIG: SourceConfig[] = [
  {
    source: 'GitHub',
    queries: [
      { id: 'gh-1', label: '"Circle App Kit"',         note: 'Exact product name' },
      { id: 'gh-2', label: '"circle-fin/app-kit"',     note: 'npm package path references' },
      { id: 'gh-3', label: '"@circle-fin/app-kit"',    note: 'Import statements and package.json references' },
    ],
  },
  {
    source: 'GitHub Repos',
    queries: [
      { id: 'ghr-1', label: 'circle-app-kit', note: 'Repos referencing Circle App Kit by package/name — avoids generic noise' },
    ],
  },
  {
    source: 'GitHub Commits',
    queries: [
      { id: 'ghc-1', label: '"Circle App Kit" OR "@circle-fin/app-kit"', note: 'Commit messages referencing the product or package' },
    ],
  },
  {
    source: 'Hacker News',
    queries: [
      { id: 'hn-1', label: '"Circle App Kit"',      note: 'Exact product name in HN stories' },
      { id: 'hn-2', label: '"@circle-fin/app-kit"', note: 'Package name references in HN discussions' },
    ],
  },
  {
    source: 'Medium',
    queries: [
      { id: 'md-1', label: 'circle-app-kit', note: 'Medium tag for Circle App Kit articles' },
    ],
  },
  {
    source: 'Reddit',
    queries: [
      { id: 'rd-1', label: '"Circle App Kit"',   note: 'Exact product name' },
      { id: 'rd-2', label: '"app-kit" circle',   note: 'SDK short name combined with Circle brand' },
    ],
  },
  {
    source: 'Dev.to',
    queries: [
      { id: 'dt-1', label: '"Circle App Kit"', note: 'Exact product name' },
    ],
  },
  {
    source: 'Stack Overflow',
    queries: [
      { id: 'so-1', label: '"Circle App Kit"',      note: 'Exact product name' },
      { id: 'so-2', label: '"@circle-fin/app-kit"', note: 'Package name in troubleshooting questions' },
    ],
  },
  {
    source: 'npm',
    queries: [],
    packages: ['@circle-fin/app-kit'],
  },
  {
    source: 'News (NewsAPI)',
    queries: [
      { id: 'news-1', label: '"Circle App Kit"', note: 'Exact product name in news coverage' },
    ],
  },
  {
    source: 'Google CSE',
    queries: [
      { id: 'cse-1', label: '"Circle App Kit"',      note: 'Web-wide search — blogs, press releases, tutorials' },
      { id: 'cse-2', label: '"@circle-fin/app-kit"', note: 'Package name in technical articles' },
    ],
  },
]

// ─── Swap Kit ────────────────────────────────────────────────────────────────

const SWAP_KIT_CONFIG: SourceConfig[] = [
  {
    source: 'GitHub',
    queries: [
      { id: 'gh-1', label: '"Circle Swap Kit"',        note: 'Exact product name' },
      { id: 'gh-2', label: '"circle-fin/swap-kit"',    note: 'npm package path references' },
      { id: 'gh-3', label: '"@circle-fin/swap-kit"',   note: 'Import statements and package.json references' },
    ],
  },
  {
    source: 'GitHub Repos',
    queries: [
      { id: 'ghr-1', label: 'circle-swap-kit', note: 'Repos referencing Circle Swap Kit by package/name — avoids generic noise' },
    ],
  },
  {
    source: 'GitHub Commits',
    queries: [
      { id: 'ghc-1', label: '"Circle Swap Kit" OR "@circle-fin/swap-kit"', note: 'Commit messages referencing the product or package' },
    ],
  },
  {
    source: 'Hacker News',
    queries: [
      { id: 'hn-1', label: '"Circle Swap Kit"',       note: 'Exact product name in HN stories' },
      { id: 'hn-2', label: '"@circle-fin/swap-kit"',  note: 'Package name references in HN discussions' },
    ],
  },
  {
    source: 'Medium',
    queries: [
      { id: 'md-1', label: 'circle-swap-kit', note: 'Medium tag for Circle Swap Kit articles' },
    ],
  },
  {
    source: 'Reddit',
    queries: [
      { id: 'rd-1', label: '"Circle Swap Kit"',  note: 'Exact product name' },
      { id: 'rd-2', label: '"swap-kit" circle',  note: 'SDK short name combined with Circle brand' },
    ],
  },
  {
    source: 'Dev.to',
    queries: [
      { id: 'dt-1', label: '"Circle Swap Kit"', note: 'Exact product name' },
    ],
  },
  {
    source: 'Stack Overflow',
    queries: [
      { id: 'so-1', label: '"Circle Swap Kit"',       note: 'Exact product name' },
      { id: 'so-2', label: '"@circle-fin/swap-kit"',  note: 'Package name in troubleshooting questions' },
    ],
  },
  {
    source: 'npm',
    queries: [],
    packages: ['@circle-fin/swap-kit'],
  },
  {
    source: 'News (NewsAPI)',
    queries: [
      { id: 'news-1', label: '"Circle Swap Kit"', note: 'Exact product name in news coverage' },
    ],
  },
  {
    source: 'Google CSE',
    queries: [
      { id: 'cse-1', label: '"Circle Swap Kit"',       note: 'Web-wide search — blogs, press releases, tutorials' },
      { id: 'cse-2', label: '"@circle-fin/swap-kit"',  note: 'Package name in technical articles' },
    ],
  },
]

// ─── Product registry ─────────────────────────────────────────────────────────

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'bridge-kit',
    name: 'Circle Bridge Kit',
    relevanceTerms: ['circle bridge kit', 'circlebridgekit', 'bridgekit', '@circle-fin/bridge-kit', 'circle-fin/bridge-kit'],
    searchConfig: BRIDGE_KIT_CONFIG,
    opportunityKeywords: [
      { id: 'op-bk-1', label: 'USDC bridging',                  rationale: 'Core use case — developers looking to bridge USDC cross-chain' },
      { id: 'op-bk-2', label: 'cross-chain USDC transfer',       rationale: 'Explicit intent to move USDC across chains' },
      { id: 'op-bk-3', label: 'CCTP integration',                rationale: 'Developers implementing CCTP directly — Bridge Kit abstracts this' },
      { id: 'op-bk-4', label: 'native USDC bridge',              rationale: 'Looking for canonical USDC bridging, not wrapped tokens' },
      { id: 'op-bk-5', label: 'cross-chain stablecoin',          rationale: 'Broader stablecoin bridging discussions where Bridge Kit is relevant' },
      { id: 'op-bk-6', label: 'attestation USDC',                rationale: 'Developers dealing with CCTP attestation flow manually' },
      { id: 'op-bk-7', label: 'bridge USDC ethereum base',       rationale: 'Specific chain pairs Bridge Kit supports' },
      { id: 'op-bk-8', label: 'multichain USDC sdk',             rationale: 'Looking for an SDK to simplify multichain USDC flows' },
    ],
  },
  {
    id: 'app-kit',
    name: 'Circle App Kit',
    relevanceTerms: ['circle app kit', '@circle-fin/app-kit', 'circle-fin/app-kit'],
    searchConfig: APP_KIT_CONFIG,
    opportunityKeywords: [
      { id: 'op-ak-1', label: 'stablecoin payment sdk',          rationale: 'Developers looking for a payment SDK — core App Kit use case' },
      { id: 'op-ak-2', label: 'USDC payment integration',        rationale: 'Integrating USDC payments into an app' },
      { id: 'op-ak-3', label: 'accept stablecoin payments',      rationale: 'Merchants or apps wanting to accept stablecoin' },
      { id: 'op-ak-4', label: 'circle programmable wallets',     rationale: 'Using Circle wallets — App Kit builds on top of this' },
      { id: 'op-ak-5', label: 'web3 payment rails',              rationale: 'Looking for programmable payment infrastructure' },
      { id: 'op-ak-6', label: 'on-chain payment flow',           rationale: 'Building payment flows on-chain — App Kit simplifies this' },
      { id: 'op-ak-7', label: 'USDC treasury management sdk',    rationale: 'Treasury operations are a key App Kit use case' },
      { id: 'op-ak-8', label: 'stablecoin acquiring',            rationale: 'Stablecoin acquiring is an explicit App Kit use case' },
    ],
  },
  {
    id: 'swap-kit',
    name: 'Circle Swap Kit',
    relevanceTerms: ['circle swap kit', '@circle-fin/swap-kit', 'circle-fin/swap-kit'],
    searchConfig: SWAP_KIT_CONFIG,
    opportunityKeywords: [
      { id: 'op-sk-1', label: 'swap stablecoin on-chain',        rationale: 'Core Swap Kit use case — stablecoin swapping' },
      { id: 'op-sk-2', label: 'USDC USDT swap sdk',              rationale: 'Looking to swap between stablecoins programmatically' },
      { id: 'op-sk-3', label: 'token swap sdk ethereum',         rationale: 'Developers looking for a swap SDK — Swap Kit is purpose-built' },
      { id: 'op-sk-4', label: 'stablecoin conversion api',       rationale: 'Converting between stablecoins via API' },
      { id: 'op-sk-5', label: 'DEX aggregator stablecoin',       rationale: 'Using DEX aggregators for stablecoin swaps — Swap Kit is simpler' },
      { id: 'op-sk-6', label: 'cross-chain swap USDC',           rationale: 'Cross-chain swapping with USDC involved' },
      { id: 'op-sk-7', label: 'programmatic token swap',         rationale: 'Automating token swaps in code — Swap Kit use case' },
      { id: 'op-sk-8', label: 'USDC liquidity swap',             rationale: 'Liquidity management via stablecoin swaps' },
    ],
  },
]

export const DEFAULT_SEARCH_CONFIG = BRIDGE_KIT_CONFIG
