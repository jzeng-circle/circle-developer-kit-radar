/**
 * Live API fetchers — all public, no keys required.
 *
 * Sources:
 *   GitHub Search API   — 10 req/min unauthenticated (set VITE_GITHUB_TOKEN for 30/min)
 *   Reddit JSON API     — no auth, ~60 req/min
 *   Dev.to API          — no auth
 *   Stack Exchange API  — no auth, 300 req/day (set VITE_STACKEXCHANGE_KEY for more)
 *   npm registry API    — no auth
 *
 * Key-gated (requires .env):
 *   NewsAPI             — VITE_NEWSAPI_KEY  (free: 100 req/day)
 *   Google CSE          — VITE_GOOGLE_CSE_KEY + VITE_GOOGLE_CSE_ID (free: 100/day)
 */

import { format, subDays, fromUnixTime } from 'date-fns'
import type { Mention, NpmDownload, DailyCount, Platform, PlatformSummary } from './mockData'
import { DEFAULT_SEARCH_CONFIG, type SourceConfig, type OpportunityKeyword } from './searchConfig'

// ─── In-memory result cache (1-hour TTL) ─────────────────────────────────────
// Prevents redundant API calls when the user refreshes within the same session.
// Cache is keyed by fetcher name + serialised arguments.
// Invalidated automatically when the product changes (different key) or when
// the user explicitly hits "Apply & Refresh" (setSearchConfig resets the cache).

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resultCache = new Map<string, CacheEntry<any>>()

function cacheKey(name: string, ...args: unknown[]): string {
  return `${name}::${JSON.stringify(args)}`
}

function fromCache<T>(key: string): T | null {
  const entry = resultCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { resultCache.delete(key); return null }
  return entry.value as T
}

function toCache<T>(key: string, value: T): T {
  resultCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
  return value
}

/** Call after config changes to invalidate stale cached results */
export function invalidateCache() {
  resultCache.clear()
}

// ─── Active config ────────────────────────────────────────────────────────────

// Active config — can be overridden at runtime by the UI
let activeConfig: SourceConfig[] = DEFAULT_SEARCH_CONFIG
let activeRelevanceTerms: string[] = ['circle bridge kit', 'circlebridgekit', 'bridgekit', '@circle-fin/bridge-kit', 'circle-fin/bridge-kit']

export function setSearchConfig(config: SourceConfig[], relevanceTerms?: string[]) {
  activeConfig = config
  if (relevanceTerms) activeRelevanceTerms = relevanceTerms
  invalidateCache() // config changed — cached results are stale
}

function queriesFor(source: string): string[] {
  return activeConfig.find(s => s.source === source)?.queries.map(q => q.label) ?? []
}

