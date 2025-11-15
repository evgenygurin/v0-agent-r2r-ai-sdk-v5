import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Sidebar } from '@/components/layout/sidebar'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

// Force dynamic rendering for all pages to prevent static generation errors
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Claude Code + R2R Integration',
  description: 'AI Agent Platform powered by Claude Code SDK and R2R',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <div className="flex h-screen">
          <div className="w-64">
            <Sidebar />
          </div>
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
