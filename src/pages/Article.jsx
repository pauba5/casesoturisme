import { useParams, Link, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { getArticleBySlug } from '../content/blog/articles'
import styles from './Article.module.css'

// Import dinàmic dels .mdx
const articleComponents = {
  manifest: lazy(() => import('../content/blog/manifest.mdx')),
  'nota-metodologica': lazy(() => import('../content/blog/nota-metodologica.mdx')),
}

export default function Article() {
  const { slug } = useParams()
  const meta = getArticleBySlug(slug)

  if (!meta) return <Navigate to="/blog" replace />

  const ArticleContent = articleComponents[slug]
  if (!ArticleContent) return <Navigate to="/blog" replace />

  const date = new Date(meta.date).toLocaleDateString('ca-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className={`container page-padding`}>
      <div className={styles.article}>
        {/* Breadcrumb */}
        <nav className={styles.breadcrumb}>
          <Link to="/blog">← Blog</Link>
        </nav>

        {/* Header */}
        <header className={styles.header}>
          <div className={styles.meta}>
            <time className={styles.date}>{date}</time>
            {meta.tags?.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
          <h1 className={styles.title}>{meta.title}</h1>
          {meta.author && <p className={styles.author}>Per <strong>{meta.author}</strong></p>}
        </header>

        {/* Contingut MDX */}
        <div className={styles.content}>
          <Suspense fallback={<div className={styles.loading}>Carregant article…</div>}>
            <ArticleContent />
          </Suspense>
        </div>

        {/* Footer article */}
        <div className={styles.articleFooter}>
          <Link to="/blog" className={styles.backBtn}>← Tornar al blog</Link>
        </div>
      </div>
    </div>
  )
}