function packagesFor(source: string): string[] {
  return activeConfig.find(s => s.source === source)?.packages ?? []
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

function githubHeaders(): HeadersInit {
  const token = import.meta.env.VITE_GITHUB_TOKEN
  return token ? { Authorization: `Bearer ${token}`, 'User-Agent': 'circle-developer-kit-radar' } : {}
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Run an array of async tasks sequentially with a delay between each.
// Used for rate-limited APIs (GitHub unauthenticated: 10/min, SO: 300/day).
// Returns settled results AND separately tracks whether any query errored.
async function sequential<T>(
  items: (() => Promise<T>)[],
  delayMs = 0
): Promise<{ results: PromiseSettledResult<T>[]; firstError: unknown | null }> {
  const results: PromiseSettledResult<T>[] = []
  let firstError: unknown | null = null
  for (let i = 0; i < items.length; i++) {
    if (i > 0 && delayMs > 0) await sleep(delayMs)
    try {
      results.push({ status: 'fulfilled', value: await items[i]() })
    } catch (e) {
      if (firstError === null) firstError = e
      results.push({ status: 'rejected', reason: e })
    }
  }
  return { results, firstError }
}

// ─── Content screener ────────────────────────────────────────────────────────
//
// Two-layer filter applied to every data point before it enters the pipeline:
//
//   Layer 1 — Blockchain/crypto context
//     Confirms the content is about the blockchain/web3/stablecoin domain.
//     Rejects generic uses of words like "bridge", "swap", or "kit" that have
//     nothing to do with crypto (e.g. a bridge-building library, a design kit).
//
//   Layer 2 — Circle Fin affiliation
//     Confirms the content refers to Circle Internet Financial, not another
//     company or product that happens to use the word "circle" (e.g. design
//     tools, social apps, family circle, payment processors unrelated to USDC).
//
// A data point passes only when BOTH layers return true, OR when it contains
// a product-specific anchor (package name / exact product name) that uniquely
// identifies Circle Fin — in that case the two-layer check is redundant.

// Strong product-specific anchors — presence of any one is sufficient on its own.
const PRODUCT_ANCHORS = [
  '@circle-fin/',
  'circle-fin/',
  'circle bridge kit',
  'circle app kit',
  'circle swap kit',
  'circlebridgekit',
  'circleappkit',
  'circleswapkit',
  // Hyphenated forms as they appear in repo names, topics, and descriptions
  'circle-bridge-kit',
  'circle-app-kit',
  'circle-swap-kit',
  // Possessive / prose forms ("Circle's Bridge Kit", "Circle's App Kit")
  "circle's bridge kit",
  "circle's app kit",
  "circle's swap kit",
]

// Layer 1: blockchain/web3/stablecoin domain signals.
// Rules: no bare common English words — every term must be specific enough
// that it cannot appear in unrelated content.
// Removed: 'base' (matches "baseball", "database"), 'token' (too generic),
//          'wallet' (generic), 'protocol' (generic), 'mint' (NFT art sites),
//          'burn' (fitness/cooking), 'dai' (Japanese word / name)
const BLOCKCHAIN_SIGNALS = [
  'blockchain', 'web3', 'defi', 'stablecoin',
  'usdc', 'eurc', 'usdt',
  'ethereum', 'solana', 'polygon', 'arbitrum', 'optimism', 'avalanche',
  'base chain', 'base network', 'base mainnet', 'base testnet',  // "Base" the L2, not the word
  'on-chain', 'onchain', 'smart contract', 'evm',
  'crypto wallet', 'web3 wallet', 'blockchain wallet',
  'crypto token', 'erc20', 'erc-20',
  'cctp', 'cross-chain', 'crosschain', 'multichain', 'layer 2', 'l2 network',
  'dapp', 'decentralized', 'liquidity pool', 'attestation service',
  'nft', 'gas fee', 'rpc', 'testnet', 'mainnet', 'sepolia', 'goerli',
]

// Layer 2: Circle Fin identity signals.
// Rules: 'circle' alone is NOT valid — it matches circles in geometry, sports,
// social groups, etc. Every signal must be a multi-word phrase or a technical
// identifier that uniquely points to Circle Internet Financial.
const CIRCLE_FIN_SIGNALS = [
  'circle.com',
  'circle internet', 'circle financial',
  'circlefin', 'circle-fin', '@circle-fin',
  'circle developer', 'circle sdk', 'circle api', 'circle kit',
  'circle programmable', 'circle infrastructure',
  'circle usdc', 'circle stablecoin', 'circle wallet',
  'circle bridge', 'circle swap', 'circle app kit',
  "circle's bridge", "circle's swap", "circle's app",
]

/**
 * Returns true if the text is confirmed to be about blockchain content from
 * Circle Internet Financial. Passes immediately on a strong product anchor.
 * Otherwise requires both a blockchain signal AND a Circle Fin signal.
 *
 * Use for Monitor mode — every data point must be attributable to Circle Fin.
 */
function isCircleFinBlockchainContent(text: string): boolean {
  const t = text.toLowerCase()

  // Fast path: exact product anchor — unambiguously Circle Fin
  if (PRODUCT_ANCHORS.some(anchor => t.includes(anchor))) return true

  // Both layers must match
  const hasBlockchain = BLOCKCHAIN_SIGNALS.some(s => t.includes(s))
  const hasCircleFin  = CIRCLE_FIN_SIGNALS.some(s => t.includes(s))
  return hasBlockchain && hasCircleFin
}

/**
 * Blockchain-only screener for Outreach mode.
 * Opportunity threads are from developers who haven't discovered Circle yet,
 * so Circle Fin signals are intentionally absent. We still require blockchain
 * context to reject completely off-topic results (e.g. a "USDC" coupon code).
 */
function isBlockchainContent(text: string): boolean {
  const t = text.toLowerCase()
  return BLOCKCHAIN_SIGNALS.some(s => t.includes(s))
}

// Returns true if the text contains at least one of the active product's terms
function isRelevant(text: string): boolean {
  const t = text.toLowerCase()
  return activeRelevanceTerms.some(term => t.includes(term))
}

// Stricter check — term must appear in the title or the first 300 chars of body.
// Used for sources (Reddit, HN) where broad queries can return loosely-matched posts.
function isRelevantStrict(title: string, body: string): boolean {
  const t = title.toLowerCase()
  const b = body.toLowerCase().slice(0, 300)
  return activeRelevanceTerms.some(term => t.includes(term) || b.includes(term))
}

// Map a URL's hostname to a Platform for accurate source classification
function platformFromUrl(url: string): Platform {
  try {
    const host = new URL(url).hostname.replace('www.', '')
    if (host.includes('medium.com'))         return 'Medium'
    if (host.includes('dev.to'))             return 'Dev.to'
    if (host.includes('reddit.com'))         return 'Reddit'
    if (host.includes('github.com') ||
        host.includes('githubusercontent'))   return 'GitHub'
    if (host.includes('news.ycombinator'))   return 'Hacker News'
    if (host.includes('stackoverflow.com'))  return 'Stack Overflow'
  } catch { /* ignore bad URLs */ }
  return 'Web Articles'
}

// Automated dependency bump PRs — no signal value
function isDependencyBump(title: string): boolean {
  const t = title.toLowerCase()
  return t.startsWith('build(deps)') || t.startsWith('chore(deps)') || t.startsWith('bump ')
}

function classifySentiment(text: string): 'positive' | 'neutral' | 'negative' {
  const t = text.toLowerCase()
  const pos = ['great', 'awesome', 'love', 'works perfectly', 'solved', 'easy to use', 'seamless', 'perfect', 'excellent', 'underrated', 'game changer', 'highly recommend', 'works great', 'super easy', 'love this']
  // Negative signals require stronger phrasing — avoid flagging press releases that say
  // "solves the problem of X" or "without the issue of wrapped tokens" as negative.
  const neg = ['broken', 'bug ', 'buggy', 'fails to', 'not working', 'doesnt work', "doesn't work", 'keeps failing', 'frustrating', 'timed out', 'throws an error', 'getting an error', 'stuck on', 'cannot figure out', 'completely broken']
  const posScore = pos.filter(w => t.includes(w)).length
  const negScore = neg.filter(w => t.includes(w)).length
  if (posScore > negScore) return 'positive'
  if (negScore > posScore) return 'negative'
  return 'neutral'
}

// ─── GitHub ──────────────────────────────────────────────────────────────────

export async function fetchGitHubMentions(days = 30): Promise<Mention[]> {
  const key = cacheKey('fetchGitHubMentions', days, queriesFor('GitHub'))
  const cached = fromCache<Mention[]>(key)
  if (cached) return cached
  // Circle Bridge Kit was published Oct 2025 — always fetch from publish date,
  // never restrict by `created:>` in the API query (too few results to paginate).
  // Apply the time range filter client-side after fetching.
  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10)
  const queries = queriesFor('GitHub')
  const seen = new Set<string>()
  const mentions: Mention[] = []

  // Sequential with delay to respect unauthenticated rate limit (10 req/min).
  // With a token the limit is 30/min so no delay needed, but sequential is safe either way.
  const hasToken = !!import.meta.env.VITE_GITHUB_TOKEN
  const { results, firstError } = await sequential(
    queries.map(q => () => {
      const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=created&order=desc&per_page=50`
      return fetch(url, { headers: githubHeaders() }).then(r => r.json()).then(d => d.items ?? [])
    }),
    hasToken ? 0 : 1500
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      if (seen.has(String(item.id))) continue
      if (isDependencyBump(item.title)) continue
      const combined = `${item.title} ${item.body ?? ''}`
      if (!isRelevant(combined)) continue
      if (!isCircleFinBlockchainContent(combined)) continue
      // Client-side date filter — only include if within the selected range
      if (item.created_at.slice(0, 10) < cutoff) continue
      seen.add(String(item.id))
      mentions.push({
        id: `gh-${item.id}`,
        platform: 'GitHub',
        title: item.title,
        url: item.html_url,
        author: item.user?.login ?? 'unknown',
        date: item.created_at.slice(0, 10),
        sentiment: classifySentiment(combined),
        snippet: item.body ? item.body.replace(/<!--[\s\S]*?-->/g, '').replace(/\n+/g, ' ').trim().slice(0, 200) : 'No description.',
        score: item.reactions?.['+1'] ?? 0,
      })
    }
  }
  if (mentions.length === 0 && firstError !== null) throw firstError
  return toCache(key, mentions)
}

// Scan all package.json files in a repo (excluding node_modules) and return
// every unique @circle-fin/* package listed in any dependency field.
// Handles both single-package repos and monorepos with nested packages.
async function fetchCircleKitsFromPackageJson(fullName: string): Promise<string[]> {
  try {
    // Step 1: get the full repo tree to find every package.json path
    const treeRes = await fetch(
      `https://api.github.com/repos/${fullName}/git/trees/HEAD?recursive=1`,
      { headers: githubHeaders() }
    )
    if (!treeRes.ok) return []
    const tree = await treeRes.json()
    const packageJsonPaths: string[] = (tree.tree ?? [])
      .filter((f: any) => f.type === 'blob' && f.path.endsWith('package.json') && !f.path.includes('node_modules'))
      .map((f: any) => f.path)

    if (packageJsonPaths.length === 0) return []

    // Step 2: fetch and parse each package.json, collect @circle-fin/* deps
    const kitSet = new Set<string>()
    await Promise.allSettled(
      packageJsonPaths.map(async path => {
        const res = await fetch(
          `https://api.github.com/repos/${fullName}/contents/${path}`,
          { headers: githubHeaders() }
        )
        if (!res.ok) return
        const data = await res.json()
        const content = atob(data.content.replace(/\n/g, ''))
        const pkg = JSON.parse(content)
        const allDeps = { ...pkg.dependencies, ...pkg.devDependencies, ...pkg.peerDependencies }
        Object.keys(allDeps)
          .filter(dep => dep.startsWith('@circle-fin/'))
          .forEach(dep => kitSet.add(dep))
      })
    )

    return [...kitSet].sort()
  } catch {
    return []
  }
}

export async function fetchGitHubRepos() {
  const queries = queriesFor('GitHub Repos')
  if (queries.length === 0) return []
  const key = cacheKey('fetchGitHubRepos', queries, packagesFor('npm'))
  type RepoResult = { name: string; stars: number; description: string; url: string; kits: string[] }[]
  const cached = fromCache<RepoResult>(key)
  if (cached) return cached

  const seen = new Set<string>()
  const candidates: { full_name: string; stars: number; description: string; html_url: string }[] = []

  // Step 1: collect candidates that pass the anchor check
  const hasToken = !!import.meta.env.VITE_GITHUB_TOKEN
  const { results, firstError } = await sequential(
    queries.map(q => () => {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(q)}&sort=stars&order=desc&per_page=10`
      return fetch(url, { headers: githubHeaders() }).then(r => r.json()).then(d => d.items ?? [])
    }),
    hasToken ? 0 : 1500
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const r of result.value) {
      if (seen.has(r.full_name)) continue
      // Require a product anchor in name, description, or topics — rejects repos
      // that only incidentally contain "circle" + a blockchain term.
      const combined = `${r.full_name} ${r.description ?? ''} ${(r.topics ?? []).join(' ')}`
      const hasAnchor = PRODUCT_ANCHORS.some(anchor => combined.toLowerCase().includes(anchor))
      if (!hasAnchor) continue
      seen.add(r.full_name)
      candidates.push({
        full_name: r.full_name,
        stars: r.stargazers_count,
        description: r.description ?? '',
        html_url: r.html_url,
      })
    }
  }

  if (candidates.length === 0 && firstError !== null) throw firstError

  // Step 2: verify each candidate by fetching its package.json — ground truth.
  // Only keep repos that actually declare at least one of this product's packages
  // as a dependency. This prevents e.g. a Bridge Kit repo from appearing under
  // Swap Kit just because the search query loosely matched its repo name.
  const activePackages = packagesFor('npm')  // e.g. ['@circle-fin/bridge-kit']

  const verified = await Promise.allSettled(
    candidates.map(async c => {
      const kits = await fetchCircleKitsFromPackageJson(c.full_name)
      return { ...c, kits }
    })
  )

  const repos = verified
    .filter(r => {
      if (r.status !== 'fulfilled') return false
      const { kits } = r.value
      // Must have at least one @circle-fin package AND it must match this product
      if (kits.length === 0) return false
      if (activePackages.length === 0) return true  // no product filter available, accept any kit
      return activePackages.some(pkg => kits.includes(pkg))
    })
    .map(r => (r as PromiseFulfilledResult<typeof candidates[0] & { kits: string[] }>).value)
    .map(r => ({
      name: r.full_name,
      stars: r.stars,
      description: r.description,
      url: r.html_url,
      kits: r.kits,
    }))

  return toCache(key, repos.sort((a, b) => b.stars - a.stars).slice(0, 8))
}

// ─── Reddit ──────────────────────────────────────────────────────────────────

export async function fetchRedditMentions(days = 30): Promise<Mention[]> {
  const key = cacheKey('fetchRedditMentions', days, queriesFor('Reddit'))
  const cached = fromCache<Mention[]>(key); if (cached) return cached
  const cutoff = Date.now() / 1000 - days * 86400
  const queries = queriesFor('Reddit')
  const headers = { 'User-Agent': 'circle-developer-kit-radar/1.0' }

  const { results, firstError } = await sequential(
    queries.map(q => () =>
      fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=25&t=year`, { headers })
        .then(r => {
          if (!r.ok) throw new Error(`Reddit API ${r.status}`)
          return r.json()
        })
        .then(d => d.data?.children ?? [])
        .catch(err => {
          if (err instanceof TypeError) throw new Error('Reddit 429 — rate limit (CORS blocked response)')
          throw err
        })
    ),
    2000
  )

  const seen = new Set<string>()
  const mentions: Mention[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const child of result.value) {
      const p = child.data
      if (seen.has(p.id) || p.created_utc < cutoff) continue
      if (!isRelevantStrict(p.title, p.selftext ?? '')) continue
      if (!isCircleFinBlockchainContent(`${p.title} ${p.selftext ?? ''}`)) continue
      seen.add(p.id)
      const combined = `${p.title} ${p.selftext ?? ''}`
      mentions.push({
        id: `rd-${p.id}`,
        platform: 'Reddit',
        title: p.title,
        url: `https://reddit.com${p.permalink}`,
        author: p.author,
        date: format(fromUnixTime(p.created_utc), 'yyyy-MM-dd'),
        sentiment: classifySentiment(combined),
        snippet: p.selftext ? p.selftext.trim().slice(0, 200) : '',
        score: p.score,
      })
    }
  }

  if (mentions.length === 0 && firstError !== null) throw firstError
  return toCache(key, mentions.sort((a, b) => b.date.localeCompare(a.date)))
}

