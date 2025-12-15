import { memo } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Trophy, Shield, Users } from 'lucide-react';

/**
 * ============================================================================
 * SISTEMA DE TOP USUARIOS Y NIVELES - INTEGRACIÓN BACKEND (para Tux)
 * ============================================================================
 * 
 * Este componente muestra los usuarios con más XP (experiencia).
 * ESTADO ACTUAL: Usa datos mock estáticos (MOCK_TOP_USERS).
 * OBJETIVO: Conectar con API del backend para datos reales de MongoDB.
 * 
 * ============================================================================
 * --- MODELO MONGODB (Schema para User) ---
 * ============================================================================
 * 
 * // En el modelo User agregar estos campos:
 * {
 *   // ... campos existentes (email, password, name, avatar, etc.)
 *   
 *   // Sistema de XP y Niveles
 *   xp: { type: Number, default: 0 },
 *   level: { type: Number, default: 1 },
 *   
 *   // Estadísticas del usuario
 *   stats: {
 *     totalPosts: { type: Number, default: 0 },
 *     totalComments: { type: Number, default: 0 },
 *     totalLikesReceived: { type: Number, default: 0 },
 *     totalLikesGiven: { type: Number, default: 0 }
 *   },
 *   
 *   // Medallas desbloqueadas (opcional, para logros)
 *   badges: [{
 *     badgeId: String,
 *     unlockedAt: Date
 *   }]
 * }
 * 
 * ============================================================================
 * --- ENDPOINTS QUE TUX DEBE CREAR ---
 * ============================================================================
 * 
 * 1. GET /api/users/top?limit=5
 *    - Retorna los top N usuarios ordenados por XP descendente
 *    - Response: [{ id, name, avatar, level, xp, stats: { totalPosts, totalLikesReceived } }]
 *    - No requiere autenticación (es público)
 * 
 * 2. GET /api/users/:userId/stats
 *    - Retorna estadísticas detalladas de un usuario
 *    - Response: { xp, level, nextLevelXp, stats, badges }
 * 
 * 3. POST /api/users/:userId/add-xp (interno, llamado por otros servicios)
 *    - Body: { amount: number, source: 'post' | 'comment' | 'like_received' | 'like_given' }
 *    - Suma XP al usuario y recalcula su nivel
 *    - Retorna: { newXp, newLevel, leveledUp: boolean }
 * 
 * ============================================================================
 * --- SISTEMA DE XP Y NIVELES ---
 * ============================================================================
 * 
 * Fórmula de XP requerido por nivel:
 *   XP_para_nivel_N = 100 * (2 ^ (N - 1))
 *   
 *   Nivel 1: 0 XP (inicio)
 *   Nivel 2: 100 XP
 *   Nivel 3: 200 XP (total: 300)
 *   Nivel 4: 400 XP (total: 700)
 *   Nivel 5: 800 XP (total: 1500)
 *   ... y así sucesivamente
 *   Nivel 20: 52,428,800 XP (máximo)
 * 
 * Función para calcular nivel desde XP:
 * 
 * function calculateLevel(xp) {
 *   let level = 1;
 *   let xpRequired = 100;
 *   let totalXpRequired = 0;
 *   
 *   while (totalXpRequired + xpRequired <= xp && level < 20) {
 *     totalXpRequired += xpRequired;
 *     level++;
 *     xpRequired *= 2;
 *   }
 *   
 *   return level;
 * }
 * 
 * ============================================================================
 * --- FUENTES DE XP ---
 * ============================================================================
 * 
 * Acción                    | XP Ganado
 * --------------------------|----------
 * Crear post                | +10 XP
 * Recibir like en post      | +5 XP
 * Crear comentario          | +3 XP
 * Recibir like en comentario| +2 XP
 * Dar like (participación)  | +1 XP
 * 
 * ============================================================================
 * --- SISTEMA DE MEDALLAS (5 TIERS) ---
 * ============================================================================
 * 
 * Tier | Nombre    | Niveles | Color
 * -----|-----------|---------|--------
 * 1    | Madera    | 1-4     | Marrón (#8B4513)
 * 2    | Plata     | 5-8     | Plateado (#E0E0E0)
 * 3    | Oro       | 9-12    | Dorado (#FFD700)
 * 4    | Diamante  | 13-16   | Azul (#00BFFF)
 * 5    | Leyenda   | 17-20   | Púrpura (#9932CC)
 * 
 * ============================================================================
 * --- CÓMO CONECTAR (reemplazar MOCK_TOP_USERS) ---
 * ============================================================================
 * 
 * import { useQuery } from '@tanstack/react-query';
 * 
 * // En el componente TopUsersCard:
 * const { data: topUsers = [], isLoading } = useQuery({
 *   queryKey: ['top-users'],
 *   queryFn: () => fetch('/api/users/top?limit=5').then(r => r.json()),
 *   staleTime: 60000 // Refrescar cada minuto
 * });
 * 
 * // Luego reemplaza MOCK_TOP_USERS por topUsers en el map
 * 
 * ============================================================================
 * --- DÓNDE LLAMAR add-xp EN EL BACKEND ---
 * ============================================================================
 * 
 * En los controladores del backend:
 * 
 * // postController.js - Al crear un post
 * await addXpToUser(userId, 10, 'post');
 * 
 * // likeController.js - Al recibir un like en post
 * await addXpToUser(postAuthorId, 5, 'like_received');
 * 
 * // commentController.js - Al crear comentario
 * await addXpToUser(userId, 3, 'comment');
 * 
 * // likeController.js - Al dar un like
 * await addXpToUser(userId, 1, 'like_given');
 * 
 * ============================================================================
 */

