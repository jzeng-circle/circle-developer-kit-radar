import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle } from 'lucide-react'
import type { SourceStatuses, SourceStatus, SourceErrors } from '../data/useData'

const LABELS: Record<keyof SourceStatuses, string> = {
  github: 'GitHub',
  reddit: 'Reddit',
  devto: 'Dev.to',
  stackoverflow: 'Stack Overflow',
  npm: 'npm',
  news: 'News',
  hackernews: 'Hacker News',
  medium: 'Medium',
  webarticles: 'Web Articles',
}

function displayStatus(status: SourceStatus): 'loading' | 'live' | 'error' {
  if (status === 'none') return 'live'
  return status
}

const STATUS_STYLES: Record<'loading' | 'live' | 'error', string> = {
  loading: 'bg-gray-800 text-gray-500 border-gray-700',
  live:    'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
  error:   'bg-red-900/20 text-red-400 border-red-700/30',
}

const STATUS_DOT: Record<'loading' | 'live' | 'error', string> = {
  loading: 'bg-gray-500 animate-pulse',
  live:    'bg-emerald-400',
  error:   'bg-red-400',
}

const STATUS_LABEL: Record<'loading' | 'live' | 'error', string> = {
  loading: 'fetching',
  live:    'live',
  error:   'error',
}

interface PopoverPos { top: number; left: number }

interface Props {
  sources: SourceStatuses
  enabled: Set<keyof SourceStatuses>
  onToggle: (key: keyof SourceStatuses) => void
  sourceErrors?: SourceErrors
}

export default function SourceBadges({ sources, enabled, onToggle, sourceErrors = {} }: Props) {
  const [openError, setOpenError] = useState<keyof SourceStatuses | null>(null)
  const [popoverPos, setPopoverPos] = useState<PopoverPos>({ top: 0, left: 0 })
  const popoverRef = useRef<HTMLDivElement>(null)

  const handleBadgeClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, key: keyof SourceStatuses) => {
    e.stopPropagation()
    if (openError === key) { setOpenError(null); return }
    const rect = e.currentTarget.getBoundingClientRect()
    setPopoverPos({ top: rect.bottom + 8, left: rect.left })
    setOpenError(key)
  }, [openError])

  // Close on outside click or scroll
  useEffect(() => {
    if (!openError) return
    function close() { setOpenError(null) }
    document.addEventListener('mousedown', (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) close()
    })
    window.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('mousedown', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [openError])

  const openErrorMsg = openError ? sourceErrors[openError] : null

  return (
    <>
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-600 mr-1">Sources:</span>
        {(Object.keys(sources) as (keyof SourceStatuses)[]).map(key => {
          const status = sources[key]
          const display = displayStatus(status)
          const isEnabled = enabled.has(key)
          const hasError = display === 'error' && !!sourceErrors[key]

          return (
            <button
              key={key}
              onClick={e => {
                if (hasError) {
                  handleBadgeClick(e, key)
                } else {
                  onToggle(key)
                }
              }}
              title={hasError ? 'Click to see error details' : isEnabled ? 'Click to disable' : 'Click to enable'}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all ${
                isEnabled
                  ? STATUS_STYLES[display]
                  : 'bg-gray-900 text-gray-600 border-gray-800 opacity-50'
              }`}
            >
              {hasError ? (
                <AlertCircle size={10} className="text-red-400 flex-shrink-0" />
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEnabled ? STATUS_DOT[display] : 'bg-gray-700'}`} />
              )}
              {LABELS[key]}
              <span className="opacity-60">· {isEnabled ? STATUS_LABEL[display] : 'off'}</span>
            </button>
          )
        })}
      </div>

      {/* Error popover — rendered in a portal so it escapes any overflow:hidden parent */}
      {openError && openErrorMsg && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: popoverPos.top, left: popoverPos.left, zIndex: 9999 }}
          className="w-80 bg-gray-900 border border-red-800/60 rounded-lg shadow-2xl p-3"
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-red-400 mb-1">{LABELS[openError]} — fetch error</p>
              <p className="text-xs text-gray-300 leading-relaxed">{openErrorMsg}</p>
              <button
                onClick={e => { e.stopPropagation(); onToggle(openError); setOpenError(null) }}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300 underline"
              >
                Disable this source
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
