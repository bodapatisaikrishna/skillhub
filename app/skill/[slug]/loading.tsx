/** Skeleton shown while a skill detail page loads during navigation. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="h-4 w-28 animate-pulse rounded bg-muted" />
      <div className="mt-6 space-y-3">
        <div className="h-9 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-5 w-full animate-pulse rounded bg-muted/70" />
        <div className="h-5 w-40 animate-pulse rounded bg-muted/70" />
      </div>
      <div className="mt-6 h-9 w-40 animate-pulse rounded-md bg-muted" />
      <div className="mt-10 space-y-3">
        <div className="h-6 w-24 animate-pulse rounded bg-muted" />
        <div className="h-24 w-full animate-pulse rounded-lg border border-border bg-muted/40" />
        <div className="h-24 w-full animate-pulse rounded-lg border border-border bg-muted/40" />
      </div>
    </div>
  );
}