// ─── Dev.to ──────────────────────────────────────────────────────────────────

export async function fetchDevToMentions(days = 30): Promise<Mention[]> {
  const key = cacheKey('fetchDevToMentions', days, queriesFor('Dev.to'))
  const cached = fromCache<Mention[]>(key); if (cached) return cached
  const cutoff = subDays(new Date(), days).toISOString()
  const query = queriesFor('Dev.to')[0] ?? '"Circle CCTP"'
  const res = await fetch(`https://dev.to/api/articles/search?q=${encodeURIComponent(query)}&per_page=20`, {
    headers: { 'User-Agent': 'circle-developer-kit-radar/1.0' },
  })
  if (!res.ok) throw new Error(`Dev.to API ${res.status}`)
  const articles = await res.json()

  const result: Mention[] = (articles ?? [])
    .filter((a: any) => {
      if (a.published_at < cutoff) return false
      // Dev.to search ignores quoted phrases — verify relevance client-side
      const combined = `${a.title} ${a.description ?? ''} ${a.tag_list?.join(' ') ?? ''}`
      return isRelevant(combined) && isCircleFinBlockchainContent(combined)
    })
    .map((a: any): Mention => ({
      id: `dt-${a.id}`,
      platform: 'Dev.to',
      title: a.title,
      url: a.url,
      author: a.user?.username ?? 'unknown',
      date: a.published_at.slice(0, 10),
      sentiment: classifySentiment(a.title + ' ' + (a.description ?? '')),
      snippet: a.description ?? '',
      score: (a.positive_reactions_count ?? 0) + (a.comments_count ?? 0),
    }))
  return toCache(key, result)
}

