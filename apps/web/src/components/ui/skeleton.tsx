import type { HTMLAttributes } from "react";

export function Skeleton({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 ${className}`}
      {...props}
    />
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <Skeleton className="mb-4 h-3 w-24" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`mb-2 h-4 ${i % 2 === 0 ? "w-full" : "w-3/4"}`}
        />
      ))}
    </div>
  );
}
