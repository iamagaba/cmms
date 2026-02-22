import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const WorkOrderDetailsSkeleton = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar Skeleton - Desktop only */}
      <div className="hidden lg:block w-[300px] flex-shrink-0 border-r border-border">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Overview Cards Skeleton */}
        <div className="border-b border-border bg-card p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stepper Skeleton */}
        <div className="border-b border-border bg-card p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                {i < 3 && <Skeleton className="h-0.5 w-20 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex border-b border-border px-4 bg-card">
          <div className="flex space-x-6 py-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {/* Main Info Card */}
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <Skeleton key={j} className="h-16 w-full" />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar Skeleton - Desktop only */}
      <div className="hidden lg:block w-80 border-l border-border bg-background">
        <div className="p-6 space-y-6">
          {/* Technician Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-9 w-full rounded-md" />
          </div>

          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>

            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-center">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-7 w-28" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
