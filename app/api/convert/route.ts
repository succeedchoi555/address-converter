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
    timeout: 60000, // 60초 타임아웃
    maxRetries: 2, // 최대 2회 재시도
  })
}

// Global Address English Formatter System Prompt
const SYSTEM_PROMPT = `You are a Global Address English Formatter (GPT-only).

Your task is to convert an address written in any language into an English address that is understandable and usable for international delivery, mail, and human logistics.

Your goal is not perfect or official accuracy, but maximum global usability.
If a human courier can reasonably understand where to go, the output is considered successful.

CORE PRINCIPLES
- Accept addresses written in any language or local style
- Prioritize clarity and usability over legal or governmental precision
- Convert addresses into natural, logistics-friendly English
- Approximate addresses are acceptable if they improve understanding
- Do not invent specific streets, building numbers, or postal codes

WHAT YOU SHOULD HANDLE
You should attempt conversion when the address includes any of the following:
- Street names or building numbers
- Blocks, districts, neighborhoods
- Villages, towns, cities, regions
- Landmarks or well-known places
- Informal or mixed local address styles
- Street-based, block-based, and landmark-based systems are all valid

WHEN TO RETURN UNSUPPORTED_ADDRESS
Return UNSUPPORTED_ADDRESS only if:
- There is no identifiable place name at all
- The location could be anywhere with no clues (fully ambiguous)
- The address is clearly fictional or meaningless

Do not reject an address just because it is informal or incomplete.

FORMATTING RULES
- Output must be in English
- Use commonly accepted romanization
- Remove accents if they reduce system compatibility
- Use commas to separate address parts
- Preserve location hierarchy when possible (area → city → region → country)
- Use UPPERCASE for the country name
- Clearly include landmarks using phrases like "near", "next to", "behind", or "opposite"

OUTPUT FORMAT (JSON ONLY)

If conversion is possible:
{
  "status": "OK",
  "formatted_address": "string",
  "country": "string or null",
  "confidence": 0.00,
  "notes": "string or null"
}

If conversion is not possible:
{
  "status": "UNSUPPORTED_ADDRESS",
  "reason": "string"
}

CONFIDENCE SCORE (GLOBAL USABILITY)
This score represents how safely the address can be used for delivery and logistics worldwide.

0.90 – 1.00: Clear street-level or building-level location
→ Safe for automatic shipping labels

0.70 – 0.89: District, block, or strong landmark reference
→ Deliverable with human judgment

0.50 – 0.69: City-level or broad area only
→ Usable for reference, weak for delivery

Below 0.50: Not usable for logistics
→ Return UNSUPPORTED_ADDRESS

You are not a geocoding or mapping service.
You are a global human-readable address translator.

CRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks, no explanations outside the JSON structure.`

interface FormatterResponse {
  status: 'OK' | 'UNSUPPORTED_ADDRESS'
  formatted_address?: string
  country?: string | null
  confidence?: number
  notes?: string | null
  reason?: string
  latitude?: number
  longitude?: number
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
          status: 'UNSUPPORTED_ADDRESS',
          reason: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in .env.local'
        },
        { status: 500 }
      )
    }

    // 2. 요청 본문 파싱
    let body: { address?: string }
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: 'Invalid JSON format in request body'
        },
        { status: 400 }
      )
    }

    const { address } = body || {}

    // 3. 입력 검증
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: 'Address is required and must be a non-empty string'
        },
        { status: 400 }
      )
    }

    const trimmedAddress = address.trim()

    // 4. OpenAI API 호출
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: trimmedAddress }
        ],
        temperature: 0.2, // 낮은 temperature로 일관성 확보
        response_format: { type: 'json_object' },
        max_tokens: 500,
      })
    } catch (apiError: any) {
      console.error('OpenAI API error:', apiError)
      
      if (apiError instanceof OpenAI.APIError) {
        return NextResponse.json(
          { 
            status: 'UNSUPPORTED_ADDRESS',
            reason: `OpenAI API error: ${apiError.message || 'API call failed'}`,
            notes: apiError.status ? `Status code: ${apiError.status}` : undefined
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: `API call failed: ${apiError.message || 'Unknown error'}`
        },
        { status: 500 }
      )
    }

    // 5. 응답 파싱 및 검증
    const message = completion.choices[0]?.message
    if (!message || !message.content) {
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: 'No response from address formatter'
        },
        { status: 500 }
      )
    }

    let result: FormatterResponse
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
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: `Invalid JSON returned from formatter: ${parseError.message}`
        },
        { status: 500 }
      )
    }

    // 6. 응답 형식 검증
    if (!result.status) {
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: 'Invalid response format: missing status field'
        },
        { status: 500 }
      )
    }

    // 7. 주소 변환 성공 시 Google Geocoding API로 좌표 조회
    if (result.status === 'OK' && result.formatted_address) {
      const googleApiKey = process.env.GOOGLE_MAPS_API_KEY
      if (googleApiKey) {
        try {
          const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(result.formatted_address)}&key=${googleApiKey}`
          const geocodeResponse = await fetch(geocodeUrl, { cache: 'no-store' })
          
          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json()
            if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
              const location = geocodeData.results[0].geometry?.location
              if (location && location.lat && location.lng) {
                result.latitude = location.lat
                result.longitude = location.lng
              }
            }
          }
        } catch (geocodeError) {
          // Geocoding 실패해도 주소 변환 결과는 반환
          console.error('Geocoding error:', geocodeError)
        }
      }
    }

    // 8. 성공 응답
    return NextResponse.json(
      result,
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error: any) {
    console.error('Unexpected error in convert API:', error)
    
    // OpenAI API 오류 처리
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: `OpenAI API error: ${error.message || 'API call failed'}`,
          notes: error.status ? `Status code: ${error.status}` : undefined
        },
        { status: 500 }
      )
    }
    
    // 네트워크 오류
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      return NextResponse.json(
        { 
          status: 'UNSUPPORTED_ADDRESS',
          reason: 'Network error occurred. Please check your internet connection.'
        },
        { status: 500 }
      )
    }
    
    // 기타 오류
    return NextResponse.json(
      { 
        status: 'UNSUPPORTED_ADDRESS',
        reason: error.message || 'An unexpected error occurred during address conversion'
      },
      { status: 500 }
    )
  }
}
