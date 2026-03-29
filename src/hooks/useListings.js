import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook per carregar els listings del mapa des de Supabase.
 * Suporta filtratge per distrito, tipus i status.
 */
export function useListings(filters = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('listings')
        .select('id, latitude, longitude, status, reason, tipus_abdt, name, address, host_name, host_listings_count, url, rtc, places, district', { count: 'exact' })

      // Aplicar filtres
      if (filters.districts && filters.districts.length > 0) {
        query = query.in('district', filters.districts)
      }
      if (filters.types && filters.types.length > 0) {
        query = query.in('tipus_abdt', filters.types)
      }
      if (filters.statuses && filters.statuses.length > 0) {
        query = query.in('status', filters.statuses)
      }

      const { data, error, count } = await query

      if (error) throw error

      setListings(data || [])
      setTotal(count || 0)
    } catch (err) {
      setError(err.message)
      console.error('Error carregant listings:', err)
    } finally {
      setLoading(false)
    }
  }, [
    JSON.stringify(filters.districts),
    JSON.stringify(filters.types),
    JSON.stringify(filters.statuses),
  ])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  return { listings, loading, error, total, refetch: fetchListings }
}

/**
 * Hook per obtenir els valors únics per als filtres (districtes, tipologies, status).
 */
export function useListingFilters() {
  const [districts, setDistricts] = useState([])
  const [types, setTypes] = useState([])
  const [statuses, setStatuses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFilters() {
      try {
        const { data } = await supabase
          .from('listings')
          .select('district, tipus_abdt, status')

        if (data) {
          setDistricts([...new Set(data.map(d => d.district).filter(Boolean))].sort())
          setTypes([...new Set(data.map(d => d.tipus_abdt).filter(Boolean))].sort())
          setStatuses([...new Set(data.map(d => d.status).filter(Boolean))].sort())
        }
      } catch (err) {
        console.error('Error carregant filtres:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFilters()
  }, [])

  return { districts, types, statuses, loading }
}
