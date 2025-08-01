import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '../components/ui/toaster';
import { ClientHeader } from '../components/ClientHeader';

export const metadata: Metadata = {
  title: 'WhiteMagic',
  description: 'A real-time collaborative whiteboard application.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <ClientHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}