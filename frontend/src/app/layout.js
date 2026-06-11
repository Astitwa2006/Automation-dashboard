import './globals.css';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { SocketProvider } from '@/components/SocketProvider';
import Sidebar from '@/components/Sidebar';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Automation Dashboard — Mission Control',
  description: 'Real-time workflow monitoring and execution engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className={`${plexSans.className} flex h-screen overflow-hidden`}>
        <SocketProvider>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8 relative">
            {children}
          </main>
        </SocketProvider>
      </body>
    </html>
  );
}
