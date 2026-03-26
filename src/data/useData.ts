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

export interface DashboardData {
  mentions: Mention[]
  trendData: DailyCount[]
  npmData: NpmDownload[]
  platformSummaries: { platform: string; total: number; change: number; color: string }[]
  topRepos: { name: string; stars: number; description: string; url?: string }[]
  sentimentData: { name: string; value: number; color: string }[]
  totalMentions: number
  totalChange: number
  npmDownloads: number
  npmChange: number
  sources: SourceStatuses
  lastRefreshed: Date | null
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
    lastRefreshed: null,
  }))

  const load = useCallback(async () => {
    // Apply this product's search config and relevance terms before fetching
    setSearchConfig(product.searchConfig, product.relevanceTerms)

    // Reset to loading state, keep current data visible
    setData(prev => ({
      ...prev,
      sources: { github: 'loading', reddit: 'loading', devto: 'loading', stackoverflow: 'loading', npm: 'loading', news: 'loading', hackernews: 'loading', medium: 'loading', webarticles: 'loading' },
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

    if (ghResult.status === 'fulfilled' && ghResult.value.length > 0) {
      liveMentions.push(...ghResult.value)
      sources.github = 'live'
    } else {
      sources.github = ghResult.status === 'rejected' ? 'error' : 'none'
    }

    // GitHub Commits — merged into github source status (same badge)
    if (ghCommitsResult.status === 'fulfilled' && ghCommitsResult.value.length > 0) {
      liveMentions.push(...ghCommitsResult.value)
      sources.github = 'live'
    }

    if (rdResult.status === 'fulfilled' && rdResult.value.length > 0) {
      liveMentions.push(...rdResult.value)
      sources.reddit = 'live'
    } else {
      sources.reddit = rdResult.status === 'rejected' ? 'error' : 'none'
    }

    if (dtResult.status === 'fulfilled' && dtResult.value.length > 0) {
      liveMentions.push(...dtResult.value)
      sources.devto = 'live'
    } else {
      sources.devto = dtResult.status === 'rejected' ? 'error' : 'none'
    }

    // Stack Overflow — no mock fallback: product is new, zero real results is the truth
    if (soResult.status === 'fulfilled' && soResult.value.length > 0) {
      liveMentions.push(...soResult.value)
      sources.stackoverflow = 'live'
    } else {
      sources.stackoverflow = soResult.status === 'rejected' ? 'error' : 'none'
    }

    // News / Web Articles — key-gated; show 'none' rather than injecting mock articles with broken URLs
    if (newsResult.status === 'fulfilled' && newsResult.value.length > 0) {
      liveMentions.push(...newsResult.value)
      sources.news = 'live'
    } else {
      sources.news = newsResult.status === 'rejected' ? 'error' : 'none'
    }

    // Google CSE — key-gated; catches Binance Square, blogs, press releases
    if (cseResult.status === 'fulfilled' && cseResult.value.length > 0) {
      liveMentions.push(...cseResult.value)
      sources.webarticles = 'live'
    } else {
      sources.webarticles = cseResult.status === 'rejected' ? 'error' : 'none'
    }

    // Hacker News — Algolia API, no key required
    if (hnResult.status === 'fulfilled' && hnResult.value.length > 0) {
      liveMentions.push(...hnResult.value)
      sources.hackernews = 'live'
    } else {
      sources.hackernews = hnResult.status === 'rejected' ? 'error' : 'none'
    }

    // Medium — tag RSS via proxy; 0 results expected for new products
    if (mdResult.status === 'fulfilled' && mdResult.value.length > 0) {
      liveMentions.push(...mdResult.value)
      sources.medium = 'live'
    } else {
      sources.medium = mdResult.status === 'rejected' ? 'error' : 'none'
    }

    // npm downloads
    let npmData: NpmDownload[] = []
    if (npmResult.status === 'fulfilled' && npmResult.value.length > 0) {
      npmData = npmResult.value
      sources.npm = 'live'
    } else {
      sources.npm = npmResult.status === 'rejected' ? 'error' : 'none'
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
      lastRefreshed: new Date(),
    })
  }, [days, product, enabledSources])

  useEffect(() => { load() }, [load])

  return { data, reload: load }
}
