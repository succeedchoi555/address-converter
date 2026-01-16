'use client'

import { useState, useCallback } from 'react'
import styles from './AddressConverter.module.css'

export default function AddressConverter() {
  const [inputAddress, setInputAddress] = useState('')
  const [convertedAddress, setConvertedAddress] = useState('')
  const [country, setCountry] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 변환 함수 (영문 물류용 주소)
  const convertAddress = useCallback(async (address: string) => {
    const trimmed = address.trim()
    if (trimmed.length < 3) {
      setConvertedAddress('')
      setCountry(null)
      setConfidence(null)
      setNotes(null)
      setError(null)
      return
    }

    setIsConverting(true)
    setError(null)

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: trimmed,
        }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          throw new Error(data.reason || data.error || `서버 오류 (${response.status})`)
        } else {
          const text = await response.text()
          throw new Error(`서버 오류: ${response.status} ${text.slice(0, 100)}`)
        }
      }

      const data = await response.json()

      if (data.status !== 'OK') {
        throw new Error(data.reason || '지원 불가 주소입니다.')
      }

      setConvertedAddress(data.formatted_address || '')
      setCountry(data.country ?? null)
      setConfidence(typeof data.confidence === 'number' ? data.confidence : null)
      setNotes(data.notes ?? null)
    } catch (err: any) {
      console.error('Conversion error:', err)
      setError(err.message || '주소 변환 중 오류가 발생했습니다.')
      setConvertedAddress('')
      setCountry(null)
      setConfidence(null)
      setNotes(null)
    } finally {
      setIsConverting(false)
    }
  }, [])

  const copyToClipboard = () => {
    if (convertedAddress) {
      navigator.clipboard.writeText(convertedAddress)
      alert('주소가 클립보드에 복사되었습니다!')
    }
  }

  const downloadAsTxt = () => {
    if (convertedAddress) {
      const blob = new Blob([convertedAddress], { type: 'text/plain' })
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

  const openGoogleMaps = () => {
    if (!convertedAddress) return
    const encodedAddress = encodeURIComponent(convertedAddress)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
    window.open(mapsUrl, '_blank')
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Address Converter</h1>
        <p className={styles.subtitle}>
          어떤 언어로 입력해도 물류/택배/우편에 바로 쓸 수 있는 영문 주소로 변환합니다.
        </p>
      </div>

      <div className={styles.content}>
        {/* 주소 입력 */}
        <div className={styles.section}>
          <label className={styles.label}>주소 입력 (어떤 언어든 가능)</label>
          <textarea
            className={styles.textarea}
            placeholder="주소를 입력하세요 (모든 언어 지원)"
            value={inputAddress}
            onChange={(e) => {
              setInputAddress(e.target.value)
              setError(null)
            }}
            rows={4}
          />
        </div>

        {/* 변환 버튼 */}
        <button
          className={styles.convertButton}
          onClick={() => convertAddress(inputAddress)}
          disabled={!inputAddress.trim() || isConverting}
        >
          {isConverting ? '변환 중...' : '영문 주소로 변환'}
        </button>

        {/* 로딩 상태 */}
        {isConverting && inputAddress.trim() && (
          <div className={styles.status}>변환 중...</div>
        )}

        {/* 에러 메시지 */}
        {error && <div className={styles.error}>{error}</div>}

        {/* 변환 결과 */}
        {convertedAddress && !isConverting && (
          <div className={styles.section}>
            <label className={styles.label}>변환된 주소</label>
            <textarea
              className={styles.textarea}
              value={convertedAddress}
              readOnly
              rows={4}
            />
            <div className={styles.meta}>
              {country && <span>국가: {country}</span>}
              {typeof confidence === 'number' && (
                <span>신뢰도: {(confidence * 100).toFixed(0)}%</span>
              )}
              {notes && <span>비고: {notes}</span>}
            </div>
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
              <button
                className={styles.actionButton}
                onClick={openGoogleMaps}
              >
                지도에서 위치 확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
