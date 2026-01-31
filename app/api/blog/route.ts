import { NextRequest, NextResponse } from 'next/server'
import { savePost, generateSlug, getPostBySlug } from '@/lib/posts'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (slug) {
    const post = getPostBySlug(slug)
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    return NextResponse.json(post)
  }

  return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category, description } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const slug = generateSlug(title)
    
    // 같은 slug가 이미 존재하는지 확인
    let finalSlug = slug
    let counter = 1
    while (getPostBySlug(finalSlug)) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    const success = savePost(finalSlug, title, content, category, description)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save post' },
        { status: 500 }
      )
    }

    return NextResponse.json({ slug: finalSlug, success: true })
  } catch (error) {
    console.error('Error saving post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
