import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'British English Memory Vault',
  description: 'A long-term memory system.',
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};
<head>
  <script dangerouslySetInnerHTML={{
    __html: `
      try {
        var local = localStorage.getItem('naharpaz_srs_settings');
        if (local && JSON.parse(local).theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    `
  }} />
</head>


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
