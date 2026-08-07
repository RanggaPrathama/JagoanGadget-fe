type FormSkeletonProps = {
  count?: number;
};

export function FormSkeleton({ count = 2 }: FormSkeletonProps) {
  return (
    <section className="admin-form-shell space-y-6 p-5 sm:p-6 lg:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-40 rounded-full bg-muted/70" />
        <div className="h-10 w-2/3 rounded-2xl bg-muted/60" />
        <div className="h-4 w-full max-w-2xl rounded-full bg-muted/50" />
      </div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${Math.min(count, 2)}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-[1.75rem] border border-border/60 bg-muted/30"
          />
        ))}
      </div>
    </section>
  );
}
