import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function PostCardSkeleton() {
    return (
        <Card className="glass-card overflow-hidden">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar skeleton */}
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            {/* Name */}
                            <Skeleton className="h-4 w-32" />
                            {/* Date and course */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                            </div>
                        </div>
                    </div>
                    {/* More button */}
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </CardHeader>
            <CardContent className="pt-2">
                {/* Title */}
                <Skeleton className="h-6 w-3/4 mb-3" />

                {/* Content lines */}
                <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                </div>

                {/* Hashtags */}
                <div className="flex gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-14 rounded-full" />
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-4">
                        {/* Votes */}
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        {/* Comments */}
                        <Skeleton className="h-8 w-24" />
                        {/* Share */}
                        <Skeleton className="h-8 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function PostCardSkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <PostCardSkeleton key={index} />
            ))}
        </div>
    );
}
