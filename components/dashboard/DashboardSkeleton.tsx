import { Skeleton } from "@/components/motion/Skeleton";

/** Esqueleto elegante que imita el layout real mientras "carga". */
export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-9 w-64" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-3xl glass p-5 shadow-glass">
            <Skeleton className="h-11 w-11 rounded-2xl" />
            <Skeleton className="mt-4 h-3.5 w-24" />
            <Skeleton className="mt-2 h-8 w-28" />
            <Skeleton className="mt-5 h-9 w-32 rounded-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-3xl glass p-6 shadow-glass">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-5 w-28" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
            <Skeleton className="mt-5 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-3xl glass p-6 shadow-glass lg:col-span-3">
          <Skeleton className="h-5 w-40" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <div className="rounded-3xl glass p-6 shadow-glass lg:col-span-2">
          <Skeleton className="h-5 w-36" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
