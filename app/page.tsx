'use client'

import AddressConverter from '@/components/AddressConverter'

export default function Home() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px'
    }}>
      <AddressConverter />
    </main>
  )
}
