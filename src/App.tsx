import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Zap, ChevronDown, Check, Radio, Target, Calendar } from 'lucide-react'
import SummaryBar from './components/SummaryBar'
import TrendChart from './components/TrendChart'
import PlatformChart from './components/PlatformChart'
import NpmChart from './components/NpmChart'
import MentionFeed from './components/MentionFeed'
import TopRepos from './components/TopRepos'
import SourceBadges from './components/SourceBadges'
import SearchConfig from './components/SearchConfig'
import OpportunityFeed from './components/OpportunityFeed'
import { useData, ALL_SOURCES } from './data/useData'
import type { SourceStatuses } from './data/useData'
import { useOpportunities } from './data/useOpportunities'
import { PRODUCTS } from './data/searchConfig'

type Mode = 'monitor' | 'outreach'

const PRESETS: { label: string; days: number }[] = [
  { label: '7d',  days: 7   },
  { label: '30d', days: 30  },
  { label: '90d', days: 90  },
  { label: '180d', days: 180 },
  { label: '1y',  days: 365 },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

// Bridge Kit publish date — earliest meaningful start date
const MIN_DATE = '2025-10-14'

export default function App() {
  const [days, setDays] = useState(30)
  const [customFrom, setCustomFrom] = useState('')   // 'yyyy-MM-dd' when set
  const [mode, setMode] = useState<Mode>('monitor')
  const [productId, setProductId] = useState(PRODUCTS[0].id)
  const [enabledSources, setEnabledSources] = useState<Set<keyof SourceStatuses>>(new Set(ALL_SOURCES))
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  // Derive effective days from custom date if set
  const effectiveDays = customFrom
    ? Math.max(1, Math.ceil((Date.now() - new Date(customFrom).getTime()) / 86400000))
    : days

  // Which preset is active (null if custom date is set)
  const activePreset = customFrom ? null : PRESETS.find(p => p.days === days) ?? null

  const product = PRODUCTS.find(p => p.id === productId)!
  const { data, reload } = useData(String(effectiveDays), product, enabledSources)
  const { data: oppData, reload: reloadOpportunities } = useOpportunities(String(effectiveDays), product)

  const isLoading = Object.values(data.sources).some(s => s === 'loading')

  // Close product dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function selectProduct(id: string) {
    setProductId(id)
    setDropdownOpen(false)
  }

  function toggleSource(key: keyof SourceStatuses) {
    setEnabledSources(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size === 1) return prev // keep at least one enabled
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function selectPreset(d: number) {
    setDays(d)
    setCustomFrom('')
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomFrom(e.target.value)
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] text-gray-100">
      {/* Full-screen loading overlay — blocks content until all sources resolve */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-logo">
              <Zap size={28} className="text-white" />
            </div>
            <p className="loading-title">Developer Kit Radar</p>
            <p className="loading-subtitle">Fetching data across sources…</p>
            <div className="loading-dots">
              <span /><span /><span /><span /><span />
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-none mb-1">Developer Kit Radar</p>
              {/* Product dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-white hover:text-indigo-300 transition-colors"
                >
                  {product.name}
                  <ChevronDown size={13} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-1.5 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-20 py-1 overflow-hidden">
                    {PRODUCTS.map(p => (
                      <button
                        key={p.id}
                        onClick={() => selectProduct(p.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-800 transition-colors"
                      >
                        <span className={p.id === productId ? 'text-indigo-300 font-medium' : 'text-gray-300'}>
                          {p.name}
                        </span>
                        {p.id === productId && <Check size={12} className="text-indigo-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode toggle — Outreach hidden until feature is ready */}
            <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setMode('monitor')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === 'monitor' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <Radio size={11} /> Monitor
              </button>
            </div>

            {/* Range selector */}
            <div className="flex items-center gap-1.5">
              <div className="flex bg-gray-800 rounded-lg p-0.5 gap-0.5">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    onClick={() => selectPreset(p.days)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      activePreset?.days === p.days ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              {/* Custom date-from picker */}
              <div className={`flex items-center gap-1.5 bg-gray-800 rounded-lg px-2 py-1.5 border transition-colors ${customFrom ? 'border-indigo-500' : 'border-transparent'}`}>
                <Calendar size={11} className={customFrom ? 'text-indigo-400' : 'text-gray-500'} />
                <input
                  ref={dateRef}
                  type="date"
                  value={customFrom}
                  min={MIN_DATE}
                  max={todayStr()}
                  onChange={handleDateChange}
                  className="bg-transparent text-xs text-gray-300 outline-none w-28 [color-scheme:dark]"
                  title="Custom start date"
                />
                {customFrom && (
                  <button
                    onClick={() => setCustomFrom('')}
                    className="text-gray-500 hover:text-gray-300 transition-colors text-xs leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={mode === 'monitor' ? reload : reloadOpportunities}
              disabled={mode === 'monitor' ? isLoading : oppData.status === 'loading'}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 bg-gray-800 px-2 py-1.5 rounded-md disabled:opacity-50 transition-colors"
            >
              <RefreshCw size={12} className={(mode === 'monitor' ? isLoading : oppData.status === 'loading') ? 'animate-spin' : ''} />
              {mode === 'monitor'
                ? (isLoading ? 'Fetching…' : data.lastRefreshed ? data.lastRefreshed.toLocaleTimeString() : 'Refresh')
                : (oppData.status === 'loading' ? 'Searching…' : oppData.lastRefreshed ? oppData.lastRefreshed.toLocaleTimeString() : 'Refresh')
              }
            </button>
          </div>
        </div>

        {mode === 'monitor' && (
          <div className="max-w-screen-xl mx-auto px-6 pb-2">
            <SourceBadges sources={data.sources} enabled={enabledSources} onToggle={toggleSource} />
          </div>
        )}
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6 space-y-5">
        {mode === 'monitor' ? (
          <>
            <SearchConfig product={product} onApply={reload} />

            <SummaryBar
              totalMentions={data.totalMentions}
              totalChange={data.totalChange}
              npmDownloads={data.npmDownloads}
              npmChange={data.npmChange}
              platformSummaries={data.platformSummaries}
              sources={data.sources}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <TrendChart data={data.trendData} />
              </div>
              <NpmChart
                data={data.npmData}
                packageName={product.searchConfig.find(s => s.source === 'npm')?.packages?.[0] ?? 'npm'}
              />
            </div>

            <PlatformChart platformSummaries={data.platformSummaries} sentimentData={data.sentimentData} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <MentionFeed mentions={data.mentions} isLoading={isLoading} />
              </div>
              <TopRepos repos={data.topRepos} isLoading={isLoading} />
            </div>
          </>
        ) : (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
            <OpportunityFeed
              opportunities={oppData.opportunities}
              keywords={product.opportunityKeywords}
              status={oppData.status}
              productName={product.name}
              onReload={reloadOpportunities}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-800 mt-8">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Sources: GitHub · Reddit · Dev.to · Stack Overflow · Hacker News · Medium · npm · Web Articles
          </p>
          <p className="text-xs text-gray-600">
            Add <code className="bg-gray-800 px-1 rounded">VITE_GOOGLE_CSE_KEY</code> + <code className="bg-gray-800 px-1 rounded">VITE_GOOGLE_CSE_ID</code> in <code className="bg-gray-800 px-1 rounded">.env</code> for web coverage
          </p>
        </div>
      </footer>
    </div>
  )
}
