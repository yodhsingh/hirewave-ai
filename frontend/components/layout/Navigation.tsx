'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';


interface NavigationProps {
  className?: string;
  theme?: 'light' | 'dark';
}

export default function Navigation({ className = '', theme = 'light' }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [navOpen, setNavOpen] = useState(false);



  const navigationItems = [
    { label: 'About', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Features', href: '/features' },
  ];

  // Theme-based styles
  const isDark = theme === 'dark';
  const textColor = isDark ? 'text-white' : 'text-black';
  const textColorMuted = isDark ? 'text-white/60' : 'text-black/60';
  const textColorHover = isDark ? 'hover:text-white' : 'hover:text-black';
  const logoFilter = isDark ? 'invert' : '';
  const buttonBg = isDark ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' : 'bg-[#2D2D2D] text-white hover:bg-[#1a1a1a]';
  const hamburgerBg = isDark ? 'border-white/20 bg-white/10 hover:bg-white/20' : 'border-black/10 bg-white/80 hover:bg-white';
  const hamburgerIcon = isDark ? 'text-white' : 'text-black';
  const dropdownBg = isDark ? 'bg-black/80 text-white border-white/20' : 'bg-white text-black border-black/10';
  const dropdownHover = isDark ? 'hover:bg-white/10' : 'hover:bg-black/5';

  return (
    <nav className={`relative z-50 px-6 lg:px-16 py-6 ${className}`}>
      <div className="max-w-[1400px] mx-auto relative flex items-center justify-between">
        {/* Logo with Brain.svg */}
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/Brain.svg" alt="Logo" width={24} height={24} className={logoFilter} />
          <span className={`text-xl font-semibold ${textColor}`}>
            HireWave.ai
          </span>
        </Link>

        {/* Navigation Links - centered absolutely */}
        <div className="hidden md:flex items-center space-x-10 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors text-sm ${
                pathname === item.href
                  ? `${textColor} font-medium`
                  : `${textColorMuted} ${textColorHover}`
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/login')}
            className={`${buttonBg} rounded-lg px-6 py-2.5 text-sm font-normal border ${isDark ? 'border-white/20' : 'border-transparent'}`}
          >
            Sign in
          </Button>
          {/* Mobile hamburger */}
          <button
            aria-label="Open navigation menu"
            onClick={() => setNavOpen((v) => !v)}
            className={`md:hidden w-10 h-10 rounded-lg border ${hamburgerBg} transition-colors flex items-center justify-center`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={hamburgerIcon}>
              <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile dropdown */}
        {navOpen && (
          <div className={`md:hidden absolute right-6 top-[64px] ${dropdownBg} rounded-xl shadow-xl border w-44 py-2 backdrop-blur-xl`}>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block w-full text-left px-4 py-2 text-sm ${dropdownHover} ${
                  pathname === item.href ? 'font-medium' : ''
                }`}
                onClick={() => setNavOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}