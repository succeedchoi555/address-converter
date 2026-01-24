import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

interface GeocodeResult {
  formatted_address: string
  place_id: string
  latitude: number
  longitude: number
  country: string | null
  locality: string | null
  route: string | null
  postal_code: string | null
}

export async function POST(request: NextRequest) {
  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: 'Google Maps API key is not configured' },
      { status: 500 }
    )
  }

  let body: { place_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { place_id } = body || {}
  if (!place_id || typeof place_id !== 'string') {
    return NextResponse.json(
      { error: 'place_id is required' },
      { status: 400 }
    )
  }

  const params = new URLSearchParams({
    place_id: place_id,
    key: GOOGLE_MAPS_API_KEY,
    language: 'en',
  })

  const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json(
        { error: 'Geocoding request failed' },
        { status: 500 }
      )
    }

    const data = await res.json()

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return NextResponse.json(
        { error: 'No results found for this place_id' },
        { status: 404 }
      )
    }

    const result = data.results[0]
    const location = result.geometry?.location
    const addressComponents = result.address_components || []

    // 주소 구성 요소 추출
    let country: string | null = null
    let locality: string | null = null
    let route: string | null = null
    let postal_code: string | null = null

    addressComponents.forEach((component: any) => {
      const types = component.types || []
      if (types.includes('country')) {
        country = component.long_name
      } else if (types.includes('locality') || types.includes('administrative_area_level_1')) {
        locality = component.long_name
      } else if (types.includes('route')) {
        route = component.long_name
      } else if (types.includes('postal_code')) {
        postal_code = component.long_name
      }
    })

    const geocodeResult: GeocodeResult = {
      formatted_address: result.formatted_address || '',
      place_id: result.place_id || place_id,
      latitude: location?.lat || 0,
      longitude: location?.lng || 0,
      country,
      locality,
      route,
      postal_code,
    }

    return NextResponse.json(geocodeResult)
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    )
  }
}
