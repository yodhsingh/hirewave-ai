/**
 * PageWrapper Component
 *
 * Provides consistent layout structure with theme-ready styling
 * Uses centralized theme configuration from lib/theme
 */

import { ReactNode } from 'react';
import { gradients } from '@/lib/theme';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      {/* Background Effects - Using theme gradients */}
      <div className="fixed inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients.bgPrimary}`} />
        <div className={`absolute inset-0 bg-gradient-to-tr ${gradients.bgSecondary}`} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
