export interface AdminSkeletonProps {
  rows?: number;
  className?: string;
}

function AdminSkeleton({ rows = 1, className = "" }: AdminSkeletonProps) {
  return (
    <div className={`grid gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: Math.max(1, rows) }, (_, index) => (
        <span
          key={index}
          className="admin-skeleton"
          style={{ width: index === rows - 1 && rows > 1 ? "68%" : "100%" }}
        />
      ))}
    </div>
  );
}

export default AdminSkeleton;
