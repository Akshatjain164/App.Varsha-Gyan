import type { Metadata, Viewport } from 'next'
import { Orbitron, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'

const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-display',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap'
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Varsha-Gyan | Gamified STEM Learning Platform',
  description: 'Experience science like never before. Interactive simulations, gamified missions, and immersive learning for Class 6-12 students.',
  applicationName: 'Varsha-Gyan',
  appleWebApp: {
    capable: true,
    title: 'Varsha-Gyan',
    statusBarStyle: 'black-translucent',
  },
  keywords: ['STEM education', 'gamified learning', 'science simulations', 'physics experiments', 'chemistry lab', 'interactive education'],
  authors: [{ name: 'Varsha-Gyan' }],
  openGraph: {
    title: 'Varsha-Gyan | Gamified STEM Learning',
    description: 'Interactive STEM simulations for Class 6-12 students',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0891b2',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

