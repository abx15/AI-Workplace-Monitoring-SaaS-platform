import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Workplace Monitor',
  description: 'AI-powered workplace surveillance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}
        style={{ 
          backgroundColor: '#0F172A',
          color: '#F1F5F9',
          minHeight: '100vh'
        }}>
        {children}
        <Toaster 
          theme="dark" 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1E293B',
              border: '1px solid #334155',
              color: '#F1F5F9'
            }
          }}
        />
      </body>
    </html>
  )
}
