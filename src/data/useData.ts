import { useState, useEffect, useCallback } from 'react'
import {
  setSearchConfig,
  fetchGitHubMentions,
  fetchGitHubCommits,
  fetchGitHubRepos,
  fetchRedditMentions,
  fetchDevToMentions,
  fetchStackOverflowMentions,
  fetchNpmDownloads,
  fetchNewsArticles,
  fetchGoogleCSEMentions,
  fetchHackerNewsMentions,
  fetchMediumMentions,
  buildTrendData,
  buildPlatformSummaries,
} from './fetchers'
import {
  type Mention,
  type NpmDownload,
  type DailyCount,
  type PlatformSummary,
} from './mockData'
import { type ProductConfig } from './searchConfig'

export type SourceStatus = 'loading' | 'live' | 'error' | 'none'

export interface SourceStatuses {
  github: SourceStatus
  reddit: SourceStatus
  devto: SourceStatus
  stackoverflow: SourceStatus
  npm: SourceStatus
  news: SourceStatus
  hackernews: SourceStatus
  medium: SourceStatus
  webarticles: SourceStatus
}

export type SourceErrors = Partial<Record<keyof SourceStatuses, string>>

export interface DashboardData {
  mentions: Mention[]
  trendData: DailyCount[]
  npmData: NpmDownload[]
  platformSummaries: PlatformSummary[]
  topRepos: { name: string; stars: number; description: string; url?: string }[]
  sentimentData: { name: string; value: number; color: string }[]
  totalMentions: number
  totalChange: number
  npmDownloads: number
  npmChange: number
  sources: SourceStatuses
  sourceErrors: SourceErrors
  lastRefreshed: Date | null
}

function summariseError(reason: unknown): string {
  if (!reason) return 'Unknown error'
  const msg = reason instanceof Error ? reason.message : String(reason)
  // Pass through already-descriptive messages from the fetchers directly
  if (/not configured/i.test(msg)) return msg
  if (/rss2json/i.test(msg)) return `Medium RSS proxy error — ${msg}`
  if (/403/.test(msg) || /rate limit/i.test(msg)) return 'Rate limit hit (403) — too many requests. Add a token or wait a minute.'
  if (/429/.test(msg)) return 'Too many requests (429) — API rate limit exceeded.'
  if (/CORS/i.test(msg) || /ERR_FAILED/.test(msg) || /rate limit.*CORS/i.test(msg)) return 'Rate limit (429) — API blocked response, no CORS headers returned.'
  if (/401/.test(msg)) return 'Unauthorized (401) — invalid or missing API token.'
  if (/404/.test(msg)) return 'Not found (404) — endpoint or resource does not exist.'
  if (/5\d\d/.test(msg)) return `Server error — the API returned ${msg.match(/5\d\d/)?.[0] ?? '5xx'}.`
  if (/network/i.test(msg) || /Failed to fetch/i.test(msg)) return 'Network error — check internet connection or CORS policy.'
  return msg.slice(0, 120)
}

const PRESET_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '180d': 180, '1y': 365 }

function parseDays(range: string): number {
  if (PRESET_DAYS[range]) return PRESET_DAYS[range]
  const n = parseInt(range, 10)
  return isNaN(n) ? 30 : n
}

function computeSentiment(mentions: Mention[]) {
  const counts = { positive: 0, neutral: 0, negative: 0 }
  for (const m of mentions) counts[m.sentiment]++
  const total = mentions.length || 1
  return [
    { name: 'Positive', value: Math.round((counts.positive / total) * 100), color: '#4ade80' },
    { name: 'Neutral',  value: Math.round((counts.neutral  / total) * 100), color: '#94a3b8' },
    { name: 'Negative', value: Math.round((counts.negative / total) * 100), color: '#f87171' },
  ]
}

export const ALL_SOURCES = new Set<keyof SourceStatuses>([
  'github', 'reddit', 'devto', 'stackoverflow', 'npm', 'news', 'hackernews', 'medium', 'webarticles'
])

