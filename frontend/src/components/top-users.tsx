import { memo } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Trophy, Shield } from 'lucide-react';

/**
 * UserRank Interface
 * Represents a user in the Top Users leaderboard
 * 
 * BACKEND TODO: Replace MOCK_TOP_USERS with real data from API endpoint
 * Expected API: GET /api/users/top?limit=5
 * Should return users sorted by XP with calculated level
 */
interface UserRank {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    totalPosts: number;
    totalLikes: number;
}

/**
 * MOCK DATA - Static users for frontend visualization
 * DELETE THIS when backend is ready
 * 
 * XP System Info for Backend:
 * - Level 0→1: 100 XP
 * - Level 1→2: 200 XP  
 * - Level 2→3: 400 XP
 * - Formula: XP_required = 100 * (2^level)
 * - Max Level: 20
 * 
 * XP Sources:
 * - Create post: +10 XP
 * - Receive like on post: +5 XP
 * - Create comment: +3 XP
 * - Receive like on comment: +2 XP
 */
const MOCK_TOP_USERS: UserRank[] = [
    {
        id: '1',
        name: 'Juan Calizayassssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssssss',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Juan',
        level: 18,
        xp: 2621440, // Level 18 requires 100 * 2^18 = 26,214,400 total XP
        totalPosts: 145,
        totalLikes: 3240,
    },
    {
        id: '2',
        name: 'María Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
        level: 15,
        xp: 327680,
        totalPosts: 98,
        totalLikes: 2156,
    },
    {
        id: '3',
        name: 'Carlos Mendoza',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
        level: 14,
        xp: 163840,
        totalPosts: 76,
        totalLikes: 1845,
    },
    {
        id: '4',
        name: 'Ana Flores',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
        level: 12,
        xp: 40960,
        totalPosts: 54,
        totalLikes: 1234,
    },
    {
        id: '5',
        name: 'Diego Torres',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego',
        level: 3,
        xp: 20480,
        totalPosts: 42,
        totalLikes: 987,
    },
];

/**
 * Get medal tier configuration based on level
 * 5-Tier Medal System:
 * - Tier 1 (Madera): Levels 1-4 - Brown
 * - Tier 2 (Plata): Levels 5-8 - Silver
 * - Tier 3 (Oro): Levels 9-12 - Gold
 * - Tier 4 (Diamante): Levels 13-16 - Blue
 * - Tier 5 (Leyenda): Levels 17-20 - Purple
 */
const getLevelBadge = (level: number) => {
    if (level >= 17) {
        // Tier 5: Leyenda (17-20) - Purple with pulse
        return {
            icon: Trophy,
            iconColor: '#9932CC',
            bgColor: 'bg-purple-900/20',
            borderColor: 'border-purple-500/50',
            label: 'Leyenda',
            animate: true,
            scale: 'scale-100',
            glow: true,
        };
    } else if (level >= 13) {
        // Tier 4: Diamante (13-16) - Blue with larger size
        return {
            icon: Shield,
            iconColor: '#00BFFF',
            bgColor: 'bg-cyan-500/20',
            borderColor: 'border-cyan-500/50',
            label: 'Diamante',
            animate: false,
            scale: 'scale-110',
            glow: false,
        };
    } else if (level >= 9) {
        // Tier 3: Oro (9-12) - Gold with glow
        return {
            icon: Shield,
            iconColor: '#FFD700',
            bgColor: 'bg-yellow-500/20',
            borderColor: 'border-yellow-500/50',
            label: 'Oro',
            animate: false,
            scale: 'scale-100',
            glow: true,
        };
    } else if (level >= 5) {
        // Tier 2: Plata (5-8) - Silver with subtle border
        return {
            icon: Shield,
            iconColor: '#E0E0E0',
            bgColor: 'bg-gray-400/20',
            borderColor: 'border-gray-400',
            label: 'Plata',
            animate: false,
            scale: 'scale-100',
            glow: false,
        };
    } else {
        // Tier 1: Madera (1-4) - Brown
        return {
            icon: Shield,
            iconColor: '#A1887F',
            bgColor: 'bg-amber-900/20',
            borderColor: 'border-amber-800/50',
            label: 'Madera',
            animate: false,
            scale: 'scale-100',
            glow: false,
        };
    }
};

export const TopUsersCard = memo(function TopUsersCard() {
    return (
        <Card className="glass-card gradient-border shadow-modern">
            <CardContent className="pt-4 pb-3 px-4">
                <div className="space-y-2">
                    {MOCK_TOP_USERS.map((user, index) => {
                        const badge = getLevelBadge(user.level);
                        const BadgeIcon = badge.icon;

                        return (
                            <div
                                key={user.id}
                                className="flex items-center space-x-2.5 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                                {/* Rank Number */}
                                <div className="flex-shrink-0 w-6 text-center">
                                    <span className="text-sm font-bold text-muted-foreground">
                                        #{index + 1}
                                    </span>
                                </div>

                                {/* Avatar - Medium size */}
                                <Avatar className="h-10 w-10 border-2 border-primary/20">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="text-sm">{user.name.charAt(0)}</AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{user.name}</p>
                                    <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                                        <span>{user.totalPosts} posts</span>
                                        <span>•</span>
                                        <span>{user.totalLikes} likes</span>
                                    </div>
                                </div>

                                {/* Level Badge - Compact */}
                                <div className="flex-shrink-0">
                                    <Badge
                                        variant="outline"
                                        className={`${badge.bgColor} ${badge.borderColor} flex items-center space-x-0.5 px-1.5 py-0.5 ${badge.animate ? 'animate-pulse' : ''}`}
                                    >
                                        <BadgeIcon
                                            className={`h-2.5 w-2.5 ${badge.scale}`}
                                            style={{
                                                color: badge.iconColor,
                                                filter: badge.glow ? 'drop-shadow(0 0 2px currentColor)' : 'none'
                                            }}
                                        />
                                        <span
                                            className="font-bold text-[10px]"
                                            style={{ color: badge.iconColor }}
                                        >
                                            {user.level}
                                        </span>
                                    </Badge>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Backend Integration Note */}
                {/* TODO: Replace static data with API call
            const { data: topUsers } = useQuery('/api/users/top?limit=5')
        */}
            </CardContent>
        </Card>
    );
});
