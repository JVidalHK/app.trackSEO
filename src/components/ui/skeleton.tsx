export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface rounded-xl p-4 border border-border">
      <Skeleton className="h-4 w-32 mb-2" />
      <Skeleton className="h-3 w-24 mb-4" />
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
