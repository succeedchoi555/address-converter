import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'
import styles from './blog.module.css'

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>주소 변환과 관련된 유용한 정보와 가이드를 공유합니다.</p>
        <Link href="/blog/new" className={styles.newPostButton}>
          새 글 작성
        </Link>
      </div>

      <div className={styles.postsGrid}>
        {posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>아직 작성된 글이 없습니다.</p>
            <Link href="/blog/new" className={styles.newPostButton}>
              첫 번째 글 작성하기
            </Link>
          </div>
        ) : (
          posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className={styles.postCard}>
              <div className={styles.postHeader}>
                {post.category && (
                  <span className={styles.category}>{post.category}</span>
                )}
                <span className={styles.date}>{post.date}</span>
              </div>
              <h2 className={styles.postTitle}>{post.title}</h2>
              {post.description && (
                <p className={styles.postDescription}>{post.description}</p>
              )}
              <div className={styles.readMore}>읽기 →</div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
