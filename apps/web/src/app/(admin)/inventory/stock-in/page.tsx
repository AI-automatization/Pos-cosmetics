'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StockInModal } from '../StockInModal';
import { useCurrentUser } from '@/hooks/auth/useAuth';

export default function StockInPage() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.role === 'OWNER') {
      router.replace('/inventory');
    }
  }, [currentUser, router]);

  if (currentUser?.role === 'OWNER') return null;

  return (
    <StockInModal
      isOpen={true}
      onClose={() => router.push('/inventory')}
    />
  );
}
