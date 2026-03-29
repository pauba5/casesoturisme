import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStats } from '../hooks/useStats'
import styles from './Home.module.css'

function AnimatedNumber({ value, decimals = 0, duration = 1500 }) {
  const [display, setDisplay] = useState(0)
  const frameRef = useRef(null)

  useEffect(() => {
    if (!value && value !== 0) return
    const startTime = performance.now()
    const endVal = parseFloat(value)

    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(endVal * eased)
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      }
    }
    frameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameRef.current)
  }, [value, duration])

  // Formata amb punts de milers i decimals corresponents
  return display.toLocaleString('ca-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function StatCard({ emoji, value, suffix = '', decimals = 0, label, isMain = false }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const numValue = typeof value === 'number' ? value : parseFloat(value)
  // Format estàtic (quan la stat no és visible encara)
  const formattedStatic = !isNaN(numValue)
    ? numValue.toLocaleString('ca-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : value

  return (
    <div ref={ref} className={`${styles.statCard} ${isMain ? styles.statCardMain : ''}`}>
      <div className={styles.statEmoji}>{emoji}</div>
      <div className={styles.statValue}>
        {visible && !isNaN(numValue)
          ? <><AnimatedNumber value={numValue} decimals={decimals} />{suffix}</>
          : <span>{formattedStatic}{suffix}</span>
        }
      </div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function Home() {
  const { latest, loading } = useStats()

  // Fallback hardcoded si Supabase no té dades encara
  const data = latest || {
    total_allotjaments: 21284,
    total_places: 190435,
    a_airbnb: 15221,
    places_airbnb: 71162,
    pct_sense_llicencia: 51.61,
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className="container">
          <h1 className={styles.heroTitle}>
            190.000 oportunitats de<br />recuperar habitatge
          </h1>
          <p className={styles.heroText}>
            Com moltes altres ciutats, Barcelona pateix una greu crisi d'habitatge que afecta milers de persones.
            Aquesta veritable xacra no és un fenomen espontani, sinó causat per l'acció d'actors especulatius davant
            la indiferència o connivència de les institucions públiques. Entre aquests actors es compta l'explotació
            turística de la ciutat i, en particular, de l'habitatge.
          </p>
          <p className={styles.heroText}>
            En aquest mapa podeu localitzar la totalitat d'allotjaments turístics de la ciutat, tant els habitatges
            anunciats a Airbnb il·legalment i en règim de lloguer de temporada, com hotels i pensions.
          </p>
          <p className={styles.heroSlogan}>
            Cases per a totes! · Abaixem els lloguers! · Decreixement Turístic JA!
          </p>
          <div className={styles.heroActions}>
            <Link to="/mapa" className={styles.btnPrimary}>📍 Veure el mapa</Link>
            <Link to="/blog/manifest" className={styles.btnSecondary}>Llegir el manifest</Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsContainer}>
            <div className={styles.sectionHeader}>
              <h2>Barcelona en dades</h2>
              {latest?.data_captura && (
                <span className={styles.dataBadge}>
                  Dades de {new Date(latest.data_captura).toLocaleDateString('ca-ES', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <div className={styles.statsGrid}>
              <StatCard
                isMain
                emoji="🏠"
                value={data.total_allotjaments}
                label={`allotjaments turístics, ${data.total_places?.toLocaleString('ca-ES')} places (hotels, HUTs, habitacions, pensions...)`}
              />
              <StatCard
                emoji="🏡"
                value={data.a_airbnb}
                label={`a Airbnb (${data.places_airbnb?.toLocaleString('ca-ES')} places: hotels, HUTs i habitacions)`}
              />
              <StatCard
                emoji="🚫"
                value={data.pct_sense_llicencia}
                suffix="%"
                decimals={2}
                label="sense llicència vàlida (no introduïda, no vàlida o repetida)"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className={styles.quickLinks}>
        <div className="container">
          <div className={styles.quickGrid}>
            <Link to="/mapa" className={styles.quickCard}>
              <span className={styles.quickIcon}>📍</span>
              <h3>Mapa interactiu</h3>
              <p>Localitza tots els allotjaments turístics de Barcelona amb filtres per tipologia, districte i legalitat.</p>
            </Link>
            <Link to="/estadistiques" className={styles.quickCard}>
              <span className={styles.quickIcon}>📊</span>
              <h3>Estadístiques</h3>
              <p>Gràfics i evolució temporal de l'allotjament turístic a Barcelona.</p>
            </Link>
            <Link to="/blog" className={styles.quickCard}>
              <span className={styles.quickIcon}>📝</span>
              <h3>Blog</h3>
              <p>Llegeix el manifest i altres articles de l'Assemblea de Barris.</p>
            </Link>
            <Link to="/metodologia" className={styles.quickCard}>
              <span className={styles.quickIcon}>📚</span>
              <h3>Metodologia</h3>
              <p>Com s'han obtingut i processat les dades d'allotjaments turístics.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
