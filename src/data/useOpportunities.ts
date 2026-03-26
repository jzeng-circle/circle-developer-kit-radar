import { useState, useEffect, useCallback } from 'react'
import { fetchOpportunities, type Opportunity } from './fetchers'
import type { ProductConfig } from './searchConfig'

export type { Opportunity }

export interface OpportunitiesData {
  opportunities: Opportunity[]
  status: 'idle' | 'loading' | 'done' | 'error'
  lastRefreshed: Date | null
}

const PRESET_DAYS: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '180d': 180, '1y': 365 }

function parseDays(range: string): number {
  if (PRESET_DAYS[range]) return PRESET_DAYS[range]
  const n = parseInt(range, 10)
  return isNaN(n) ? 30 : n
}

export function useOpportunities(range: string, product: ProductConfig) {
  const days = parseDays(range)
  const [data, setData] = useState<OpportunitiesData>({
    opportunities: [],
    status: 'idle',
    lastRefreshed: null,
  })

  const load = useCallback(async () => {
    setData(prev => ({ ...prev, status: 'loading' }))
    try {
      const opportunities = await fetchOpportunities(
        product.opportunityKeywords,
        product.relevanceTerms,
        days
      )
      setData({ opportunities, status: 'done', lastRefreshed: new Date() })
    } catch {
      setData(prev => ({ ...prev, status: 'error' }))
    }
  }, [days, product])

  useEffect(() => { load() }, [load])

  return { data, reload: load }
}
