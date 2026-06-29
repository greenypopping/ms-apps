import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OmniWord — Document Editor',
  description: 'A Microsoft Word replica built with HTML, CSS, and JavaScript.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
