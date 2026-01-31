import type { Metadata } from 'next'
import Script from 'next/script'
import Link from 'next/link'
import './globals.css'
import styles from './layout.module.css'

export const metadata: Metadata = {
  title: 'Address Converter',
  description: 'Convert addresses between languages with administrative accuracy',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3688726950717466"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <nav className={styles.nav}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.logo}>
              Address Converter
            </Link>
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>
                홈
              </Link>
              <Link href="/blog" className={styles.navLink}>
                블로그
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
