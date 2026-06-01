export default function UsersLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="metrics-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="admin-panel-card h-28 rounded-[var(--radius-md)]" />
        ))}
      </div>
      <div className="admin-panel-card h-96 rounded-[var(--radius-md)]" />
    </div>
  );
}
