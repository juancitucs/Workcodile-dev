import { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Trophy, Users, Loader2, AlertTriangle, Award } from 'lucide-react';
import { UserProfile } from './user-profile';

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

// Obtiene la imagen del badge según el nivel (niveles 1-10, después se repite el 10)
const getBadgeImage = (level: number): string => {
    // Limitar nivel entre 1 y 10 para las imágenes disponibles
    const badgeLevel = Math.min(Math.max(level, 1), 10);
    return `/badges/nivel${badgeLevel}.png`;
};

// XP requerido para cada nivel (basado en la fórmula: 100 * 2^(level-1))
const LEVEL_XP_REQUIREMENTS = [
    { level: 1, xp: 0, name: 'Cachimbo' },
    { level: 2, xp: 100, name: 'Aprendiz' },
    { level: 3, xp: 200, name: 'Junior' },
    { level: 4, xp: 400, name: 'Analista' },
    { level: 5, xp: 800, name: 'Profesional' },
    { level: 6, xp: 1600, name: 'Senior' },
    { level: 7, xp: 3200, name: 'Líder' },
    { level: 8, xp: 6400, name: 'Experto' },
    { level: 9, xp: 12800, name: 'Director' },
    { level: 10, xp: 25600, name: 'Referente Ápex' },
];

interface UserRowProps {
    user: UserRank;
    index: number;
    onUserClick: (userId: string) => void;
}

const UserRow = memo(function UserRow({ user, index, onUserClick }: UserRowProps) {
    const badgeImage = getBadgeImage(user.level);

    return (
        <div
            className="sidebar-item flex items-center space-x-2.5 p-3 cursor-pointer bg-muted/30 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => onUserClick(user.id)}
        >
            <div className="flex-shrink-0 w-6 text-center">
                <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
            </div>
            <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="text-sm">{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="sidebar-item-title text-sm font-medium truncate hover:text-primary transition-colors">{user.name}</p>
                <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <span>{user.totalPosts} posts</span>
                    <span>•</span>
                    <span>{user.totalLikes} likes</span>
                </div>
            </div>
            <div className="flex-shrink-0">
                {/* Imagen del badge según nivel - solo imagen, sin texto */}
                <img
                    src={badgeImage}
                    alt={`Nivel ${user.level}`}
                    className="level-badge-img h-12 w-12 object-contain"
                />
            </div>
        </div>
    );
});

// Componente para mostrar un nivel individual
const LevelCard = memo(function LevelCard({ levelInfo }: { levelInfo: typeof LEVEL_XP_REQUIREMENTS[0] }) {
    return (
        <div className="flex items-center p-3 rounded-lg bg-muted/30 hover:bg-primary/10 transition-colors">
            <img
                src={getBadgeImage(levelInfo.level)}
                alt={`Nivel ${levelInfo.level}`}
                className="level-badge-img h-12 w-12 object-contain mr-4"
            />
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">Nivel {levelInfo.level}</span>
                    <span className="text-sm text-muted-foreground">- {levelInfo.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                    {levelInfo.xp === 0 ? 'Nivel inicial' : `${levelInfo.xp.toLocaleString()} XP requerido`}
                </p>
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
    // Backend sends full URL or null, provide fallback if null
    return users.map(user => ({
        ...user,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
    }));
};

export const TopUsersCard = memo(function TopUsersCard() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const { data: topUsers = [], isLoading, isError, error } = useQuery<UserRank[]>({
        queryKey: ['top-users'],
        queryFn: fetchTopUsers,
        staleTime: 60 * 1000, // 1 minute
    });

    const handleUserClick = (userId: string) => {
        setSelectedUserId(userId);
    };

    const handleCloseProfile = () => {
        setSelectedUserId(null);
    };

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
        <>
            <Card className="glass-card gradient-border shadow-modern">
                <CardContent className="pt-4 pb-3 px-4">
                    <div className="space-y-2">
                        {top3Users.map((user, index) => (
                            <UserRow key={user.id} user={user} index={index} onUserClick={handleUserClick} />
                        ))}
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mt-3">
                                <Users className="h-4 w-4 mr-2" />
                                Ver Top 10 Usuarios
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
                            {/* Layout estilo libro - dos páginas lado a lado */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* PÁGINA IZQUIERDA - Top 10 Usuarios */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-border">
                                        <Trophy className="h-5 w-5 text-primary" />
                                        <h2 className="text-lg font-semibold">Top 10 Usuarios</h2>
                                    </div>
                                    <div className="space-y-2">
                                        {topUsers.map((user, index) => (
                                            <UserRow key={user.id} user={user} index={index} onUserClick={handleUserClick} />
                                        ))}
                                    </div>
                                </div>

                                {/* Divisor vertical (visible solo en desktop) */}
                                <div className="hidden lg:block absolute left-1/2 top-16 bottom-6 w-px bg-border" />

                                {/* PÁGINA DERECHA - Niveles Disponibles */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-border">
                                        <div className="flex items-center gap-2">
                                            <Award className="h-5 w-5 text-primary" />
                                            <h2 className="text-lg font-semibold">Niveles Disponibles</h2>
                                        </div>
                                        <p className="text-xs text-muted-foreground hidden sm:block">
                                            Gana XP: posts (+10), likes (+5), comments (+3)
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        {LEVEL_XP_REQUIREMENTS.map((levelInfo) => (
                                            <LevelCard key={levelInfo.level} levelInfo={levelInfo} />
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>

            {/* Modal de perfil de usuario */}
            <UserProfile
                isOpen={!!selectedUserId}
                onClose={handleCloseProfile}
                userId={selectedUserId || undefined}
            />
        </>
    );
});
