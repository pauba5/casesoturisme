import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import styles from './Header.module.css'

const navLinks = [
  { to: '/', label: 'Inici', end: true },
  { to: '/mapa', label: '📍 Mapa' },
  { to: '/estadistiques', label: '📊 Estadístiques' },
  { to: '/blog', label: '📝 Blog' },
  { to: '/metodologia', label: '📚 Metodologia' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  
  const isHome = location.pathname === '/'
  const isTransparent = isHome && !scrolled

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Tanca el menú al canviar de ruta
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <header className={`${styles.header} ${isTransparent ? styles.transparent : styles.solid} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <picture>
            <source media="(max-width: 768px)" srcSet="/casesoturisme_mobile.png" />
            <source media="(min-width: 769px)" srcSet="/casesoturisme.png" />
            <img src="/casesoturisme.png" alt="Cases o Turisme" className={styles.logoImg} />
          </picture>
        </Link>

        {/* Nav — desktop */}
        <nav className={`${styles.nav} ${styles.navDesktop}`}>
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Hamburger — mobile */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menú"
          aria-expanded={menuOpen}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen1 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen2 : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen3 : ''}`} />
        </button>
      </div>

      {/* Nav — mobile dropdown */}
      <nav className={`${styles.navMobile} ${menuOpen ? styles.navMobileOpen : ''}`}>
        {navLinks.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `${styles.navMobileLink} ${isActive ? styles.navMobileLinkActive : ''}`
            }
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
