import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'VibeFix — Ship Your AI-Generated Code in 72 Hours',
  description:
    'The guaranteed finishing layer for AI-generated code. Expert vibe coders fix your stuck Cursor, Replit, or Bolt project — or you don\'t pay.',
  openGraph: {
    title: 'VibeFix — Ship Your AI-Generated Code in 72 Hours',
    description:
      'Expert vibe coders fix your stuck AI project. Guaranteed outcomes or full refund.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