// ─── Stack Overflow ──────────────────────────────────────────────────────────
// Note: SO has very few CCTP-specific questions — returns what exists

export async function fetchStackOverflowMentions(days = 30): Promise<Mention[]> {
  const cKey = cacheKey('fetchStackOverflowMentions', days, queriesFor('Stack Overflow'))
  const cached = fromCache<Mention[]>(cKey); if (cached) return cached
  const fromDate = Math.floor(subDays(new Date(), days).getTime() / 1000)
  const key = import.meta.env.VITE_STACKEXCHANGE_KEY ?? ''
  const keyParam = key ? `&key=${key}` : ''
  const queries = queriesFor('Stack Overflow')

  // &origin= is required for CORS when calling from a browser on a non-localhost domain.
  // When SO returns 429 (rate limit) the response has no CORS headers, causing the browser
  // to surface it as a CORS error rather than a 429. We catch that and re-throw with a
  // clear message so the error badge shows the right description.
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''
  const originParam = origin ? `&origin=${origin}` : ''

  // Only use the first (most specific) query to minimise daily quota usage.
  // SO has a shared 300 req/day unauthenticated limit across all browser sessions.
  const soQueries = queries.slice(0, 1)

  const { results, firstError } = await sequential(
    soQueries.map(q => () =>
      fetch(
        `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=creation&q=${encodeURIComponent(q)}&fromdate=${fromDate}&site=stackoverflow&pagesize=15${keyParam}${originParam}`
      )
        .then(r => {
          if (!r.ok) throw new Error(`Stack Overflow API ${r.status}`)
          return r.json()
        })
        .then(d => {
          if (d.error_id === 502) throw new Error('Stack Overflow 429 — daily quota exceeded')
          return d.items ?? []
        })
        .catch(err => {
          // CORS errors (when SO returns 429 without CORS headers) surface as TypeError
          if (err instanceof TypeError) throw new Error('Stack Overflow 429 — rate limit (CORS blocked response)')
          throw err
        })
    ),
    3000
  )

  const seen = new Set<string>()
  const mentions: Mention[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      if (seen.has(String(item.question_id))) continue
      const combined = `${item.title} ${item.tags?.join(' ') ?? ''}`
      if (!isCircleFinBlockchainContent(combined)) continue
      seen.add(String(item.question_id))
      mentions.push({
        id: `so-${item.question_id}`,
        platform: 'Stack Overflow',
        title: item.title,
        url: item.link,
        author: item.owner?.display_name ?? 'unknown',
        date: format(fromUnixTime(item.creation_date), 'yyyy-MM-dd'),
        sentiment: classifySentiment(item.title),
        snippet: item.tags?.join(', ') ?? '',
        score: item.score,
      })
    }
  }

  if (mentions.length === 0 && firstError !== null) throw firstError
  return toCache(cKey, mentions)
}

