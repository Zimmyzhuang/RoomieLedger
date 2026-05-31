import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'RoomieLedger',
  description: 'Split expenses with your roommates',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
