import { Suspense, lazy } from 'react'
import styles from './Metodologia.module.css'

const MetodologiaContent = lazy(() => import('../content/blog/nota-metodologica.mdx'))

export default function Metodologia() {
  return (
    <div className="container page-padding">
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Nota metodològica</h1>
          <p className={styles.subtitle}>
            Com s'han obtingut i processat les dades d'allotjaments turístics de Barcelona.
          </p>
        </header>
        <div className={styles.content}>
          <Suspense fallback={<div className={styles.loading}>Carregant…</div>}>
            <MetodologiaContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
