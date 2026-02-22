import { Skeleton } from "@/components/ui/skeleton";

export const WorkOrdersSkeleton = () => {
    return (
        <div className="w-full px-4 py-4 bg-background min-h-screen animate-in fade-in duration-500">
            <div className="flex flex-col gap-4">
                {/* Header Skeleton */}
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-24" />
                        <Skeleton className="h-9 w-28" />
                    </div>
                </div>

                {/* Controls Row Skeleton */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-muted rounded-md p-1 gap-1">
                        <Skeleton className="h-7 w-20 rounded-sm" />
                        <Skeleton className="h-7 w-20 rounded-sm" />
                        <Skeleton className="h-7 w-24 rounded-sm" />
                    </div>
                    <div className="flex-1" />
                    <Skeleton className="h-9 w-64 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>

                {/* Tabs Skeleton */}
                <div className="border-b border-border flex gap-4 pb-2 mt-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-6 rounded-md" />
                        </div>
                    ))}
                </div>

                {/* Table Skeleton */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                    {/* Table Header */}
                    <div className="p-3 border-b border-border bg-muted/40 flex justify-between">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-4 w-24" />
                        ))}
                    </div>
                    {/* Table Rows */}
                    <div className="divide-y divide-border">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="p-4 flex items-center justify-between gap-4">
                                <Skeleton className="h-5 w-20" /> {/* ID */}
                                <div className="flex-1 space-y-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-24 rounded-full" /> {/* Status */}
                                <Skeleton className="h-6 w-20 rounded-full" /> {/* Priority */}
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-md" /> {/* Action */}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
