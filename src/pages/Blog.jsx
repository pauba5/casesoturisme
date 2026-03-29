import { Link } from 'react-router-dom'
import { articles } from '../content/blog/articles'
import styles from './Blog.module.css'

function ArticleCard({ article }) {
  const date = new Date(article.date).toLocaleDateString('ca-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <Link to={`/blog/${article.slug}`} className={styles.card}>
      <div className={styles.cardMeta}>
        <time className={styles.date}>{date}</time>
        {article.tags?.map(tag => (
          <span key={tag} className={styles.tag}>{tag}</span>
        ))}
      </div>
      <h2 className={styles.cardTitle}>{article.title}</h2>
      <p className={styles.excerpt}>{article.excerpt}</p>
      <span className={styles.readMore}>Llegir →</span>
    </Link>
  )
}

export default function Blog() {
  const sorted = [...articles].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className={`container page-padding`}>
      <div className={styles.header}>
        <h1>📝 Blog</h1>
        <p className={styles.subtitle}>
          Articles, manifests i notes de l'Assemblea de Barris pel Decreixement Turístic.
        </p>
      </div>
      <div className={styles.grid}>
        {sorted.map(article => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </div>
  )
}
