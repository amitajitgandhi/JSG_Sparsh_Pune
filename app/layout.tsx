import './globals.css'
import type { Metadata } from 'next'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MobileBackWrapper from './components/MobileBackWrapper'
import ScrollToTop from './components/ScrollToTop'
import DarkModeSync from './components/DarkModeSync'

export const metadata: Metadata = {
  title: 'JSG SPARSH Pune - Jain Social Group',
  description: 'JSG SPARSH Pune - Connecting the Jain community in Pune through social activities, cultural events, and community service.',
  keywords: 'JSG, SPARSH, Pune, Jain Social Group, community, events, cultural activities',
  authors: [{ name: 'JSG SPARSH Pune' }],
  openGraph: {
    title: 'JSG SPARSH Pune - Jain Social Group',
    description: 'Connecting the Jain community in Pune',
    type: 'website',
    locale: 'en_US',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="font-sans bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <DarkModeSync />
        <ScrollToTop />
        <MobileBackWrapper>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </MobileBackWrapper>
      </body>
    </html>
  )
}