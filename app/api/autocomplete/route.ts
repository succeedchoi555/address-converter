import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// OpenAI 클라이언트 초기화
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set')
  }

  return new OpenAI({
    apiKey,
    timeout: 30000, // 30초 타임아웃
    maxRetries: 1, // 최대 1회 재시도
  })
}

// 주소 자동완성 시스템 프롬프트
const AUTOCOMPLETE_SYSTEM_PROMPT = `You are an Address Autocomplete Service.

Your task is to generate a list of possible address suggestions based on partial user input.

INPUT: A partial address query (e.g., "Gangnam", "1600 Amphi", "Shibuya")

OUTPUT: A JSON array of address candidates. Each candidate must include:
- country: string (country name in English, UPPERCASE)
- city: string (city name)
- street: string (street name or area name)
- formatted_address: string (complete formatted address in English)
- postal_code: string or null (postal/zip code if available)

RULES:
1. Generate 3-8 realistic address candidates
2. Addresses should be real-world locations when possible
3. If input is too vague (less than 2 characters), return empty array
4. Prioritize well-known locations and major cities
5. Use standard English formatting for addresses
6. Include postal codes when you know them, otherwise use null

OUTPUT FORMAT (JSON ONLY):
{
  "candidates": [
    {
      "country": "SOUTH KOREA",
      "city": "Seoul",
      "street": "Gangnam Station",
      "formatted_address": "Gangnam Station, Gangnam-gu, Seoul, SOUTH KOREA",
      "postal_code": "06000"
    },
    ...
  ]
}

CRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks, no explanations outside the JSON structure.`

interface AddressCandidate {
  country: string
  city: string
  street: string
  formatted_address: string
  postal_code: string | null
}

interface AutocompleteResponse {
  candidates: AddressCandidate[]
}

export async function POST(request: NextRequest) {
  try {
    // 1. API 키 확인
    let openai: OpenAI
    try {
      openai = getOpenAIClient()
    } catch (keyError: any) {
      console.error('OpenAI client initialization error:', keyError)
      return NextResponse.json(
        { 
          candidates: [],
          error: 'OpenAI API key is not configured'
        },
        { status: 500 }
      )
    }

    // 2. 요청 본문 파싱
    let body: { query?: string }
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { 
          candidates: [],
          error: 'Invalid JSON format in request body'
        },
        { status: 400 }
      )
    }

    const { query } = body || {}

    // 3. 입력 검증
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return NextResponse.json(
        { candidates: [] },
        { status: 200 }
      )
    }

    const trimmedQuery = query.trim()

    // 4. OpenAI API 호출
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: AUTOCOMPLETE_SYSTEM_PROMPT },
          { role: 'user', content: `Generate address suggestions for: "${trimmedQuery}"` }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 800,
      })
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError)
      
      if (apiError instanceof OpenAI.APIError) {
        return NextResponse.json(
          { 
            candidates: [],
            error: `OpenAI API error: ${apiError.message || 'API call failed'}`
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          candidates: [],
          error: `API call failed: ${apiError.message || 'Unknown error'}`
        },
        { status: 500 }
      )
    }

    // 5. 응답 파싱 및 검증
    const message = completion.choices[0]?.message
    if (!message || !message.content) {
      return NextResponse.json(
        { candidates: [] },
        { status: 200 }
      )
    }

    let result: AutocompleteResponse
    try {
      const content = message.content.trim()
      
      // JSON 코드 블록 제거 (혹시 모를 경우 대비)
      const cleanedContent = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/\s*```$/, '')
        .trim()
      
      result = JSON.parse(cleanedContent)
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError)
      console.error('Received content:', message.content)
      return NextResponse.json(
        { candidates: [] },
        { status: 200 }
      )
    }

    // 6. 응답 형식 검증 및 정규화
    if (!result.candidates || !Array.isArray(result.candidates)) {
      return NextResponse.json(
        { candidates: [] },
        { status: 200 }
      )
    }

    // 후보 정규화 (필수 필드 확인)
    const normalizedCandidates: AddressCandidate[] = result.candidates
      .filter((candidate: any) => {
        return candidate && 
               typeof candidate.country === 'string' &&
               typeof candidate.city === 'string' &&
               typeof candidate.street === 'string' &&
               typeof candidate.formatted_address === 'string'
      })
      .map((candidate: any) => ({
        country: String(candidate.country || ''),
        city: String(candidate.city || ''),
        street: String(candidate.street || ''),
        formatted_address: String(candidate.formatted_address || ''),
        postal_code: candidate.postal_code && typeof candidate.postal_code === 'string' 
          ? candidate.postal_code 
          : null
      }))
      .slice(0, 8) // 최대 8개로 제한

    // 7. 성공 응답
    return NextResponse.json(
      { candidates: normalizedCandidates },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error: any) {
    console.error('Unexpected error in autocomplete API:', error)
    
    return NextResponse.json(
      { candidates: [] },
      { status: 200 }
    )
  }
}
