import { Skeleton } from '@/components/ui/skeleton';

export default function VendorsLoading() {
  return (
    <div className="dashboard-scroll space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="metrics-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[7.5rem] rounded-[var(--radius-md)]" />
        ))}
      </div>
      <div className="vendors-insights-grid">
        <Skeleton className="h-80 rounded-[var(--radius-md)]" />
        <Skeleton className="h-80 rounded-[var(--radius-md)]" />
      </div>
      <Skeleton className="h-[28rem] rounded-[var(--radius-md)]" />
    </div>
  );
}
