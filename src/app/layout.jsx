import './globals.css';
import Link from 'next/link';
import { Activity, ShieldCheck, LayoutDashboard, Terminal, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'EdgeLink Technology — SEO Automation Dashboard',
  description: 'AI-Powered Full-Stack SEO Audit Automation Platform (Next.js 14 + BullMQ + Claude API)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 glass-panel border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-2 group">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 tracking-tight text-lg">EDGELINK</span>
                  <span className="text-brand-600 font-semibold text-xs ml-1.5 px-2 py-0.5 rounded-full bg-brand-50 border border-brand-200">
                    SEO AI
                  </span>
                </div>
              </Link>
            </div>

            <nav className="flex items-center space-x-1 sm:space-x-4">
              <Link
                href="/admin"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition-colors"
              >
                <Terminal className="w-4 h-4 text-slate-500" />
                <span>Admin Portal</span>
              </Link>

              <Link
                href="/client"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-700 hover:text-brand-700 hover:bg-slate-100 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-slate-500" />
                <span>Client Dashboard</span>
              </Link>

              <div className="hidden md:flex items-center space-x-2 pl-3 border-l border-slate-200">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                  Mocks Active (Zero-Cost)
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 text-slate-600">
                  BullMQ: Ready
                </span>
              </div>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-8rem)]">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/50 py-6 text-xs text-slate-500 text-center">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 EdgeLink Technology. SEO Automation Dashboard.</p>
            <p className="flex items-center space-x-1 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Next.js 14 • BullMQ • Claude API • Supabase/Neon</span>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