/**
 * UserRank Interface
 * Represents a user in the Top Users leaderboard
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
 * TODO (Tux): DELETE THIS and replace with useQuery to /api/users/top
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
        level: 10,
        xp: 20480,
        totalPosts: 42,
        totalLikes: 987,
    },
    {
        id: '6',
        name: 'Lucía Ramírez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia',
        level: 8,
        xp: 12800,
        totalPosts: 35,
        totalLikes: 756,
    },
    {
        id: '7',
        name: 'Pedro Sánchez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',
        level: 7,
        xp: 6400,
        totalPosts: 28,
        totalLikes: 542,
    },
    {
        id: '8',
        name: 'Carmen Vega',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carmen',
        level: 6,
        xp: 3200,
        totalPosts: 22,
        totalLikes: 389,
    },
    {
        id: '9',
        name: 'Roberto Luna',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto',
        level: 5,
        xp: 1600,
        totalPosts: 18,
        totalLikes: 267,
    },
    {
        id: '10',
        name: 'Isabel Cruz',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabel',
        level: 4,
        xp: 800,
        totalPosts: 12,
        totalLikes: 145,
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

// Reusable component for rendering a single user row
const UserRow = memo(function UserRow({ user, index }: { user: UserRank; index: number }) {
    const badge = getLevelBadge(user.level);
    const BadgeIcon = badge.icon;

    return (
        <div
            className="sidebar-item flex items-center space-x-2.5 p-2 cursor-pointer"
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
                <p className="sidebar-item-title text-sm font-medium truncate">{user.name}</p>
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
});

// Top 3 Users (default display)
const TOP_3_USERS = MOCK_TOP_USERS.slice(0, 3);

export const TopUsersCard = memo(function TopUsersCard() {
    return (
        <Card className="glass-card gradient-border shadow-modern">
            <CardContent className="pt-4 pb-3 px-4">
                <div className="space-y-2">
                    {TOP_3_USERS.map((user, index) => (
                        <UserRow key={user.id} user={user} index={index} />
                    ))}
                </div>

                {/* Button to view all top 10 */}
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
                            {MOCK_TOP_USERS.map((user, index) => (
                                <UserRow key={user.id} user={user} index={index} />
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Backend Integration Note */}
                {/* TODO (Tux): Replace MOCK_TOP_USERS with API call
                    const { data: topUsers } = useQuery('/api/users/top?limit=10')
                */}
            </CardContent>
        </Card>
    );
});