// ─── npm downloads ───────────────────────────────────────────────────────────
// @circle-fin/bridge-kit was published 2025-10-14 so "last-N-days" shorthand
// returns a 2015 fallback. We always use an explicit date range instead.

const NPM_PUBLISH_DATE = '2025-10-14'

export async function fetchNpmDownloads(weeks = 13): Promise<NpmDownload[]> {
  const key = cacheKey('fetchNpmDownloads', weeks, packagesFor('npm'))
  const cached = fromCache<NpmDownload[]>(key); if (cached) return cached
  const packages = packagesFor('npm')
  const endDate = format(new Date(), 'yyyy-MM-dd')
  const startDate = format(subDays(new Date(), weeks * 7), 'yyyy-MM-dd')
  // Never go before the package publish date
  const from = startDate < NPM_PUBLISH_DATE ? NPM_PUBLISH_DATE : startDate

  const results = await Promise.allSettled(
    packages.map(pkg =>
      fetch(`https://api.npmjs.org/downloads/range/${from}:${endDate}/${encodeURIComponent(pkg)}`)
        .then(r => r.json())
    )
  )

  // Aggregate by day across all packages
  const byDay: Record<string, number> = {}
  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    const downloads: { day: string; downloads: number }[] = result.value.downloads ?? []
    for (const d of downloads) {
      byDay[d.day] = (byDay[d.day] ?? 0) + d.downloads
    }
  }

  // Group into weekly buckets
  const sortedDays = Object.keys(byDay).sort()
  const weekly: NpmDownload[] = []
  for (let i = 0; i < sortedDays.length; i += 7) {
    const slice = sortedDays.slice(i, i + 7)
    const total = slice.reduce((sum, d) => sum + (byDay[d] ?? 0), 0)
    weekly.push({
      date: format(new Date(slice[0]), 'MMM d'),
      downloads: total,
    })
  }

  return toCache(key, weekly)
}

// ─── GitHub Commits ───────────────────────────────────────────────────────────
// Uses the commits search API (requires preview Accept header)

export async function fetchGitHubCommits(days = 30): Promise<Mention[]> {
  const key = cacheKey('fetchGitHubCommits', days, queriesFor('GitHub Commits'))
  const cached = fromCache<Mention[]>(key); if (cached) return cached
  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10)
  const queries = queriesFor('GitHub Commits')
  const seen = new Set<string>()
  const mentions: Mention[] = []

  const hasToken = !!import.meta.env.VITE_GITHUB_TOKEN
  const { results, firstError } = await sequential(
    queries.map(q => () => {
      const url = `https://api.github.com/search/commits?q=${encodeURIComponent(q)}&sort=committer-date&order=desc&per_page=50`
      return fetch(url, {
        headers: {
          ...githubHeaders(),
          Accept: 'application/vnd.github.cloak-preview',
        },
      }).then(r => r.json()).then(d => d.items ?? [])
    }),
    hasToken ? 0 : 1500
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      const sha = item.sha as string
      if (seen.has(sha)) continue
      const message: string = item.commit?.message ?? ''
      const combined = message
      if (isDependencyBump(combined)) continue
      if (!isRelevant(combined)) continue
      if (!isCircleFinBlockchainContent(combined)) continue
      const dateStr: string = (item.commit?.committer?.date ?? item.commit?.author?.date ?? '').slice(0, 10)
      if (!dateStr || dateStr < cutoff) continue
      seen.add(sha)
      mentions.push({
        id: `ghc-${sha.slice(0, 8)}`,
        platform: 'GitHub',
        title: message.split('\n')[0].trim().slice(0, 120),
        url: item.html_url ?? item.commit?.url ?? '#',
        author: item.author?.login ?? item.commit?.author?.name ?? 'unknown',
        date: dateStr,
        sentiment: classifySentiment(combined),
        snippet: message.split('\n').slice(1).join(' ').trim().slice(0, 200) || message.slice(0, 200),
        score: 0,
      })
    }
  }
  if (mentions.length === 0 && firstError !== null) throw firstError
  return toCache(key, mentions)
}

// ─── Hacker News ──────────────────────────────────────────────────────────────
// Uses Algolia HN search API — no key required

