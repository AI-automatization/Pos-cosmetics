'use client';

import { useRouter } from 'next/navigation';
import { StockInModal } from '../StockInModal';

export default function StockInPage() {
  const router = useRouter();
  return (
    <StockInModal
      isOpen={true}
      onClose={() => router.push('/inventory')}
    />
  );
}
