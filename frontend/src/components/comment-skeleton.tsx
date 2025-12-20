import { Skeleton } from './ui/skeleton';

export function CommentSkeleton({ depth = 0 }: { depth?: number }) {
    const marginLeft = depth * 24;

    return (
        <div
            className="bg-muted/30 rounded-lg p-3"
            style={{ marginLeft: `${marginLeft}px` }}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />

                <div className="flex-1 space-y-2">
                    {/* Author and date */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>

                    {/* Comment content */}
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-1">
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-4 w-6" />
                        <Skeleton className="h-6 w-6 rounded" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CommentSkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, index) => (
                <CommentSkeleton key={index} depth={index === 1 ? 1 : 0} />
            ))}
        </div>
    );
}
