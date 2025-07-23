import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '../components/ui/toaster';
import { AuthButton } from '../components/AuthButton';
import { usePathname } from 'next/navigation';

export const metadata: Metadata = {
  title: 'WhiteMagic',
  description: 'A real-time collaborative whiteboard application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const showAuthButton = !pathname.includes('/whiteboard/');
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body className="font-body antialiased">
        <header className="flex justify-end p-4">
          {showAuthButton && <AuthButton />}
        </header>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
