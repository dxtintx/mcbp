import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'MCBlueprint — Minecraft Architect & Blueprint Editor',
  description:
    'Infinite 2D canvas blueprint planner and architect tool for Minecraft building designs. Create block maps, line drawings, circles, Bezier arcs, distance rulers, and vector text labels.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
