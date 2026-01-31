import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'posts')

export interface PostMetadata {
  title: string
  date: string
  category?: string
  description?: string
  slug: string
}

export interface Post extends PostMetadata {
  content: string
}

// 모든 블로그 글 가져오기
export function getAllPosts(): PostMetadata[] {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
    return []
  }

  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title || 'Untitled',
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.category || '',
        description: data.description || '',
      } as PostMetadata
    })

  // 날짜순으로 정렬 (최신순)
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

// 특정 블로그 글 가져오기
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    if (!fs.existsSync(fullPath)) {
      return null
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || 'Untitled',
      date: data.date || new Date().toISOString().split('T')[0],
      category: data.category || '',
      description: data.description || '',
      content,
    }
  } catch (error) {
    console.error('Error reading post:', error)
    return null
  }
}

// 블로그 글 저장
export function savePost(slug: string, title: string, content: string, category?: string, description?: string): boolean {
  try {
    if (!fs.existsSync(postsDirectory)) {
      fs.mkdirSync(postsDirectory, { recursive: true })
    }

    const frontmatter = {
      title,
      date: new Date().toISOString().split('T')[0],
      category: category || '',
      description: description || '',
    }

    const fileContent = matter.stringify(content, frontmatter)
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    fs.writeFileSync(fullPath, fileContent, 'utf8')
    return true
  } catch (error) {
    console.error('Error saving post:', error)
    return false
  }
}

// 블로그 글 삭제
export function deletePost(slug: string): boolean {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`)
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath)
      return true
    }
    return false
  } catch (error) {
    console.error('Error deleting post:', error)
    return false
  }
}

// slug 생성 (제목에서)
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
