import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'CFA Practice Platform | Master Your Exam',
  description: 'AI-powered CFA exam preparation with MCQ, Item Sets, and Essay practice. Get personalized feedback and track your progress.',
  keywords: ['CFA', 'exam prep', 'finance', 'Level I', 'Level II', 'Level III', 'practice questions'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
