import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <title>Earthquake Monitor</title>
        <meta name="description" content="Real-time earthquake monitoring dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="theme-color" content="#A2D4F2" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased bg-gradient-to-br from-[#A2D4F2] to-[#EAF6FB] min-h-screen">
        <main className="max-w-lg mx-auto pb-20">
          {children}
        </main>
      </body>
    </html>
  );
}
