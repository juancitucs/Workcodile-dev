import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header with avatar and name */}
            <div className="flex flex-col items-center text-center space-y-4">
                {/* Large avatar */}
                <Skeleton className="h-24 w-24 rounded-full" />

                {/* Name and level badge */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-40 mx-auto" />
                    <Skeleton className="h-5 w-24 mx-auto rounded-full" />
                </div>

                {/* Bio */}
                <div className="space-y-1 w-full max-w-xs">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mx-auto" />
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-16 mx-auto" />
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-24 mx-auto" />
                    </CardContent>
                </Card>
                <Card className="glass-card">
                    <CardContent className="p-4 text-center">
                        <Skeleton className="h-8 w-12 mx-auto mb-1" />
                        <Skeleton className="h-3 w-20 mx-auto" />
                    </CardContent>
                </Card>
            </div>

            {/* XP progress */}
            <Card className="glass-card">
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-full rounded-full" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </CardContent>
            </Card>

            {/* Recent posts */}
            <Card className="glass-card">
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
