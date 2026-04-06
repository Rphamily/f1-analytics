'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Flag, Sun, Moon } from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Race Weekend' },
  { href: '/predict', label: 'Predict' },
  { href: '/ml-ratings', label: 'ML Ratings', badge: 'ML' },
  { href: '/championship', label: 'Championship', badge: 'BAYES' },
  { href: '/simulator', label: 'Simulator', badge: 'MC' },
  { href: '/cards', label: 'Driver Cards' },
  { href: '/compare', label: 'Compare' },
  { href: '/history', label: 'History' },
  { href: '/standings', label: 'Standings' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('f1-theme');
    const isDark = saved ? saved === 'dark' : true;
    setDark(isDark);
    document.documentElement.classList.toggle('light-mode', !isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem('f1-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('light-mode', !next);
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'nav-scrolled backdrop-blur-md border-b shadow-2xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-[#E10600] rotate-45 transform group-hover:scale-110 transition-transform" />
            <Flag size={16} className="absolute inset-0 m-auto text-white" />
          </div>
          <span className="f1-heading text-2xl tracking-tight">
            <span className="text-[#E10600]">F1</span>
            <span className="nav-title"> ANALYTICS</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`nav-item text-sm transition-colors flex items-center gap-1.5 ${pathname === link.href ? 'nav-active' : 'nav-inactive'}`}>
              {link.label}
              {link.badge && <span className="text-white f1-mono rounded px-1.5 py-0.5" style={{ background: '#E10600', fontSize: '9px' }}>{link.badge}</span>}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="flex items-center gap-1.5 border rounded-full px-3 py-1.5 transition-all theme-btn">
            {dark ? <Sun size={13} /> : <Moon size={13} />}
            <span className="f1-mono text-xs hidden sm:block">{dark ? 'LIGHT' : 'DARK'}</span>
          </button>
          <div className="hidden sm:flex items-center gap-2 bg-[#E10600]/10 border border-[#E10600]/20 rounded-full px-3 py-1">
            <div className="w-2 h-2 bg-[#E10600] rounded-full animate-pulse" />
            <span className="f1-mono text-[#E10600] text-xs">LIVE</span>
          </div>
          <button className="md:hidden nav-inactive" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden mobile-menu border-t">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className={`flex items-center justify-between px-6 py-4 f1-subheading text-sm border-b mobile-link-border transition-colors ${pathname === link.href ? 'text-[#E10600] mobile-active' : 'mobile-inactive'}`}
              onClick={() => setMobileOpen(false)}>
              {link.label}
              {link.badge && <span className="text-white f1-mono rounded px-1.5 py-0.5 bg-[#E10600]" style={{ fontSize: '9px' }}>{link.badge}</span>}
            </Link>
          ))}
        </div>
      )}
      <div className="h-px bg-gradient-to-r from-transparent via-[#E10600] to-transparent opacity-50" />
    </nav>
  );
}

