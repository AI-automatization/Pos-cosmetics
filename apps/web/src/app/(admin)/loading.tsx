import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <LoadingSkeleton key={i} variant="card" rows={1} />
        ))}
      </div>
      <LoadingSkeleton variant="table" rows={8} />
    </div>
  );
}
