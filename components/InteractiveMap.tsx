'use client'

import { useEffect, useRef, useState } from 'react'
import styles from './AddressConverter.module.css'

interface InteractiveMapProps {
  latitude: number
  longitude: number
  address: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function InteractiveMap({ latitude, longitude, address }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [useEmbed, setUseEmbed] = useState(false)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  // Google Maps 앱으로 이동
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
    window.open(url, '_blank')
  }

  // Google Maps JavaScript API 초기화
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    // API 키가 없으면 Embed 사용
    if (!apiKey) {
      setUseEmbed(true)
      return
    }

    // 이미 로드되어 있으면 지도 초기화
    if (window.google && window.google.maps && mapRef.current && !mapInstanceRef.current) {
      initializeMap(apiKey)
      return
    }

    // 스크립트가 이미 로드 중이면 대기
    if (document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      const checkInterval = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkInterval)
          initializeMap(apiKey)
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    // Google Maps JavaScript API 스크립트 로드
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      setMapLoaded(true)
      if (mapRef.current) {
        initializeMap(apiKey)
      }
    }
    script.onerror = () => {
      // API 로드 실패 시 Embed 사용
      setUseEmbed(true)
    }
    document.head.appendChild(script)

    return () => {
      // 정리
      if (markerRef.current) {
        markerRef.current = null
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude])

  const initializeMap = (apiKey: string) => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      return
    }

    const position = { lat: latitude, lng: longitude }

    // 지도 생성
    const map = new window.google.maps.Map(mapRef.current, {
      center: position,
      zoom: 17, // 상세한 확대 레벨
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
    })

    mapInstanceRef.current = map

    // 마커 생성
    const marker = new window.google.maps.Marker({
      position: position,
      map: map,
      title: address,
      animation: window.google.maps.Animation.DROP,
    })

    markerRef.current = marker

    // 정보창 (선택사항)
    const infoWindow = new window.google.maps.InfoWindow({
      content: `<div style="padding: 8px;"><strong>${address}</strong></div>`,
    })

    // 마커 클릭 시 정보창 표시
    marker.addListener('click', () => {
      infoWindow.open(map, marker)
    })

    // 마커 클릭 시 Google Maps 앱으로 이동
    marker.addListener('click', () => {
      openInGoogleMaps()
    })

    // 지도 로드 완료 후 약간의 애니메이션
    map.addListener('tilesloaded', () => {
      map.setZoom(17)
    })
  }

  // Embed 방식 사용
  if (useEmbed) {
    return (
      <div className={styles.mapContainer}>
        <div className={styles.mapOverlay} onClick={openInGoogleMaps}>
          <div className={styles.mapOverlayContent}>
            <span className={styles.mapOverlayText}>📍 Google Maps에서 열기</span>
          </div>
        </div>
        <iframe
          width="100%"
          height="500"
          style={{ border: 0, borderRadius: '8px', cursor: 'pointer' }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${latitude},${longitude}&output=embed&z=17`}
          onClick={openInGoogleMaps}
        />
      </div>
    )
  }

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapOverlay} onClick={openInGoogleMaps}>
        <div className={styles.mapOverlayContent}>
          <span className={styles.mapOverlayText}>📍 Google Maps에서 열기</span>
        </div>
      </div>
      <div ref={mapRef} className={styles.interactiveMap} />
      {!mapLoaded && (
        <div className={styles.mapLoading}>
          <div className={styles.mapSpinner}></div>
          <span>지도를 불러오는 중...</span>
        </div>
      )}
    </div>
  )
}