export async function fetchHackerNewsMentions(days = 30): Promise<Mention[]> {
  const key = cacheKey('fetchHackerNewsMentions', days, queriesFor('Hacker News'))
  const cached = fromCache<Mention[]>(key); if (cached) return cached
  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10)
  const queries = queriesFor('Hacker News')
  const seen = new Set<string>()
  const mentions: Mention[] = []

  const results = await Promise.allSettled(
    queries.map(q =>
      fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=30`,
        { headers: { 'User-Agent': 'circle-developer-kit-radar/1.0' } }
      ).then(r => r.json()).then(d => d.hits ?? [])
    )
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      const id = String(item.objectID)
      if (seen.has(id)) continue
      if (!isRelevantStrict(item.title ?? '', item.url ?? '')) continue
      const dateStr: string = (item.created_at ?? '').slice(0, 10)
      if (!dateStr || dateStr < cutoff) continue
      const combined = `${item.title ?? ''} ${item.url ?? ''}`
      if (!isCircleFinBlockchainContent(combined)) continue
      seen.add(id)
      mentions.push({
        id: `hn-${id}`,
        platform: 'Hacker News',
        title: item.title ?? '(no title)',
        url: item.url ?? `https://news.ycombinator.com/item?id=${id}`,
        author: item.author ?? 'unknown',
        date: dateStr,
        sentiment: classifySentiment(item.title ?? ''),
        snippet: item.url ?? '',
        score: item.points ?? 0,
      })
    }
  }

  return toCache(key, mentions.sort((a, b) => b.date.localeCompare(a.date)))
}

// ─── Medium (via tag RSS proxy) ───────────────────────────────────────────────
// Medium has no public search API. We fetch the tag RSS via rss2json.com.
// Returns 0 results for new/unlaunched tags — shown as "live" connection.

export async function fetchMediumMentions(days = 30): Promise<Mention[]> {
  const configuredTags = queriesFor('Medium')
  const broadTags = ['usdc', 'stablecoin', 'web3', 'cctp']
  const allTags = [...new Set([...configuredTags, ...broadTags])]
  const key = cacheKey('fetchMediumMentions', days, allTags)
  const cached = fromCache<Mention[]>(key); if (cached) return cached
  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10)
  // Fetch all configured tags in parallel — product-specific tags (e.g. circle-bridge-kit)
  // plus broad Web3 tags where authors are less likely to use the exact product tag.

  let rss2jsonFailed = 0
  const results = await Promise.allSettled(
    allTags.map(tag => {
      const rssUrl = `https://medium.com/feed/tag/${encodeURIComponent(tag)}`
      const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
      return fetch(url, { headers: { 'User-Agent': 'circle-developer-kit-radar/1.0' } })
        .then(r => {
          if (!r.ok) throw new Error(`rss2json HTTP ${r.status}`)
          return r.json()
        })
        .then(d => {
          if (d.status !== 'ok') throw new Error(`rss2json error: ${d.message ?? d.status}`)
          return d.items ?? []
        })
        .catch(err => { rss2jsonFailed++; throw err })
    })
  )

  const seen = new Set<string>()
  const mentions: Mention[] = []

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      const link: string = item.link ?? ''
      if (seen.has(link)) continue
      const dateStr: string = (item.pubDate ?? '').slice(0, 10)
      if (!dateStr || dateStr < cutoff) continue
      // rss2json includes full HTML content — use it for screener so we catch
      // articles where "Circle Bridge Kit" appears in the body but not the title.
      const combined = `${item.title ?? ''} ${item.description ?? ''} ${item.content ?? ''}`
      if (!isCircleFinBlockchainContent(combined)) continue
      seen.add(link)
      mentions.push({
        id: `md-${encodeURIComponent(link).slice(0, 80)}`,
        platform: 'Medium',
        title: item.title ?? '(no title)',
        url: link || '#',
        author: item.author ?? 'unknown',
        date: dateStr,
        sentiment: classifySentiment(`${item.title ?? ''} ${item.description ?? ''}`),
        snippet: (item.description ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 200),
        score: 0,
      })
    }
  }

  // If every tag fetch failed and we got nothing, surface the error
  if (mentions.length === 0 && rss2jsonFailed === allTags.length) {
    const firstRejected = results.find(r => r.status === 'rejected') as PromiseRejectedResult | undefined
    if (firstRejected) throw firstRejected.reason
  }
  return toCache(key, mentions.sort((a, b) => b.date.localeCompare(a.date)))
}

// ─── Tavily Web Search (key-gated) ───────────────────────────────────────────
// Catches web articles, Binance Square, Medium, Mirror.xyz, blogs, press releases.
// Requires VITE_TAVILY_KEY. Free tier: 1000 searches/month.

