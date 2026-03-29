import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { useListings, useListingFilters } from '../hooks/useListings'
import FilterPanel from '../components/Map/FilterPanel'
import styles from './Mapa.module.css'

// Fix leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const COLOR_MAP = {
  'Llicència vàlida': '#16a34a',
  'No necessita llicència': '#ea580c',
}
const DEFAULT_COLOR = '#dc2626'

function getColor(listing) {
  return COLOR_MAP[listing.status] || DEFAULT_COLOR
}

function createIcon(color) {
  return L.divIcon({
    className: 'custom-icon',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="${color}" viewBox="0 0 16 16">
      <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/>
    </svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  })
}

function getClusterIcon(cluster) {
  const count = cluster.getChildCount()
  let cls = 'marker-cluster-small'
  if (count >= 500) cls = 'marker-cluster-large'
  else if (count >= 100) cls = 'marker-cluster-medium'
  return L.divIcon({
    html: `<div><span>${count}</span></div>`,
    className: `marker-cluster ${cls}`,
    iconSize: L.point(40, 40),
  })
}

// Component intern per gestionar els markers (necessita accés a useMap)
function MarkerLayer({ listings }) {
  const map = useMap()

  useEffect(() => {
    const group = L.markerClusterGroup({ iconCreateFunction: getClusterIcon })

    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return
      const color = getColor(listing)
      const marker = L.marker([listing.latitude, listing.longitude], { icon: createIcon(color) })

      const popup = `
        <div style="font-size:12px;line-height:1.4;max-width:240px;">
          <strong style="font-size:13px;">${listing.tipus_abdt || ''}: ${
            listing.name
              ? `<a href="${listing.url}" target="_blank" rel="noopener noreferrer">${listing.name}</a>`
              : '—'
          }</strong>
          ${listing.address ? `<p style="margin:4px 0"><b>Adreça:</b> ${listing.address}</p>` : ''}
          ${listing.host_name ? `<p style="margin:4px 0"><em>${listing.host_name}</em></p>` : ''}
          ${listing.host_listings_count ? `<p style="margin:4px 0"><b>Allotjaments del amfitrió:</b> ${listing.host_listings_count}</p>` : ''}
          <p style="margin:4px 0"><b>Status:</b> ${listing.status || '—'}</p>
          <p style="margin:4px 0"><b>Raó:</b> ${listing.reason || '—'}</p>
          <p style="margin:4px 0"><b>Llicència:</b> ${listing.rtc || 'No especificada'}</p>
          <p style="margin:4px 0"><b>Places:</b> ${listing.places || '—'}</p>
          ${listing.url ? `<p style="margin:4px 0"><a href="${listing.url}" target="_blank" rel="noopener noreferrer">Veure a Airbnb →</a></p>` : ''}
        </div>
      `
      marker.bindPopup(popup)
      group.addLayer(marker)
    })

    map.addLayer(group)

    // Llegenda
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend')
      div.innerHTML = `
        <div class="map-legend-item"><svg width="14" height="14" fill="#dc2626" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/></svg> Sense llicència vàlida</div>
        <div class="map-legend-item"><svg width="14" height="14" fill="#16a34a" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/></svg> Llicència vàlida</div>
        <div class="map-legend-item"><svg width="14" height="14" fill="#ea580c" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/></svg> No necessita llicència</div>
      `
      return div
    }
    legend.addTo(map)

    return () => {
      map.removeLayer(group)
      legend.remove()
    }
  }, [listings, map])

  return null
}

export default function Mapa() {
  const [filterOpen, setFilterOpen] = useState(false)
  const { districts, types, statuses, loading: filtersLoading } = useListingFilters()

  const [selected, setSelected] = useState({
    districts: [],
    types: [],
    statuses: [],
  })

  // Inicialitza els filtres amb tots els valors seleccionats un cop carregats
  useEffect(() => {
    if (!filtersLoading) {
      setSelected({ districts, types, statuses })
    }
  }, [filtersLoading])

  const filters = useMemo(() => ({
    districts: selected.districts.length < districts.length ? selected.districts : [],
    types: selected.types.length < types.length ? selected.types : [],
    statuses: selected.statuses.length < statuses.length ? selected.statuses : [],
  }), [selected, districts, types, statuses])

  const { listings, loading, total } = useListings(filters)

  const toggleItem = useCallback((category, value) => {
    setSelected(prev => {
      const current = prev[category]
      const next = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value]
      return { ...prev, [category]: next }
    })
  }, [])

  const selectAll = useCallback((category, allValues) => {
    setSelected(prev => ({ ...prev, [category]: allValues }))
  }, [])

  const deselectAll = useCallback((category) => {
    setSelected(prev => ({ ...prev, [category]: [] }))
  }, [])

  return (
    <div className={styles.page}>
      {/* Sidebar filtres — desktop */}
      <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>🔍 Filtres</h2>
          <button className={styles.closeBtn} onClick={() => setFilterOpen(false)} aria-label="Tanca filtres">✕</button>
        </div>
        {!filtersLoading && (
          <FilterPanel
            districts={districts}
            types={types}
            statuses={statuses}
            selected={selected}
            onToggle={toggleItem}
            onSelectAll={selectAll}
            onDeselectAll={deselectAll}
          />
        )}
      </aside>

      {/* Mapa principal */}
      <div className={styles.mapWrapper}>
        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button
            className={styles.filterBtn}
            onClick={() => setFilterOpen(o => !o)}
          >
            🔍 Filtres
          </button>
          <span className={styles.count}>
            {loading
              ? 'Carregant…'
              : `${listings.length.toLocaleString('ca-ES')} allotjaments`
            }
          </span>
        </div>

        {loading && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner} />
            <p>Carregant dades…</p>
          </div>
        )}

        <MapContainer
          center={[41.3851, 2.1734]}
          zoom={12}
          className={styles.map}
          zoomControl={false}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a> &copy; OpenStreetMap contributors'
            subdomains="abcd"
            maxZoom={19}
          />
          {!loading && <MarkerLayer listings={listings} />}
        </MapContainer>
      </div>
    </div>
  )
}
