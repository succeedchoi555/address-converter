import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

interface PlacePrediction {
  description: string
  place_id: string
  main_text: string
  secondary_text: string
}

interface AutocompleteResponse {
  predictions: PlacePrediction[]
}

export async function POST(request: NextRequest) {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('GOOGLE_MAPS_API_KEY is not set in environment variables')
    return NextResponse.json(
      { 
        predictions: [], 
        error: 'Google Maps API key가 설정되지 않았습니다. .env.local 파일에 GOOGLE_MAPS_API_KEY를 설정해주세요.' 
      },
      { status: 500 }
    )
  }

  let body: { query?: string; sessionToken?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { predictions: [], error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { query, sessionToken } = body || {}
  if (!query || typeof query !== 'string' || query.trim().length < 2) {
    return NextResponse.json({ predictions: [] })
  }

  const params = new URLSearchParams({
    input: query.trim(),
    language: 'en',
    key: GOOGLE_MAPS_API_KEY,
  })
  // types를 제거하여 더 넓은 범위의 결과 검색 (주소, 장소 등)
  if (sessionToken) {
    params.set('sessiontoken', sessionToken)
  }

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params.toString()}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error')
      console.error('Google Places API HTTP error:', res.status, errorText)
      return NextResponse.json(
        { 
          predictions: [], 
          error: `주소 검색 요청 실패 (${res.status}). API 키를 확인해주세요.` 
        },
        { status: 500 }
      )
    }

    const data = await res.json()

    // Google API 상태 코드 처리
    if (data.status === 'ZERO_RESULTS') {
      return NextResponse.json({ predictions: [] })
    }

    if (data.status !== 'OK') {
      console.error('Google Places API error:', data.status, data.error_message)
      return NextResponse.json(
        { 
          predictions: [], 
          error: data.error_message || `Google API error: ${data.status}` 
        },
        { status: 500 }
      )
    }

    if (!data.predictions || data.predictions.length === 0) {
      return NextResponse.json({ predictions: [] })
    }

    const predictions: PlacePrediction[] = data.predictions
      .filter((p: any) => p?.place_id && p?.description) // 필수 필드 확인
      .map((p: any) => ({
        description: p.description,
        place_id: p.place_id,
        main_text: p.structured_formatting?.main_text || p.description,
        secondary_text: p.structured_formatting?.secondary_text || '',
      }))

    return NextResponse.json({ predictions })
  } catch (error) {
    console.error('Autocomplete error:', error)
    return NextResponse.json(
      { predictions: [], error: 'Failed to fetch autocomplete results' },
      { status: 500 }
    )
  }
}
