'use client';

import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  className?: string;
}

export default function Footer({ className = '' }: FooterProps) {
  return (
    <footer className={`relative bg-[#0F0F0F] py-12 border-t border-white/10 ${className}`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-2">
            <Image src="/Brain.svg" alt="HireWave Logo" width={20} height={20} className="invert" />
            <span className="text-lg font-semibold text-white">HireWave.ai</span>
          </div>

          <div className="flex items-center gap-6 text-gray-500 text-sm">
            <span>© 2025 HireWave. All rights reserved.</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}