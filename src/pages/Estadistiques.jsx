import { useState, useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement,
  Title, Tooltip, Legend
} from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { useStats } from '../hooks/useStats'
import styles from './Estadistiques.module.css'

ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement,
  Title, Tooltip, Legend, ChartDataLabels
)

const BLUE = '#0024b8'
const YELLOW = '#ffe500'
const GREEN = '#16a34a'
const RED = '#dc2626'

// ── Gràfics estàtics (calculats des de stats aggregades) ──────────────────
function EvolutionChart({ stats }) {
  if (!stats || stats.length === 0) return <p className={styles.noData}>Sense dades d'evolució.</p>

  const labels = stats.map(s =>
    new Date(s.data_captura).toLocaleDateString('ca-ES', { month: 'short', year: 'numeric' })
  )

  const data = {
    labels,
    datasets: [
      {
        label: 'Total allotjaments',
        data: stats.map(s => s.total_allotjaments),
        borderColor: BLUE,
        backgroundColor: `${BLUE}20`,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'A Airbnb',
        data: stats.map(s => s.a_airbnb),
        borderColor: RED,
        backgroundColor: `${RED}15`,
        fill: true,
        tension: 0.4,
        yAxisID: 'y',
      },
    ],
  }

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          datalabels: { display: false },
        },
        scales: {
          y: { beginAtZero: false },
        },
      }}
    />
  )
}

function PctLicenciaChart({ stats }) {
  if (!stats || stats.length === 0) return <p className={styles.noData}>Sense dades d'evolució.</p>

  const labels = stats.map(s =>
    new Date(s.data_captura).toLocaleDateString('ca-ES', { month: 'short', year: 'numeric' })
  )

  const data = {
    labels,
    datasets: [{
      label: '% sense llicència vàlida',
      data: stats.map(s => s.pct_sense_llicencia),
      borderColor: RED,
      backgroundColor: `${RED}20`,
      fill: true,
      tension: 0.4,
    }],
  }

  return (
    <Line
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          datalabels: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => `${ctx.parsed.y.toFixed(1)}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: { callback: v => `${v}%` },
          },
        },
      }}
    />
  )
}

// ── Placeholder per gràfics que necessiten dades de listings ─────────────
function PlaceholderChart({ title }) {
  return (
    <div className={styles.placeholder}>
      <p>📊 {title}</p>
      <p className={styles.placeholderNote}>Disponible quan les dades de listings estiguin al Supabase.</p>
    </div>
  )
}

// ── Pestanya component ────────────────────────────────────────────────────
function Tabs({ tabs, active, onSelect }) {
  return (
    <div className={styles.tabs}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`${styles.tab} ${active === tab.id ? styles.tabActive : ''}`}
          onClick={() => onSelect(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default function Estadistiques() {
  const { stats, latest, loading } = useStats()
  const [activeTab, setActiveTab] = useState('evolucio')

  const tabs = [
    { id: 'evolucio', label: '📈 Evolució temporal' },
    { id: 'distribucio', label: '🏠 Distribució' },
    { id: 'legalitat', label: '⚖️ Legalitat' },
  ]

  return (
    <div className={`container page-padding ${styles.page}`}>
      <div className={styles.pageHeader}>
        <h1>📊 Estadístiques</h1>
        {latest?.data_captura && (
          <span className={styles.badge}>
            Última actualització: {new Date(latest.data_captura).toLocaleDateString('ca-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* KPIs */}
      {latest && (
        <div className={styles.kpis}>
          <div className={styles.kpi}>
            <span className={styles.kpiValue}>{latest.total_allotjaments?.toLocaleString('ca-ES')}</span>
            <span className={styles.kpiLabel}>Total allotjaments</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiValue}>{latest.total_places?.toLocaleString('ca-ES')}</span>
            <span className={styles.kpiLabel}>Total places</span>
          </div>
          <div className={styles.kpi}>
            <span className={styles.kpiValue}>{latest.a_airbnb?.toLocaleString('ca-ES')}</span>
            <span className={styles.kpiLabel}>A Airbnb</span>
          </div>
          <div className={styles.kpi}>
            <span className={`${styles.kpiValue} ${styles.kpiRed}`}>{latest.pct_sense_llicencia?.toFixed(1)}%</span>
            <span className={styles.kpiLabel}>Sense llicència</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} active={activeTab} onSelect={setActiveTab} />

      <div className={styles.tabContent}>
        {activeTab === 'evolucio' && (
          <div className={styles.chartsGrid}>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Evolució total allotjaments i Airbnb</h3></div>
              <div className="card-body">
                {loading ? <div className={styles.loading}>Carregant…</div> : <EvolutionChart stats={stats} />}
              </div>
            </div>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Evolució % sense llicència</h3></div>
              <div className="card-body">
                {loading ? <div className={styles.loading}>Carregant…</div> : <PctLicenciaChart stats={stats} />}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'distribucio' && (
          <div className={styles.chartsGrid}>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Distribució per tipologia</h3></div>
              <div className="card-body"><PlaceholderChart title="Allotjaments per tipologia" /></div>
            </div>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Places per tipologia</h3></div>
              <div className="card-body"><PlaceholderChart title="Places per tipologia" /></div>
            </div>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Allotjaments a Airbnb per tipologia</h3></div>
              <div className="card-body"><PlaceholderChart title="Airbnb per tipologia" /></div>
            </div>
          </div>
        )}

        {activeTab === 'legalitat' && (
          <div className={styles.chartsGrid}>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Llicència vàlida vs. no vàlida (Airbnb)</h3></div>
              <div className="card-body"><PlaceholderChart title="Legalitat Airbnb" /></div>
            </div>
            <div className={`card ${styles.chartCard}`}>
              <div className="card-header"><h3>Raons d'invalidesa de llicència</h3></div>
              <div className="card-body"><PlaceholderChart title="Raons invalidesa" /></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
