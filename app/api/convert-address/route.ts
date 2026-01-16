import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

interface StructuredAddress {
  country: string
  state_or_province: string
  city: string
  district: string
  street: string
  building_number: string
  postal_code: string
}

// OpenAI 클라이언트 초기화 (런타임에서 안전하게)
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.')
  }

  return new OpenAI({
    apiKey,
    timeout: 60000, // 60초 타임아웃
    maxRetries: 2, // 최대 2회 재시도
  })
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
        { error: 'OpenAI API 키가 설정되지 않았습니다. .env.local 파일에 OPENAI_API_KEY를 설정해주세요.' },
        { status: 500 }
      )
    }

    // 2. 요청 본문 파싱
    let body: { address?: string; targetLanguage?: string }
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: '잘못된 JSON 형식의 요청입니다.' },
        { status: 400 }
      )
    }

    const { address, targetLanguage } = body || {}

    // 3. 입력 검증
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return NextResponse.json(
        { error: '주소를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!targetLanguage || typeof targetLanguage !== 'string') {
      return NextResponse.json(
        { error: '출력 언어를 선택해주세요.' },
        { status: 400 }
      )
    }

    const trimmedAddress = address.trim()

    // 4. Step 1: 주소 구조화
    let structuredAddress: StructuredAddress
    try {
      const structureCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an address parsing expert. Convert the following address into a structured JSON format for administrative and delivery purposes. Do not translate yet. Extract the following fields: country, state_or_province, city, district, street, building_number, postal_code. If a field is not available, use an empty string. Respond with ONLY valid JSON, no additional text or explanation.`,
          },
          {
            role: 'user',
            content: trimmedAddress,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 500,
      })

      const message = structureCompletion.choices[0]?.message
      if (!message) {
        throw new Error('주소 구조화 응답이 비어있습니다.')
      }

      const structuredJson = message.content
      if (!structuredJson || typeof structuredJson !== 'string') {
        throw new Error('주소 구조화 응답 형식이 올바르지 않습니다.')
      }

      try {
        const parsed = JSON.parse(structuredJson)
        
        // 필수 필드 검증
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('구조화된 주소가 객체가 아닙니다.')
        }

        structuredAddress = {
          country: String(parsed.country || ''),
          state_or_province: String(parsed.state_or_province || ''),
          city: String(parsed.city || ''),
          district: String(parsed.district || ''),
          street: String(parsed.street || ''),
          building_number: String(parsed.building_number || ''),
          postal_code: String(parsed.postal_code || ''),
        }
      } catch (parseError: any) {
        console.error('JSON parse error:', parseError, 'JSON:', structuredJson)
        throw new Error(`주소 구조화 결과를 파싱할 수 없습니다: ${parseError.message}`)
      }
    } catch (structureError: any) {
      console.error('Structure error:', structureError)
      
      if (structureError instanceof OpenAI.APIError) {
        return NextResponse.json(
          { 
            error: `OpenAI API 오류: ${structureError.message || '주소 구조화 중 API 호출에 실패했습니다.'}`,
            details: structureError.status ? `상태 코드: ${structureError.status}` : undefined
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `주소 구조화 실패: ${structureError.message || '알 수 없는 오류가 발생했습니다.'}` },
        { status: 500 }
      )
    }

    // 5. Step 2: 목표 언어로 재구성
    let convertedAddress: string
    try {
      const reformatCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an address formatting expert. Using the structured address JSON below, generate a properly formatted address in ${targetLanguage}, following the official addressing convention of the country. The address should be suitable for administrative and delivery purposes. Respond with ONLY the formatted address text, no additional explanation, no JSON, no quotes, just the plain address text.`,
          },
          {
            role: 'user',
            content: JSON.stringify(structuredAddress, null, 2),
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      })

      const message = reformatCompletion.choices[0]?.message
      if (!message) {
        throw new Error('주소 변환 응답이 비어있습니다.')
      }

      convertedAddress = message.content?.trim() || ''
      
      // 따옴표 제거 (JSON 문자열로 감싸져 있을 경우)
      convertedAddress = convertedAddress.replace(/^["']|["']$/g, '').trim()

      if (!convertedAddress) {
        throw new Error('주소 변환 결과가 비어있습니다.')
      }
    } catch (reformatError: any) {
      console.error('Reformat error:', reformatError)
      
      if (reformatError instanceof OpenAI.APIError) {
        return NextResponse.json(
          { 
            error: `OpenAI API 오류: ${reformatError.message || '주소 변환 중 API 호출에 실패했습니다.'}`,
            details: reformatError.status ? `상태 코드: ${reformatError.status}` : undefined
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: `주소 변환 실패: ${reformatError.message || '알 수 없는 오류가 발생했습니다.'}` },
        { status: 500 }
      )
    }

    // 6. 성공 응답
    return NextResponse.json({
      convertedAddress,
      structuredAddress,
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error: any) {
    console.error('Unexpected error:', error)
    
    // OpenAI API 오류 처리
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          error: `OpenAI API 오류: ${error.message || 'API 호출에 실패했습니다.'}`,
          details: error.status ? `상태 코드: ${error.status}` : undefined
        },
        { status: 500 }
      )
    }
    
    // 네트워크 오류
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.' },
        { status: 500 }
      )
    }
    
    // 기타 오류
    return NextResponse.json(
      { error: error.message || '주소 변환 중 예기치 않은 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