export async function fetchGoogleCSEMentions(days = 30): Promise<Mention[]> {
  const apiKey = import.meta.env.VITE_TAVILY_KEY
  if (!apiKey) throw new Error('VITE_TAVILY_KEY not configured — add it as a GitHub Actions secret to enable web article search')
  const key = cacheKey('fetchGoogleCSEMentions', days, queriesFor('Google CSE'))
  const cached = fromCache<Mention[]>(key); if (cached) return cached

  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10)
  const queries = queriesFor('Google CSE')
  const seen = new Set<string>()
  const mentions: Mention[] = []

  const results = await Promise.allSettled(
    queries.map(q =>
      fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query: q,
          search_depth: 'basic',
          max_results: 10,
          include_answer: false,
        }),
      }).then(r => r.json()).then(d => d.results ?? [])
    )
  )

  for (const result of results) {
    if (result.status !== 'fulfilled') continue
    for (const item of result.value) {
      const url: string = item.url ?? ''
      if (seen.has(url)) continue
      const combined = `${item.title ?? ''} ${item.content ?? ''}`
      // Tavily already searched for the product query — skip isRelevant to avoid missing
      // articles that use alternate spellings like "BridgeKit" or "Bridge Kit SDK".
      // Still apply the domain screener to catch off-topic results.
      if (!isCircleFinBlockchainContent(combined)) continue
      // Tavily returns published_date when available; fall back to date in URL path
      // (e.g. crypto.news/2025/10/14/...) rather than faking today's date.
      let dateStr: string = item.published_date ? item.published_date.slice(0, 10) : ''
      if (!dateStr) {
        const m = url.match(/\/(20\d\d)[\/\-](0[1-9]|1[0-2])[\/\-](0[1-9]|[12]\d|3[01])/)
        if (m) dateStr = `${m[1]}-${m[2]}-${m[3]}`
      }
      // Only apply date filter when we have a reliable date; unknown-date articles pass through
      if (dateStr && dateStr < cutoff) continue
      seen.add(url)
      const platform = platformFromUrl(url)
      mentions.push({
        id: `tvly-${encodeURIComponent(url).slice(0, 40)}`,
        platform,
        title: item.title ?? '(no title)',
        url,
        author: new URL(url).hostname.replace('www.', ''),
        date: dateStr,
        sentiment: classifySentiment(combined),
        snippet: (item.content ?? '').replace(/\n/g, ' ').trim().slice(0, 200),
        score: Math.round((item.score ?? 0) * 100),
      })
    }
  }

  return toCache(key, mentions.sort((a, b) => b.date.localeCompare(a.date)))
}

// ─── NewsAPI (key-gated) ──────────────────────────────────────────────────────

