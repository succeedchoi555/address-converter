'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import styles from './new.module.css'

export default function NewPostPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: category.trim(),
          description: description.trim(),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '글 저장에 실패했습니다.')
      }

      const data = await response.json()
      router.push(`/blog/${data.slug}`)
    } catch (err: any) {
      setError(err.message || '글 저장 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>새 글 작성</h1>
        <p className={styles.subtitle}>마크다운 형식으로 글을 작성할 수 있습니다.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            제목 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="글 제목을 입력하세요"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            카테고리
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.input}
            placeholder="예: 가이드, 팁, 뉴스"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            설명
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            placeholder="글에 대한 간단한 설명을 입력하세요"
            rows={2}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="content" className={styles.label}>
            내용 * (마크다운 지원)
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={styles.textarea}
            placeholder="# 제목&#10;&#10;본문 내용을 마크다운 형식으로 작성하세요..."
            rows={20}
            required
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? '저장 중...' : '글 발행하기'}
          </button>
        </div>
      </form>
    </div>
  )
}
