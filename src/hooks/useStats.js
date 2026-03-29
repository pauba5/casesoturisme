import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook per obtenir les estadístiques agregades des de Supabase.
 * Taula: stats_historiques
 * Retorna totes les files ordenades per data (per gràfics d'evolució)
 * i l'última fila per als KPIs del hero.
 */
export function useStats() {
  const [stats, setStats] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data, error } = await supabase
          .from('stats_historiques')
          .select('*')
          .order('data_captura', { ascending: true })

        if (error) throw error

        setStats(data || [])
        setLatest(data && data.length > 0 ? data[data.length - 1] : null)
      } catch (err) {
        setError(err.message)
        console.error('Error carregant stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, latest, loading, error }
}
