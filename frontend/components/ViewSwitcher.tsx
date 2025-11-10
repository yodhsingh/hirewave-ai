'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Briefcase, User } from 'lucide-react';

export function ViewSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const isHRView = pathname?.startsWith('/hr');
  const isApplicantView = pathname?.startsWith('/applicant');

  if (!isHRView && !isApplicantView) {
    return null; // Don't show on other pages
  }

  const handleSwitch = () => {
    if (isHRView) {
      router.push('/applicant/dashboard');
    } else {
      router.push('/hr/dashboard');
    }
  };

  // Outlined style by default, fills in on hover like Create Job button
  return (
    <Button
      onClick={handleSwitch}
      variant="outline"
      className="gap-2 bg-black/5 border-black/20 hover:bg-black hover:text-white hover:border-black text-gray-900 rounded-xl font-medium transition-all duration-300"
    >
      {isHRView ? (
        <>
          <User className="w-4 h-4" />
          <span>Switch to Candidate View</span>
        </>
      ) : (
        <>
          <Briefcase className="w-4 h-4" />
          <span>Switch to HR View</span>
        </>
      )}
    </Button>
  );
}
