export default function PayoutsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="h-8 w-56 rounded bg-muted" />
      <div className="metrics-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-panel-card h-28 rounded-[var(--radius-md)]" />
        ))}
      </div>
      <div className="vendors-insights-grid">
        <div className="admin-panel-card h-64 rounded-[var(--radius-md)]" />
        <div className="admin-panel-card h-64 rounded-[var(--radius-md)]" />
      </div>
      <div className="admin-panel-card h-96 rounded-[var(--radius-md)]" />
    </div>
  );
}
