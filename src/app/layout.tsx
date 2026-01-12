import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import SmoothScroll from '../components/smooth-scroll';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'MentisAI | Master Your CFA Exam',
    template: '%s | MentisAI'
  },
  metadataBase: new URL('https://cfa-exam.vercel.app'),
  description: 'AI-powered CFA exam preparation with MCQ and Item Sets. Get personalized feedback and track your progress with our smart study plan.',
  keywords: ['CFA Exam Prep', 'CFA Level 1', 'CFA Practice Questions', 'MentisAI', 'Financial Analyst Training', 'CFA Study Plan'],
  authors: [{ name: 'MentisAI Team' }],
  creator: 'MentisAI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cfa-exam.vercel.app',
    title: 'MentisAI | Master Your CFA Exam',
    description: 'The most advanced AI platform for CFA preparation.',
    siteName: 'MentisAI',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MentisAI CFA Exam Prep',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MentisAI | Master Your CFA Exam',
    description: 'Master the CFA exam with AI-powered personalized study plans.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <SmoothScroll>{children}</SmoothScroll>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
