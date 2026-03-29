import { Outlet, useLocation } from 'react-router-dom'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'
import styles from './Layout.module.css'

const FULLSCREEN_ROUTES = ['/mapa']

export default function Layout() {
  const { pathname } = useLocation()
  const isFullscreen = FULLSCREEN_ROUTES.some(r => pathname.startsWith(r))
  const isHome = pathname === '/'

  return (
    <div className={`${styles.wrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
      <Header />
      <main className={`${styles.main} ${isFullscreen ? styles.mainFullscreen : ''} ${isHome ? styles.mainHome : ''}`}>
        <Outlet />
      </main>
      {!isFullscreen && <Footer />}
    </div>
  )
}