export function useData(range: string, product: ProductConfig, enabledSources: Set<keyof SourceStatuses> = ALL_SOURCES) {
  const days = parseDays(range)
  const [data, setData] = useState<DashboardData>(() => ({
    mentions: [],
    trendData: [],
    npmData: [],
    platformSummaries: [],
    topRepos: [],
    sentimentData: [],
    totalMentions: 0,
    totalChange: 0,
    npmDownloads: 0,
    npmChange: 0,
    sources: { github: 'loading', reddit: 'loading', devto: 'loading', stackoverflow: 'loading', npm: 'loading', news: 'loading', hackernews: 'loading', medium: 'loading', webarticles: 'loading' },
    sourceErrors: {},
    lastRefreshed: null,
  }))

  const load = useCallback(async () => {
    // Apply this product's search config and relevance terms before fetching
    setSearchConfig(product.searchConfig, product.relevanceTerms)

    // Reset to loading state, keep current data visible
    setData(prev => ({
      ...prev,
      sources: { github: 'loading', reddit: 'loading', devto: 'loading', stackoverflow: 'loading', npm: 'loading', news: 'loading', hackernews: 'loading', medium: 'loading', webarticles: 'loading' },
      sourceErrors: {},
    }))

    const on = enabledSources
    const empty: Promise<Mention[]> = Promise.resolve([])
    const emptyNpm: Promise<NpmDownload[]> = Promise.resolve([])

    // Fire all fetches in parallel — skip disabled sources
    const [ghResult, ghCommitsResult, rdResult, dtResult, soResult, npmResult, newsResult, cseResult, hnResult, mdResult, reposResult] = await Promise.allSettled([
      on.has('github')       ? fetchGitHubMentions(days)              : empty,
      on.has('github')       ? fetchGitHubCommits(days)               : empty,
      on.has('reddit')       ? fetchRedditMentions(days)              : empty,
      on.has('devto')        ? fetchDevToMentions(days)               : empty,
      on.has('stackoverflow')? fetchStackOverflowMentions(days)       : empty,
      on.has('npm')          ? fetchNpmDownloads(Math.ceil(days / 7)) : emptyNpm,
      on.has('news')         ? fetchNewsArticles(days)                : empty,
      on.has('webarticles')  ? fetchGoogleCSEMentions(days)           : empty,
      on.has('hackernews')   ? fetchHackerNewsMentions(days)          : empty,
      on.has('medium')       ? fetchMediumMentions(days)              : empty,
      on.has('github')       ? fetchGitHubRepos()                     : Promise.resolve([]),
    ])

    // Merge live mention results
    const liveMentions: Mention[] = []
    const sources: SourceStatuses = { github: 'none', reddit: 'none', devto: 'none', stackoverflow: 'none', npm: 'none', news: 'none', hackernews: 'none', medium: 'none', webarticles: 'none' }
    const sourceErrors: SourceErrors = {}

    function applyResult<T extends Mention[]>(
      result: PromiseSettledResult<T>,
      key: keyof SourceStatuses,
      onSuccess: (v: T) => void
    ) {
      if (result.status === 'fulfilled') {
        if (result.value.length > 0) { onSuccess(result.value); sources[key] = 'live' }
        // else stays 'none'
      } else {
        sources[key] = 'error'
        sourceErrors[key] = summariseError(result.reason)
      }
    }

    applyResult(ghResult, 'github', v => liveMentions.push(...v))

    // GitHub Commits — merged into github badge
    if (ghCommitsResult.status === 'fulfilled' && ghCommitsResult.value.length > 0) {
      liveMentions.push(...ghCommitsResult.value)
      sources.github = 'live'
    } else if (ghCommitsResult.status === 'rejected' && sources.github !== 'live') {
      sources.github = 'error'
      sourceErrors.github = summariseError(ghCommitsResult.reason)
    }

    applyResult(rdResult, 'reddit', v => liveMentions.push(...v))
    applyResult(dtResult, 'devto', v => liveMentions.push(...v))
    applyResult(soResult, 'stackoverflow', v => liveMentions.push(...v))
    applyResult(newsResult, 'news', v => liveMentions.push(...v))
    applyResult(cseResult, 'webarticles', v => liveMentions.push(...v))
    applyResult(hnResult, 'hackernews', v => liveMentions.push(...v))
    applyResult(mdResult, 'medium', v => liveMentions.push(...v))

    // npm downloads
    let npmData: NpmDownload[] = []
    if (npmResult.status === 'fulfilled' && npmResult.value.length > 0) {
      npmData = npmResult.value
      sources.npm = 'live'
    } else if (npmResult.status === 'rejected') {
      sources.npm = 'error'
      sourceErrors.npm = summariseError(npmResult.reason)
    }

    // Top repos
    const topRepos = (reposResult.status === 'fulfilled' && reposResult.value.length > 0)
      ? reposResult.value
      : []

    // Sort all mentions by date desc
    const allMentions = liveMentions.sort((a, b) => b.date.localeCompare(a.date))

    // Build previous period mentions for % change (just halve the live count as approximation when data is live)
    const prevHalfMentions = allMentions.slice(Math.floor(allMentions.length / 2))
    const platformSummaries = buildPlatformSummaries(allMentions, prevHalfMentions)

    const totalMentions = allMentions.length
    const prevTotal = prevHalfMentions.length
    const totalChange = prevTotal === 0 ? 0 : Math.round(((totalMentions - prevTotal) / prevTotal) * 100)

    const npmDownloads = npmData.reduce((s, d) => s + d.downloads, 0)
    const npmChange = npmData.length >= 2
      ? Math.round(((npmData[npmData.length - 1].downloads - npmData[0].downloads) / (npmData[0].downloads || 1)) * 100)
      : 0

    setData({
      mentions: allMentions,
      trendData: buildTrendData(allMentions, days),
      npmData,
      platformSummaries,
      topRepos,
      sentimentData: computeSentiment(allMentions),
      totalMentions,
      totalChange,
      npmDownloads,
      npmChange,
      sources,
      sourceErrors,
      lastRefreshed: new Date(),
    })
  }, [days, product, enabledSources])

  useEffect(() => { load() }, [load])

  return { data, reload: load }
}
