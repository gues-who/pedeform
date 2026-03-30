import type { HTMLAttributes } from "react";

export function Spinner({
  className = "",
  size = "md",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-6 w-6 border-2", lg: "h-8 w-8 border-[3px]" };
  return (
    <span
      role="status"
      aria-label="Carregando…"
      className={`inline-block animate-spin rounded-full border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-zinc-100 ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
