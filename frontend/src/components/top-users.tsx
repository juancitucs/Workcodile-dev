import { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Trophy, Shield, Users, Loader2, AlertTriangle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// The extensive documentation comments have been removed for brevity,
// as the implementation now reflects the described functionality.

interface UserRank {
    id: string;
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    totalPosts: number;
    totalLikes: number;
}

const getLevelBadge = (level: number) => {
    if (level >= 17) {
        return { icon: Trophy, iconColor: '#9932CC', bgColor: 'bg-purple-900/20', borderColor: 'border-purple-500/50', label: 'Leyenda', animate: true, scale: 'scale-100', glow: true };
    } else if (level >= 13) {
        return { icon: Shield, iconColor: '#00BFFF', bgColor: 'bg-cyan-500/20', borderColor: 'border-cyan-500/50', label: 'Diamante', animate: false, scale: 'scale-110', glow: false };
    } else if (level >= 9) {
        return { icon: Shield, iconColor: '#FFD700', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', label: 'Oro', animate: false, scale: 'scale-100', glow: true };
    } else if (level >= 5) {
        return { icon: Shield, iconColor: '#E0E0E0', bgColor: 'bg-gray-400/20', borderColor: 'border-gray-400', label: 'Plata', animate: false, scale: 'scale-100', glow: false };
    } else {
        return { icon: Shield, iconColor: '#A1887F', bgColor: 'bg-amber-900/20', borderColor: 'border-amber-800/50', label: 'Madera', animate: false, scale: 'scale-100', glow: false };
    }
};

const UserRow = memo(function UserRow({ user, index }: { user: UserRank; index: number }) {
    const badge = getLevelBadge(user.level);
    const BadgeIcon = badge.icon;

    return (
        <div className="sidebar-item flex items-center space-x-2.5 p-2 cursor-pointer">
            <div className="flex-shrink-0 w-6 text-center">
                <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-sm">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="sidebar-item-title text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <span>{user.totalPosts} posts</span>
                    <span>•</span>
                    <span>{user.totalLikes} likes</span>
                </div>
            </div>
            <div className="flex-shrink-0">
                <Badge
                    variant="outline"
                    className={`${badge.bgColor} ${badge.borderColor} flex items-center space-x-0.5 px-1.5 py-0.5 ${badge.animate ? 'animate-pulse' : ''}`}
                >
                    <BadgeIcon
                        className={`h-2.5 w-2.5 ${badge.scale}`}
                        style={{ color: badge.iconColor, filter: badge.glow ? 'drop-shadow(0 0 2px currentColor)' : 'none' }}
                    />
                    <span className="font-bold text-[10px]" style={{ color: badge.iconColor }}>
                        {user.level}
                    </span>
                </Badge>
            </div>
        </div>
    );
});

const fetchTopUsers = async (): Promise<UserRank[]> => {
    const response = await fetch(`${API_BASE_URL}/api/users/top?limit=10`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const users: UserRank[] = await response.json();
    // Construct full avatar URL
    return users.map(user => ({
        ...user,
        avatar: user.avatar ? `${API_BASE_URL}/workcodile-files/${user.avatar}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`
    }));
};

export const TopUsersCard = memo(function TopUsersCard() {
    const { data: topUsers = [], isLoading, isError, error } = useQuery<UserRank[]>({
        queryKey: ['top-users'],
        queryFn: fetchTopUsers,
        staleTime: 60 * 1000, // 1 minute
    });

    if (isLoading) {
        return (
            <Card className="glass-card gradient-border shadow-modern">
                <CardContent className="pt-4 pb-3 px-4 flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="glass-card gradient-border shadow-modern">
                <CardContent className="pt-4 pb-3 px-4 flex flex-col justify-center items-center h-48 text-destructive">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <p className="text-sm font-semibold">Error al cargar usuarios</p>
                    <p className="text-xs">{error instanceof Error ? error.message : 'Unknown error'}</p>
                </CardContent>
            </Card>
        );
    }
    
    const top3Users = topUsers.slice(0, 3);

    return (
        <Card className="glass-card gradient-border shadow-modern">
            <CardContent className="pt-4 pb-3 px-4">
                <div className="space-y-2">
                    {top3Users.map((user, index) => (
                        <UserRow key={user.id} user={user} index={index} />
                    ))}
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mt-3">
                            <Users className="h-4 w-4 mr-2" />
                            Ver Top 10 Usuarios
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-500" />
                                Top 10 Usuarios
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-2 mt-4">
                            {topUsers.map((user, index) => (
                                <UserRow key={user.id} user={user} index={index} />
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
});
