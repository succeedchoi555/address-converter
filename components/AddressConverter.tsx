'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import styles from './AddressConverter.module.css'
import InteractiveMap from './InteractiveMap'

interface PlacePrediction {
  description: string
  place_id: string
  main_text: string
  secondary_text: string
}

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

export default function AddressConverter() {
  const [inputAddress, setInputAddress] = useState('')
  const [geocodeResult, setGeocodeResult] = useState<GeocodeResult | null>(null)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 자동완성 관련 상태
  const [autocompletePredictions, setAutocompletePredictions] = useState<PlacePrediction[]>([])
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const sessionTokenRef = useRef<string>(`session_${Date.now()}`)

  // 자동완성 함수 (Google Places Autocomplete)
  const fetchAutocomplete = useCallback(async (query: string) => {
    const trimmed = query.trim()
    if (trimmed.length < 2) {
      setAutocompletePredictions([])
      setShowAutocomplete(false)
      return
    }

    setIsLoadingAutocomplete(true)
    setShowAutocomplete(true)

    try {
      const response = await fetch('/api/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: trimmed,
          sessionToken: sessionTokenRef.current,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.error || '주소 검색 중 오류가 발생했습니다.')
        setAutocompletePredictions([])
        return
      }

      const data = await response.json()
      
      // 에러가 있으면 표시
      if (data.error) {
        setError(data.error)
        setAutocompletePredictions([])
        return
      }
      
      setAutocompletePredictions(data.predictions || [])
      setSelectedIndex(-1)
      
      // 에러 상태 초기화
      if (data.predictions && data.predictions.length > 0) {
        setError(null)
      }
    } catch (err) {
      console.error('Autocomplete error:', err)
      setAutocompletePredictions([])
    } finally {
      setIsLoadingAutocomplete(false)
    }
  }, [])

  // debounce된 자동완성 호출
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (inputAddress.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        fetchAutocomplete(inputAddress)
      }, 300) // 300ms debounce
    } else {
      setAutocompletePredictions([])
      setShowAutocomplete(false)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [inputAddress, fetchAutocomplete])

  // 외부 클릭 시 자동완성 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current &&
        !autocompleteRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Geocoding 함수 (place_id로 정확한 주소와 좌표 가져오기)
  const geocodePlace = useCallback(async (placeId: string) => {
    setIsGeocoding(true)
    setError(null)
    setShowAutocomplete(false)

    try {
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place_id: placeId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '주소 정보를 가져오는데 실패했습니다.')
      }

      const result: GeocodeResult = await response.json()
      setGeocodeResult(result)
      setInputAddress(result.formatted_address)
      
      // 세션 토큰 갱신 (다음 autocomplete 요청을 위해)
      sessionTokenRef.current = `session_${Date.now()}`
    } catch (err: any) {
      console.error('Geocoding error:', err)
      setError(err.message || '주소 정보를 가져오는 중 오류가 발생했습니다.')
      setGeocodeResult(null)
    } finally {
      setIsGeocoding(false)
    }
  }, [])

  // 자동완성 항목 선택
  const selectPrediction = useCallback((prediction: PlacePrediction) => {
    geocodePlace(prediction.place_id)
  }, [geocodePlace])

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showAutocomplete || autocompletePredictions.length === 0) {
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < autocompletePredictions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < autocompletePredictions.length) {
          selectPrediction(autocompletePredictions[selectedIndex])
        }
        break
      case 'Escape':
        setShowAutocomplete(false)
        setSelectedIndex(-1)
        break
    }
  }, [showAutocomplete, autocompletePredictions, selectedIndex, selectPrediction])


  const copyToClipboard = () => {
    if (geocodeResult?.formatted_address) {
      navigator.clipboard.writeText(geocodeResult.formatted_address)
      alert('주소가 클립보드에 복사되었습니다!')
    }
  }

  const downloadAsTxt = () => {
    if (geocodeResult?.formatted_address) {
      const blob = new Blob([geocodeResult.formatted_address], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'converted_address.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Address Converter</h1>
        <div className={styles.subtitle}>
  <p>International mail, overseas shopping, and global shipping address service.</p>
  <p>Type any place in any language to get the exact address.</p>
  <p style={{ color: 'red', fontWeight: 'bold' }}>We never collect your personal information.</p>
</div>
      </div>

      <div className={styles.content}>
        {/* 주소 입력 */}
        <div className={styles.section} style={{ position: 'relative' }}>
          <label className={styles.label}>Type Any address in any language 주소 입력(어떤 언어든 가능) </label>
          <textarea
            ref={inputRef}
            className={styles.textarea}
            placeholder="Enter your address (All languages supported 주소를 입력하세요 (모든 언어 지원)"
            value={inputAddress}
            onChange={(e) => {
              setInputAddress(e.target.value)
              setError(null)
            }}
            onKeyDown={handleKeyDown}
            rows={4}
          />
          
          {/* 자동완성 드롭다운 */}
          {showAutocomplete && (
            <div ref={autocompleteRef} className={styles.autocompleteDropdown}>
              {isLoadingAutocomplete ? (
                <div className={styles.autocompleteItem}>검색 중...</div>
              ) : autocompletePredictions.length > 0 ? (
                autocompletePredictions.map((prediction, index) => (
                  <div
                    key={prediction.place_id}
                    className={`${styles.autocompleteItem} ${
                      index === selectedIndex ? styles.autocompleteItemSelected : ''
                    }`}
                    onClick={() => selectPrediction(prediction)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className={styles.autocompleteItemMain}>
                      {prediction.main_text}
                    </div>
                    {prediction.secondary_text && (
                      <div className={styles.autocompleteItemMeta}>
                        <span>{prediction.secondary_text}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : inputAddress.trim().length >= 2 ? (
                <div className={styles.autocompleteItem}>
                  검색 결과가 없습니다. 다른 키워드로 시도해주세요.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 로딩 상태 */}
        {isGeocoding && (
          <div className={styles.status}>주소 정보를 가져오는 중...</div>
        )}

        {/* 에러 메시지 */}
        {error && <div className={styles.error}>{error}</div>}

        {/* 변환 결과 */}
        {geocodeResult && !isGeocoding && (
          <div className={styles.section}>
            <label className={styles.label}>변환된 주소</label>
            <textarea
              className={styles.textarea}
              value={geocodeResult.formatted_address}
              readOnly
              rows={4}
            />
            <div className={styles.meta}>
              {geocodeResult.country && <span>국가: {geocodeResult.country}</span>}
              {geocodeResult.locality && <span>도시: {geocodeResult.locality}</span>}
              {geocodeResult.route && <span>도로명: {geocodeResult.route}</span>}
            </div>
            
            {/* 지도 표시 */}
            {geocodeResult.latitude && geocodeResult.longitude && (
              <InteractiveMap
                latitude={geocodeResult.latitude}
                longitude={geocodeResult.longitude}
                address={geocodeResult.formatted_address}
              />
            )}
            
            <div className={styles.buttonGroup}>
              <button
                className={styles.actionButton}
                onClick={copyToClipboard}
              >
                복사하기
              </button>
              <button
                className={styles.actionButton}
                onClick={downloadAsTxt}
              >
                다운로드 (.txt)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
