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

  try {
    // 1️⃣ place_id로 geocode
    const params = new URLSearchParams({
      place_id: place_id,
      key: GOOGLE_MAPS_API_KEY,
      language: 'en',
    })

    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
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
    let addressComponents = result.address_components || []

    const getComponent = (type: string) =>
      addressComponents.find((c: any) => c.types?.includes(type))?.long_name || null

    let postal_code = getComponent('postal_code')

    // 2️⃣ postal_code 없으면 → lat,lng로 reverse geocode
    if (!postal_code && location?.lat && location?.lng) {
      const reverseParams = new URLSearchParams({
        latlng: `${location.lat},${location.lng}`,
        key: GOOGLE_MAPS_API_KEY,
        language: 'en',
      })

      const reverseUrl = `https://maps.googleapis.com/maps/api/geocode/json?${reverseParams.toString()}`
      const reverseRes = await fetch(reverseUrl, { cache: 'no-store' })

      if (reverseRes.ok) {
        const reverseData = await reverseRes.json()
        const reverseResult = reverseData.results?.[0]
        if (reverseResult?.address_components) {
          const comps2 = reverseResult.address_components
          const postal2 = comps2.find((c: any) =>
            c.types?.includes('postal_code')
          )?.long_name

          if (postal2) {
            postal_code = postal2
          }
        }
      }
    }

    const geocodeResult: GeocodeResult = {
      formatted_address: result.formatted_address || '',
      place_id: result.place_id || place_id,
      latitude: location?.lat || 0,
      longitude: location?.lng || 0,
      country: getComponent('country'),
      locality:
        getComponent('locality') ||
        getComponent('administrative_area_level_1'),
      route: getComponent('route'),
      postal_code: postal_code,
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
