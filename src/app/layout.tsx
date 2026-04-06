import type { Metadata } from 'next';
import '../styles/globals.css';
import Navigation from '../components/ui/Navigation';

export const metadata: Metadata = {
  title: 'F1 Analytics | Race Predictions & Driver Comparisons',
  description: 'Advanced Formula 1 analytics platform featuring ML race predictions, driver comparisons, historical data, and live race visualization.',
  keywords: 'F1, Formula 1, race predictions, driver stats, machine learning, motorsport analytics',
  openGraph: {
    title: 'F1 Analytics',
    description: 'ML-powered Formula 1 race predictions and driver analytics',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;500;600;700;800;900&family=Barlow:wght@300;400;500;600&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#080808] text-[#F5F5F5] min-h-screen">
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
        <footer className="border-t border-white/5 mt-20 py-8 px-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="f1-heading text-2xl">
              <span className="text-[#E10600]">F1</span> ANALYTICS
            </div>
            <p className="text-white/30 text-sm font-mono text-center">
              Data sourced from Ergast API & OpenF1 API · Built for portfolio demonstration · Not affiliated with Formula 1
            </p>
            <div className="flex gap-4 text-white/30 text-sm">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <span>·</span>
              <a href="#" className="hover:text-white transition-colors">About</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
