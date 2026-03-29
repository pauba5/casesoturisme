/**
 * Registry central de tots els articles del blog.
 * Per afegir un article nou:
 * 1. Crea el fitxer .mdx a src/content/blog/
 * 2. Afegeix l'entrada aquí
 */

export const articles = [
  {
    slug: 'manifest',
    title: '190.000 oportunitats de recuperar habitatge',
    excerpt: 'El manifest de l\'Assemblea de Barris pel Decreixement Turístic: per qué Barcelona necessita recuperar l\'habitatge turístic.',
    date: '2024-11-01',
    author: 'Assemblea de Barris pel Decreixement Turístic',
    tags: ['manifest', 'habitatge', 'turisme'],
  },
]

export function getArticleBySlug(slug) {
  return articles.find(a => a.slug === slug)
}
