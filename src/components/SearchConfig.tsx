import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Search, Package, Plus, Trash2, Check, X, Pencil } from 'lucide-react'
import { type SourceConfig, type QueryDef, type ProductConfig } from '../data/searchConfig'
import { setSearchConfig } from '../data/fetchers'

interface Props {
  product: ProductConfig
  onApply: () => void  // triggers a data reload after config change
}

export default function SearchConfig({ product, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [config, setConfig] = useState<SourceConfig[]>(() =>
    JSON.parse(JSON.stringify(product.searchConfig)) // deep clone
  )
  const [dirty, setDirty] = useState(false)
  // editingKey = `${sourceIndex}-${queryId}` | null
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  // addingSource = source name when the add-row input is open
  const [addingSource, setAddingSource] = useState<string | null>(null)
  const [addValue, setAddValue] = useState('')

  // When the product switches, reset the config to the new product's defaults
  useEffect(() => {
    setConfig(JSON.parse(JSON.stringify(product.searchConfig)))
    setDirty(false)
    setEditingKey(null)
    setAddingSource(null)
  }, [product.id])

  const totalTerms = config.reduce((n, s) => n + s.queries.length + (s.packages?.length ?? 0), 0)

  function mutate(fn: (draft: SourceConfig[]) => void) {
    setConfig(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      fn(next)
      return next
    })
    setDirty(true)
  }

  // ── edit existing query ──────────────────────────────────────────────────
  function startEdit(sourceIdx: number, q: QueryDef) {
    setEditingKey(`${sourceIdx}-${q.id}`)
    setEditValue(q.label)
  }

  function commitEdit(sourceIdx: number, queryId: string) {
    const val = editValue.trim()
    if (!val) return cancelEdit()
    mutate(draft => {
      const q = draft[sourceIdx].queries.find(q => q.id === queryId)
      if (q) q.label = val
    })
    cancelEdit()
  }

  function cancelEdit() {
    setEditingKey(null)
    setEditValue('')
  }

  // ── delete query ─────────────────────────────────────────────────────────
  function deleteQuery(sourceIdx: number, queryId: string) {
    mutate(draft => {
      draft[sourceIdx].queries = draft[sourceIdx].queries.filter(q => q.id !== queryId)
    })
  }

  // ── add new query ─────────────────────────────────────────────────────────
  function startAdd(source: string) {
    setAddingSource(source)
    setAddValue('')
  }

  function commitAdd(sourceIdx: number) {
    const val = addValue.trim()
    if (!val) { cancelAdd(); return }
    mutate(draft => {
      const id = `custom-${Date.now()}`
      draft[sourceIdx].queries.push({ id, label: val })
    })
    cancelAdd()
  }

  function cancelAdd() {
    setAddingSource(null)
    setAddValue('')
  }

  // ── apply / reset ─────────────────────────────────────────────────────────
  function apply() {
    setSearchConfig(config, product.relevanceTerms)
    setDirty(false)
    onApply()
  }

  function reset() {
    const defaults = product.searchConfig
    setConfig(JSON.parse(JSON.stringify(defaults)))
    setSearchConfig(defaults, product.relevanceTerms)
    setDirty(false)
    setEditingKey(null)
    setAddingSource(null)
  }

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Toggle row */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/60 hover:bg-gray-800/60 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Search size={13} className="text-indigo-400" />
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-widest">
            Search Keywords
          </span>
          <span className="text-xs text-gray-500 ml-1">
            — {totalTerms} terms across {config.length} sources
          </span>
          {dirty && (
            <span className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 px-1.5 py-0.5 rounded-full ml-1">
              unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {dirty && (
            <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
              <button
                onClick={reset}
                className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
              <button
                onClick={apply}
                className="text-xs text-white px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1"
              >
                <Check size={11} /> Apply & Refresh
              </button>
            </div>
          )}
          {open
            ? <ChevronDown size={14} className="text-gray-500" />
            : <ChevronRight size={14} className="text-gray-500" />
          }
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="px-4 py-4 bg-gray-950/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {config.map((source, sourceIdx) => (
            <div key={source.source}>
              <p className="text-xs font-semibold text-gray-400 mb-2">{source.source}</p>
              <div className="space-y-1.5">

                {/* Existing queries */}
                {source.queries.map(q => {
                  const key = `${sourceIdx}-${q.id}`
                  const isEditing = editingKey === key
                  return (
                    <div key={q.id}>
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            autoFocus
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') commitEdit(sourceIdx, q.id)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                            className="flex-1 bg-gray-800 border border-indigo-500 rounded-md px-2 py-1 text-xs text-indigo-200 outline-none font-mono"
                          />
                          <button onClick={() => commitEdit(sourceIdx, q.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                            <Check size={12} />
                          </button>
                          <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-300 p-1">
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="group flex items-center gap-1 bg-gray-800/60 border border-gray-700/50 rounded-md px-2.5 py-1.5">
                          <Search size={10} className="text-indigo-400 flex-shrink-0" />
                          <code className="flex-1 text-xs text-indigo-200 break-all leading-relaxed">{q.label}</code>
                          <button
                            onClick={() => startEdit(sourceIdx, q)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 p-0.5 transition-opacity"
                          >
                            <Pencil size={10} />
                          </button>
                          <button
                            onClick={() => deleteQuery(sourceIdx, q.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 p-0.5 transition-opacity"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* npm packages (read-only display) */}
                {source.packages?.map(pkg => (
                  <div key={pkg} className="flex items-center gap-1.5 bg-emerald-900/20 border border-emerald-700/30 rounded-md px-2.5 py-1.5">
                    <Package size={10} className="text-emerald-400 flex-shrink-0" />
                    <code className="flex-1 text-xs text-emerald-300 break-all leading-relaxed">{pkg}</code>
                  </div>
                ))}

                {/* Add new query row */}
                {addingSource === source.source ? (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      placeholder='e.g. "Bridge Kit" circle'
                      value={addValue}
                      onChange={e => setAddValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitAdd(sourceIdx)
                        if (e.key === 'Escape') cancelAdd()
                      }}
                      className="flex-1 bg-gray-800 border border-indigo-500 rounded-md px-2 py-1 text-xs text-indigo-200 outline-none font-mono placeholder-gray-600"
                    />
                    <button onClick={() => commitAdd(sourceIdx)} className="text-emerald-400 hover:text-emerald-300 p-1">
                      <Check size={12} />
                    </button>
                    <button onClick={cancelAdd} className="text-gray-500 hover:text-gray-300 p-1">
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  source.packages === undefined || source.queries.length >= 0 ? (
                    // Only show add button for text-query sources (not npm)
                    !source.packages?.length || source.queries.length > 0 ? (
                      source.source !== 'npm' && (
                        <button
                          onClick={() => startAdd(source.source)}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-400 transition-colors px-1 py-0.5"
                        >
                          <Plus size={11} /> add keyword
                        </button>
                      )
                    ) : null
                  ) : null
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
