'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard for now
    // In a real app, you'd check authentication status here
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
