import { memo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { Trophy, Users, Loader2, AlertTriangle, Award } from 'lucide-react';
import { UserProfile } from './user-profile';

// Importar imágenes de badges desde assets
import nivel1 from '../assets/nivel1.png';
import nivel2 from '../assets/nivel2.png';
import nivel3 from '../assets/nivel3.png';
import nivel4 from '../assets/nivel4.png';
import nivel5 from '../assets/nivel5.png';
import nivel6 from '../assets/nivel6.png';
import nivel7 from '../assets/nivel7.png';
import nivel8 from '../assets/nivel8.png';
import nivel9 from '../assets/nivel9.png';
import nivel10 from '../assets/nivel10.png';

// Mapa de imágenes de badges por nivel
const badgeImages: Record<number, string> = {
    1: nivel1,
    2: nivel2,
    3: nivel3,
    4: nivel4,
    5: nivel5,
    6: nivel6,
    7: nivel7,
    8: nivel8,
    9: nivel9,
    10: nivel10,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

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
    return badgeImages[badgeLevel];
};

// XP requerido para cada nivel (ACUMULATIVO - suma de todos los niveles anteriores)
// Backend usa: while (xp >= xpForNextLevel) { xp -= xpForNextLevel; level++; xpForNextLevel *= 2; }
const LEVEL_XP_REQUIREMENTS = [
    { level: 1, xp: 0, name: 'Cachimbo' },
    { level: 2, xp: 100, name: 'Aprendiz' },       // 100
    { level: 3, xp: 300, name: 'Junior' },         // 100 + 200 = 300
    { level: 4, xp: 700, name: 'Analista' },       // 300 + 400 = 700
    { level: 5, xp: 1500, name: 'Profesional' },   // 700 + 800 = 1500
    { level: 6, xp: 3100, name: 'Senior' },        // 1500 + 1600 = 3100
    { level: 7, xp: 6300, name: 'Líder' },         // 3100 + 3200 = 6300
    { level: 8, xp: 12700, name: 'Experto' },      // 6300 + 6400 = 12700
    { level: 9, xp: 25500, name: 'Director' },     // 12700 + 12800 = 25500
    { level: 10, xp: 51100, name: 'Referente Ápex' }, // 25500 + 25600 = 51100
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
                <p className="text-xs text-muted-foreground">
                    Nivel {user.level} - {LEVEL_XP_REQUIREMENTS.find(l => l.level === user.level)?.name || 'Cachimbo'}
                </p>
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