export async function fetchNewsArticles(days = 30): Promise<Mention[]> {
  const apiKey = import.meta.env.VITE_NEWSAPI_KEY
  if (!apiKey) throw new Error('VITE_NEWSAPI_KEY not configured — add it as a GitHub Actions secret to enable news search')
  const cKey = cacheKey('fetchNewsArticles', days, queriesFor('News (NewsAPI)'))
  const cached = fromCache<Mention[]>(cKey); if (cached) return cached

  const from = format(subDays(new Date(), days), 'yyyy-MM-dd')
  const query = queriesFor('News (NewsAPI)').join(' OR ')
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${from}&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`

  const res = await fetch(url)
  if (!res.ok) return []
  const data = await res.json()

  const result: Mention[] = (data.articles ?? [])
    .filter((a: any) => isCircleFinBlockchainContent(`${a.title ?? ''} ${a.description ?? ''}`))
    .map((a: any, i: number): Mention => ({
    id: `news-${i}`,
    platform: 'Web Articles',
    title: a.title,
    url: a.url,
    author: a.source?.name ?? a.author ?? 'unknown',
    date: a.publishedAt.slice(0, 10),
    sentiment: classifySentiment(`${a.title} ${a.description ?? ''}`),
    snippet: a.description ?? '',
    score: 0,
  }))
  return toCache(cKey, result)
}

// ─── Trend data builder ───────────────────────────────────────────────────────
// Groups a flat list of mentions by date and platform into DailyCount[]

export function buildTrendData(mentions: Mention[], days: number): DailyCount[] {
  const map: Record<string, DailyCount> = {}

  // Pre-fill every day in range with zeros
  for (let i = days - 1; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd')
    map[d] = { date: d, GitHub: 0, 'Stack Overflow': 0, Reddit: 0, Medium: 0, 'Dev.to': 0, 'Web Articles': 0, 'Hacker News': 0, npm: 0, total: 0 }
  }

  for (const m of mentions) {
    if (!map[m.date]) continue
    const row = map[m.date]
    if (m.platform in row) {
      (row as any)[m.platform]++
      row.total++
    }
  }

  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Opportunity fetcher ──────────────────────────────────────────────────────
// Searches developer forums for threads matching opportunity keywords,
// then filters OUT any that already mention the product (already aware).
// Result: threads where the product could be recommended.

export interface Opportunity {
  id: string
  platform: 'Reddit' | 'Stack Overflow' | 'Hacker News' | 'GitHub' | 'Dev.to'
  title: string
  url: string
  author: string
  date: string
  score: number          // upvotes / points — proxy for reach
  snippet: string
  keyword: string        // which opportunity keyword matched
  rationale: string      // why this keyword is relevant for the product
}

export async function fetchOpportunities(
  keywords: OpportunityKeyword[],
  relevanceTerms: string[],
  days = 30
): Promise<Opportunity[]> {
  const cutoff = subDays(new Date(), days).toISOString().slice(0, 10)
  const cutoffUnix = Date.now() / 1000 - days * 86400

  // isAlreadyAware — true if the thread already mentions the product
  function isAlreadyAware(text: string): boolean {
    const t = text.toLowerCase()
    return relevanceTerms.some(term => t.includes(term))
  }

  const seen = new Set<string>()
  const opportunities: Opportunity[] = []

  const soFromDate = Math.floor(subDays(new Date(), days).getTime() / 1000)
  const soKey = import.meta.env.VITE_STACKEXCHANGE_KEY ?? ''
  const soKeyParam = soKey ? `&key=${soKey}` : ''
  const soOrigin = encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')
  const hasGhToken = !!import.meta.env.VITE_GITHUB_TOKEN

  // Process keywords sequentially to avoid overwhelming rate limits.
  // Within each keyword, HN (generous limits) runs in parallel; Reddit and SO are staggered.
  for (let kwIdx = 0; kwIdx < keywords.length; kwIdx++) {
    if (kwIdx > 0) await sleep(2000) // gap between keywords
    const kw = keywords[kwIdx]
    const q = kw.label

    // Reddit — 1 req per keyword
    await fetch(
        `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=15&t=year`,
        { headers: { 'User-Agent': 'circle-developer-kit-radar/1.0' } }
      )
        .then(r => {
          if (!r.ok) throw new Error(`Reddit ${r.status}`)
          return r.json()
        })
        .then(d => {
          for (const child of d.data?.children ?? []) {
            const p = child.data
            if (seen.has(`rd-${p.id}`)) continue
            if (p.created_utc < cutoffUnix) continue
            const combined = `${p.title} ${p.selftext ?? ''}`
            if (!isBlockchainContent(combined)) continue
            if (isAlreadyAware(combined)) continue
            seen.add(`rd-${p.id}`)
            opportunities.push({
              id: `rd-${p.id}`,
              platform: 'Reddit',
              title: p.title,
              url: `https://reddit.com${p.permalink}`,
              author: p.author,
              date: format(fromUnixTime(p.created_utc), 'yyyy-MM-dd'),
              score: p.score,
              snippet: p.selftext ? p.selftext.trim().slice(0, 200) : '',
              keyword: kw.label,
              rationale: kw.rationale,
            })
          }
        })
        .catch(_err => { /* rate-limited or CORS — skip this keyword's Reddit results */ })

    await sleep(1200)

    // Stack Overflow — 1 req per keyword, 1.2s after Reddit
    await fetch(
        `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(q)}&fromdate=${soFromDate}&site=stackoverflow&pagesize=10${soKeyParam}&origin=${soOrigin}`
      )
        .then(r => {
          if (!r.ok) throw new Error(`SO ${r.status}`)
          return r.json()
        })
        .then(d => {
          if (d.error_id === 502) return // quota exceeded
          for (const item of d.items ?? []) {
            const id = `so-${item.question_id}`
            if (seen.has(id)) continue
            const combined = `${item.title} ${item.tags?.join(' ') ?? ''}`
            if (!isBlockchainContent(combined)) continue
            if (isAlreadyAware(combined)) continue
            seen.add(id)
            opportunities.push({
              id,
              platform: 'Stack Overflow',
              title: item.title,
              url: item.link,
              author: item.owner?.display_name ?? 'unknown',
              date: format(fromUnixTime(item.creation_date), 'yyyy-MM-dd'),
              score: item.score,
              snippet: item.tags?.join(', ') ?? '',
              keyword: kw.label,
              rationale: kw.rationale,
            })
          }
        })
        .catch(_err => { /* rate-limited or CORS — skip */ })

    // Hacker News — generous rate limits, fire immediately
    await fetch(
        `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&hitsPerPage=10`,
        { headers: { 'User-Agent': 'circle-developer-kit-radar/1.0' } }
      )
        .then(r => r.json())
        .then(d => {
          for (const item of d.hits ?? []) {
            const id = `hn-${item.objectID}`
            if (seen.has(id)) continue
            const dateStr: string = (item.created_at ?? '').slice(0, 10)
            if (!dateStr || dateStr < cutoff) continue
            const combined = `${item.title ?? ''} ${item.url ?? ''}`
            if (!isBlockchainContent(combined)) continue
            if (isAlreadyAware(combined)) continue
            seen.add(id)
            opportunities.push({
              id,
              platform: 'Hacker News',
              title: item.title ?? '(no title)',
              url: item.url ?? `https://news.ycombinator.com/item?id=${item.objectID}`,
              author: item.author ?? 'unknown',
              date: dateStr,
              score: item.points ?? 0,
              snippet: '',
              keyword: kw.label,
              rationale: kw.rationale,
            })
          }
        })
        .catch(() => {})

    // GitHub Issues — stagger after HN
    if (!hasGhToken) await sleep(1500)
    await fetch(
        `https://api.github.com/search/issues?q=${encodeURIComponent(q)}+is:open+is:issue&sort=created&order=desc&per_page=10`,
        { headers: githubHeaders() }
      )
        .then(r => r.json())
        .then(d => {
          for (const item of d.items ?? []) {
            const id = `gh-${item.id}`
            if (seen.has(id)) continue
            if (item.created_at.slice(0, 10) < cutoff) continue
            if (isDependencyBump(item.title)) continue
            const combined = `${item.title} ${item.body ?? ''}`
            if (!isBlockchainContent(combined)) continue
            if (isAlreadyAware(combined)) continue
            seen.add(id)
            opportunities.push({
              id,
              platform: 'GitHub',
              title: item.title,
              url: item.html_url,
              author: item.user?.login ?? 'unknown',
              date: item.created_at.slice(0, 10),
              score: item.reactions?.['+1'] ?? 0,
              snippet: item.body ? item.body.replace(/<!--[\s\S]*?-->/g, '').replace(/\n+/g, ' ').trim().slice(0, 200) : '',
              keyword: kw.label,
              rationale: kw.rationale,
            })
          }
        })
        .catch(() => {})
  }

  // Sort by score desc (highest reach first), then date desc
  return opportunities.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.date.localeCompare(a.date)
  })
}

// ─── Platform summary builder ─────────────────────────────────────────────────

export function buildPlatformSummaries(current: Mention[], previous: Mention[]): PlatformSummary[] {
  const platforms: Array<{ platform: Platform; color: string }> = [
    { platform: 'GitHub',         color: '#6ee7b7' },
    { platform: 'Reddit',         color: '#fb923c' },
    { platform: 'Stack Overflow', color: '#f59e0b' },
    { platform: 'Web Articles',   color: '#818cf8' },
    { platform: 'Medium',         color: '#38bdf8' },
    { platform: 'Dev.to',         color: '#e879f9' },
    { platform: 'Hacker News',    color: '#f97316' },
  ]

  return platforms.map(({ platform, color }) => {
    const cur = current.filter(m => m.platform === platform).length
    const prev = previous.filter(m => m.platform === platform).length
    const change = prev === 0 ? 100 : Math.round(((cur - prev) / prev) * 100)
    return { platform, total: cur, change, color }
  })
}
