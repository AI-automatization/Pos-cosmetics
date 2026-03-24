import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'table' | 'card' | 'line';
  rows?: number;
  className?: string;
}

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded bg-gray-200', className)} />
  );
}

export function LoadingSkeleton({
  variant = 'table',
  rows = 6,
  className,
}: LoadingSkeletonProps) {
  if (variant === 'line') {
    return <SkeletonBox className={cn('h-4 w-full', className)} />;
  }

  if (variant === 'card') {
    return (
      <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 p-4">
            <SkeletonBox className="mb-3 h-32 w-full" />
            <SkeletonBox className="mb-2 h-4 w-3/4" />
            <SkeletonBox className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full overflow-hidden rounded-lg border border-gray-200', className)}>
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex gap-4">
          {[40, 25, 15, 20].map((w, i) => (
            <SkeletonBox key={i} className={`h-4 w-[${w}%]`} />
          ))}
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            <SkeletonBox className="h-4 w-[40%]" />
            <SkeletonBox className="h-4 w-[25%]" />
            <SkeletonBox className="h-4 w-[15%]" />
            <SkeletonBox className="h-4 w-[20%]" />
          </div>
        ))}
      </div>
    </div>
  );
}
