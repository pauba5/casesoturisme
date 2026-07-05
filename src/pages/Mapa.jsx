import { useState, useEffect, useCallback, useMemo } from 'react'
import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import { useListings, useListingFilters } from '../hooks/useListings'
import FilterPanel from '../components/Map/FilterPanel'
import MapSearch from '../components/Map/MapSearch'
import styles from './Mapa.module.css'

// Fix leaflet default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const COLOR_MAP = {
  'Vàlid': '#16a34a',
  'Llicència vàlida': '#16a34a',
  'No necessita llicència': '#ea580c',
  'Exempt': '#ea580c',
}
const DEFAULT_COLOR = '#dc2626' // Per defecte "No Vàlid" (Només Airbnb)
const CENSUS_COLOR = '#0ea5e9' // Blau per al Cens Oficial
const MATCHED_COLOR = '#16a34a' // Verd per a coincidència amb el Cens

function getColor(listing) {
  const s = listing.status || ''
  const r = listing.reason || ''

  // El "No Vàlid" té prioritat absoluta sobre qualsevol altra cosa
  if (s === 'No Vàlid') return DEFAULT_COLOR

  if (listing.source === 'census') return CENSUS_COLOR
  if (listing.source === 'both') return MATCHED_COLOR
  
  if (s === 'No necessita llicència') return COLOR_MAP[s]
  
  if (r.includes('Llicència HUT vàlida')) {
    return MATCHED_COLOR // Verd (Vàlid)
  }

  return COLOR_MAP[s] || DEFAULT_COLOR
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
    const group = L.markerClusterGroup({ 
      iconCreateFunction: getClusterIcon,
      chunkedLoading: true // Evita que la UI es congeli mentre es creen els clústers
    })

    const markers = []

    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return
      const color = getColor(listing)
      const marker = L.marker([listing.latitude, listing.longitude], { icon: createIcon(color) })
      const isCensusOnly = listing.source === 'census'
      const airbnbUrl = isCensusOnly ? null : (listing.url || `https://www.airbnb.es/rooms/${listing.id}`)

      const titleName = listing.name || listing.address || 'Sense nom'

      const popup = `
        <div style="font-size:12px;line-height:1.3;max-width:240px;">
          <div style="margin-bottom:6px;">
            <strong style="font-size:13px;">${(listing.category_abdt === 'HUT' ? 'Apartament' : listing.category_abdt) || ''}: ${
              airbnbUrl 
                ? `<a href="${airbnbUrl}" target="_blank" rel="noopener noreferrer">${titleName}</a>`
                : titleName
            }</strong>
          </div>
          ${!isCensusOnly && listing.price ? `<p style="margin:2px 0"><b>Preu:</b> ${listing.price}€ / nit</p>` : ''}
          ${listing.host_name ? `<p style="margin:2px 0"><b>Amfitrió:</b> ${listing.host_name}</p>` : ''}
          ${!isCensusOnly && listing.host_listings_count ? `<p style="margin:2px 0"><b>Allotjaments de l'amfitrió:</b> ${listing.host_listings_count}</p>` : ''}
          <p style="margin:2px 0"><b>Status:</b> ${listing.status || '—'}</p>
          <p style="margin:2px 0"><b>Raó:</b> ${listing.reason || '—'}</p>
          <p style="margin:2px 0"><b>Llicència:</b> ${listing.license || 'No especificada'}</p>
          <p style="margin:2px 0"><b>Places:</b> ${listing.places || '—'}</p>
          ${airbnbUrl ? `<div style="margin-top:6px;"><a href="${airbnbUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--color-brand-blue);font-weight:bold;">Veure a Airbnb →</a></div>` : ''}
        </div>
      `
      marker.bindPopup(popup)
      markers.push(marker)
    })

    group.addLayers(markers) // Afegir en bloc és molt més ràpid que un per un
    map.addLayer(group)

    // Llegenda
    const legend = L.control({ position: 'bottomright' })
    legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-legend')
      div.innerHTML = `
        <div class="map-legend-item"><svg width="14" height="14" fill="${DEFAULT_COLOR}" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/></svg> Només Airbnb (No vàlid)</div>
        <div class="map-legend-item"><svg width="14" height="14" fill="${MATCHED_COLOR}" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/></svg> Airbnb validat (Cens)</div>
        <div class="map-legend-item"><svg width="14" height="14" fill="${CENSUS_COLOR}" viewBox="0 0 16 16"><path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6-.354.353V14.5A1.5 1.5 0 0 0 2.5 16h3A1.5 1.5 0 0 0 7 14.5v-3h2v3A1.5 1.5 0 0 0 10.5 16h3a1.5 1.5 0 0 0 1.5-1.5V7.5l-.354-.354z"/></svg> Només Cens (No Airbnb)</div>
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

function MapFlyTo({ targetLocation }) {
  const map = useMap()
  useEffect(() => {
    if (targetLocation) {
      map.flyTo([targetLocation.lat, targetLocation.lon], 17, { duration: 2 })
    }
  }, [targetLocation, map])
  return null
}

export default function Mapa() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [searchLocation, setSearchLocation] = useState(null)
  const { districts, neighborhoods, types, statuses, sources, loading: filtersLoading } = useListingFilters()

  const [selected, setSelected] = useState({
    districts: [],
    neighborhoods: [],
    types: [],
    statuses: [],
    sources: [],
  })

  // Inicialitza els filtres amb tots els valors seleccionats un cop carregats
  useEffect(() => {
    if (!filtersLoading) {
      setSelected({ 
        districts, 
        neighborhoods,
        types, 
        statuses, 
        sources: sources.map(s => s.id) 
      })
    }
  }, [filtersLoading])

  const filters = useMemo(() => ({
    districts: selected.districts.length < districts.length ? selected.districts : [],
    neighborhoods: selected.neighborhoods.length < neighborhoods.length ? selected.neighborhoods : [],
    types: selected.types.length < types.length ? selected.types : [],
    statuses: selected.statuses.length < statuses.length ? selected.statuses : [],
    sources: selected.sources.length < sources.length ? selected.sources : [],
  }), [selected, districts, neighborhoods, types, statuses, sources])

  const { listings, loading, total, snapshotDate } = useListings(filters)

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
      {/* Cercador Flotant Superior */}
      <MapSearch onLocationFound={(lat, lon) => setSearchLocation({lat, lon})} />
      
      {/* Sidebar filtres — desktop i mobile */}
      <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2 className={styles.sidebarTitle}>🔍 Filtres</h2>
          <button className={styles.closeBtn} onClick={() => setFilterOpen(false)} aria-label="Tanca filtres">✕</button>
        </div>
        
        {!filtersLoading && (
          <FilterPanel
            districts={districts}
            neighborhoods={neighborhoods}
            types={types}
            statuses={statuses}
            sources={sources}
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
        <div className={`${styles.topRightControls} ${filterOpen ? styles.controlsHiddenMobile : ''}`}>
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
          {!loading && snapshotDate && (
            <div className={styles.dateBadge}>
              Actualitzat: {new Date(snapshotDate).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          )}
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
          <MapFlyTo targetLocation={searchLocation} />
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
