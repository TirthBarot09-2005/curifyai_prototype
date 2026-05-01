export default function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-6 bg-surface-700/50 rounded-lg w-48" />
        <div className="h-6 bg-surface-700/50 rounded-full w-20" />
      </div>
      <div className="h-4 bg-surface-700/50 rounded w-32" />
      <div className="flex gap-2">
        <div className="h-6 bg-surface-700/50 rounded-full w-16" />
        <div className="h-6 bg-surface-700/50 rounded-full w-20" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="h-16 bg-surface-700/50 rounded-xl" />
        <div className="h-16 bg-surface-700/50 rounded-xl" />
        <div className="h-16 bg-surface-700/50 rounded-xl" />
      </div>
    </div>
  );
}
