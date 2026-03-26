import { subDays, format } from 'date-fns'

export type Platform = 'GitHub' | 'Stack Overflow' | 'Reddit' | 'Medium' | 'Dev.to' | 'Web Articles' | 'Hacker News' | 'npm'

export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface Mention {
  id: string
  platform: Platform
  title: string
  url: string
  author: string
  date: string
  sentiment: Sentiment
  snippet: string
  score: number // upvotes / stars / views
}

export interface DailyCount {
  date: string
  GitHub: number
  'Stack Overflow': number
  Reddit: number
  Medium: number
  'Dev.to': number
  'Web Articles': number
  'Hacker News': number
  npm: number
  total: number
}

export interface PlatformSummary {
  platform: Platform
  total: number
  change: number // % vs previous period
  color: string
}

export interface NpmDownload {
  date: string
  downloads: number
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function dateStr(daysAgo: number) {
  return format(subDays(new Date('2026-03-17'), daysAgo), 'yyyy-MM-dd')
}

// ─── Trend data (90 days) ────────────────────────────────────────────────────

export function generateTrendData(days: number): DailyCount[] {
  const data: DailyCount[] = []
  for (let i = days - 1; i >= 0; i--) {
    // Simulate growing trend with some noise
    const growth = 1 + (days - i) / days * 0.6
    const gh = Math.round(randomBetween(3, 12) * growth)
    const so = Math.round(randomBetween(1, 6) * growth)
    const rd = Math.round(randomBetween(2, 10) * growth)
    const md = Math.round(randomBetween(0, 4) * growth)
    const dt = Math.round(randomBetween(0, 3) * growth)
    const wa = Math.round(randomBetween(1, 8) * growth)
    const hn = Math.round(randomBetween(0, 3) * growth)
    const npm = Math.round(randomBetween(800, 3200) * growth)
    data.push({
      date: dateStr(i),
      GitHub: gh,
      'Stack Overflow': so,
      Reddit: rd,
      Medium: md,
      'Dev.to': dt,
      'Web Articles': wa,
      'Hacker News': hn,
      npm,
      total: gh + so + rd + md + dt + wa + hn,
    })
  }
  return data
}

// ─── Platform summaries ──────────────────────────────────────────────────────

export const platformSummaries: PlatformSummary[] = [
  { platform: 'GitHub',         total: 312, change: +18, color: '#6ee7b7' },
  { platform: 'Reddit',         total: 198, change: +31, color: '#fb923c' },
  { platform: 'Stack Overflow', total: 145, change: +9,  color: '#f59e0b' },
  { platform: 'Web Articles',   total: 134, change: +42, color: '#818cf8' },
  { platform: 'Medium',         total: 87,  change: +22, color: '#38bdf8' },
  { platform: 'Dev.to',         total: 54,  change: +15, color: '#e879f9' },
  { platform: 'Hacker News',    total: 12,  change: +8,  color: '#f97316' },
  { platform: 'npm',            total: 0,   change: +67, color: '#4ade80' }, // downloads tracked separately
]

// ─── Recent mentions feed ────────────────────────────────────────────────────

export const recentMentions: Mention[] = [
  {
    id: '1',
    platform: 'GitHub',
    title: 'feat: integrate @circle-fin/bridge-kit for cross-chain USDC transfers',
    url: 'https://github.com/circlefin/circle-bridge-kit-sample/issues/1',
    author: 'devmike',
    date: dateStr(0),
    sentiment: 'positive',
    snippet: 'Integrating Circle Bridge Kit to allow seamless USDC bridging between Ethereum and Base. The SDK abstracts attestation nicely.',
    score: 47,
  },
  {
    id: '2',
    platform: 'GitHub',
    title: 'Circle Bridge Kit throws 500 on Avalanche Fuji testnet',
    url: 'https://github.com/circlefin/circle-bridge-kit-sample/issues/2',
    author: 'alpine_coder',
    date: dateStr(2),
    sentiment: 'negative',
    snippet: '@circle-fin/bridge-kit throws a 500 on Avalanche Fuji when calling bridge(). Same code works fine on Base Sepolia.',
    score: 8,
  },
  {
    id: '3',
    platform: 'Reddit',
    title: 'Circle Bridge Kit is surprisingly easy to integrate',
    url: 'https://reddit.com/r/ethereum/comments/example1',
    author: 'defi_lurker_99',
    date: dateStr(1),
    sentiment: 'positive',
    snippet: 'Spent a weekend integrating Circle Bridge Kit for native USDC bridging. The SDK handles the attestation flow end-to-end — way less boilerplate than rolling your own.',
    score: 89,
  },
  {
    id: '4',
    platform: 'Dev.to',
    title: 'How I built cross-chain USDC transfers with Circle Bridge Kit',
    url: 'https://dev.to/example/circle-bridge-kit',
    author: 'weekend_hacker',
    date: dateStr(3),
    sentiment: 'positive',
    snippet: 'Circle Bridge Kit (@circle-fin/bridge-kit) abstracts away the message attestation ceremony. I had a working flow in about 4 hours.',
    score: 112,
  },
  {
    id: '5',
    platform: 'Medium',
    title: 'Circle Bridge Kit vs rolling your own CCTP integration in 2026',
    url: 'https://medium.com/example/circle-bridge-kit',
    author: 'cross_chain_dev',
    date: dateStr(4),
    sentiment: 'positive',
    snippet: 'Circle Bridge Kit handles polling, attestation, and retries for you. The SDK is ~200 lines to replace what would be 1000+ lines of custom CCTP code.',
    score: 340,
  },
  {
    id: '6',
    platform: 'Reddit',
    title: 'Circle Bridge Kit fee structure — fast vs slow mode?',
    url: 'https://reddit.com/r/defi/comments/example2',
    author: 'fee_skeptic',
    date: dateStr(5),
    sentiment: 'neutral',
    snippet: 'Using @circle-fin/bridge-kit. Fast mode costs ~0.01 USDC, slow mode is free but takes ~65 confirmations. Any gotchas I should know about?',
    score: 56,
  },
]

// ─── npm downloads (weekly, 13 weeks) ───────────────────────────────────────

export function generateNpmData(weeks: number): NpmDownload[] {
  const data: NpmDownload[] = []
  for (let i = weeks - 1; i >= 0; i--) {
    const growth = 1 + (weeks - i) / weeks * 0.8
    data.push({
      date: format(subDays(new Date('2026-03-17'), i * 7), 'MMM d'),
      downloads: Math.round(randomBetween(12000, 22000) * growth),
    })
  }
  return data
}

// ─── Sentiment distribution ──────────────────────────────────────────────────

export const sentimentData = [
  { name: 'Positive', value: 58, color: '#4ade80' },
  { name: 'Neutral',  value: 31, color: '#94a3b8' },
  { name: 'Negative', value: 11, color: '#f87171' },
]

// ─── Top integration repos ────────────────────────────────────────────────────

export const topRepos = [
  { name: 'circlefin/bridge-kit-sample',       stars: 312, description: 'Official Circle Bridge Kit sample app',                          url: 'https://github.com/circlefin/bridge-kit-sample' },
  { name: 'fivoinc/fivo',                      stars: 187, description: 'Stablecoin payment gateway powered by @circle-fin/bridge-kit',   url: 'https://github.com/fivoinc/fivo' },
  { name: 'example-org/defi-checkout',         stars: 94,  description: 'Cross-chain USDC checkout using Circle Bridge Kit',              url: 'https://github.com/example-org/defi-checkout' },
  { name: 'example-org/multichain-wallet',     stars: 61,  description: 'Migrated cross-chain transfers to @circle-fin/bridge-kit',       url: 'https://github.com/example-org/multichain-wallet' },
  { name: 'example-org/circle-bridge-starter', stars: 38,  description: 'Minimal Next.js starter with Circle Bridge Kit integration',     url: 'https://github.com/example-org/circle-bridge-starter' },
]
