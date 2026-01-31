import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPostBySlug, getAllPosts } from '@/lib/posts'
import MarkdownContent from '@/components/MarkdownContent'
import styles from './post.module.css'

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className={styles.container}>
      <Link href="/blog" className={styles.backLink}>
        ← 블로그 목록으로
      </Link>

      <article className={styles.article}>
        <header className={styles.header}>
          <div className={styles.meta}>
            {post.category && (
              <span className={styles.category}>{post.category}</span>
            )}
            <span className={styles.date}>{post.date}</span>
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          {post.description && (
            <p className={styles.description}>{post.description}</p>
          )}
        </header>

        <div className={styles.content}>
          <MarkdownContent content={post.content} />
        </div>
      </article>
    </div>
  )
}
