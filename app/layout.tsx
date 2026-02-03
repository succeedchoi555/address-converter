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
                Home
              </Link>
              <Link href="/blog" className={styles.navLink}>
                Blog
              </Link>
              <Link href="/about" className={styles.navLink}>
                About
              </Link>
              <Link href="/policy" className={styles.navLink}>
                Policy
              </Link>
              <Link href="/contact" className={styles.navLink}>
                Contact
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  )
}
