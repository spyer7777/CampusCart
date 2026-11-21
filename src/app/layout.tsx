import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CampusCart - Open community marketplace',
  description: 'Create an account with any email to browse and post products for sale.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
