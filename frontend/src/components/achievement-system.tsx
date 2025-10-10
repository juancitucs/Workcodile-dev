import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner@2.0.3';
import { useApp } from './app-context';
import {
  Trophy,
  Star,
  Zap,
  Crown,
  Heart,
  BookOpen,
  MessageCircle,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Award,
  Gift,
  Sparkles,
  X
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'posting' | 'social' | 'engagement' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  reward: {
    points: number;
    badge?: string;
  };
}

const mockAchievements: Achievement[] = [
  {
    id: 'first-post',
    title: 'Primer Paso',
    description: 'Crear tu primera publicación en WorkCodile',
    icon: BookOpen,
    category: 'posting',
    rarity: 'common',
    progress: 1,
    maxProgress: 1,
    unlocked: true,
    unlockedAt: new Date(Date.now() - 86400000),
    reward: { points: 10, badge: 'Novato' }
  },
  {
    id: 'social-butterfly',
    title: 'Mariposa Social',
    description: 'Recibir 50 upvotes en tus publicaciones',
    icon: Heart,
    category: 'social',
    rarity: 'rare',
    progress: 23,
    maxProgress: 50,
    unlocked: false,
    reward: { points: 50, badge: 'Popular' }
  },
  {
    id: 'commentator',
    title: 'Comentarista Activo',
    description: 'Escribir 25 comentarios constructivos',
    icon: MessageCircle,
    category: 'engagement',
    rarity: 'common',
    progress: 18,
    maxProgress: 25,
    unlocked: false,
    reward: { points: 25 }
  },
  {
    id: 'trending-master',
    title: 'Maestro de Tendencias',
    description: 'Tener 3 publicaciones en trending al mismo tiempo',
    icon: TrendingUp,
    category: 'posting',
    rarity: 'epic',
    progress: 1,
    maxProgress: 3,
    unlocked: false,
    reward: { points: 100, badge: 'Influencer' }
  },
  {
    id: 'week-streak',
    title: 'Racha Semanal',
    description: 'Publicar todos los días durante una semana',
    icon: Calendar,
    category: 'posting',
    rarity: 'rare',
    progress: 4,
    maxProgress: 7,
    unlocked: false,
    reward: { points: 75 }
  },
  {
    id: 'legend',
    title: 'Leyenda de WorkCodile',
    description: 'Alcanzar 1000 puntos de reputación',
    icon: Crown,
    category: 'special',
    rarity: 'legendary',
    progress: 450,
    maxProgress: 1000,
    unlocked: false,
    reward: { points: 500, badge: 'Leyenda' }
  }
];

const rarityColors = {
  common: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
  rare: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  epic: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  legendary: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
};

const rarityNames = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario'
};

interface AchievementSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AchievementSystem({ isOpen, onClose }: AchievementSystemProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [achievements] = useState<Achievement[]>(mockAchievements);
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.reward.points, 0);
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'Todos', icon: Target },
    { id: 'posting', label: 'Publicaciones', icon: BookOpen },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'engagement', label: 'Participación', icon: MessageCircle },
    { id: 'special', label: 'Especiales', icon: Crown }
  ];

  const simulateUnlock = (achievementId: string) => {
    toast.success("¡Logro desbloqueado!", {
      description: "Has desbloqueado un nuevo logro. ¡Felicitaciones!",
      duration: 4000,
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Trophy className="h-8 w-8 text-primary" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold">Sistema de Logros</h2>
                <p className="text-muted-foreground">
                  {unlockedAchievements.length} de {achievements.length} logros desbloqueados • {totalPoints} puntos
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6">
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="grid w-full grid-cols-5 mb-6">
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger 
                      key={category.id} 
                      value={category.id}
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{category.label}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <div className="max-h-[500px] overflow-y-auto space-y-4">
                {filteredAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AchievementCard 
                      achievement={achievement} 
                      onUnlock={() => simulateUnlock(achievement.id)}
                    />
                  </motion.div>
                ))}
              </div>
            </Tabs>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  onUnlock: () => void;
}

function AchievementCard({ achievement, onUnlock }: AchievementCardProps) {
  const Icon = achievement.icon;
  const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
        achievement.unlocked 
          ? 'bg-primary/5 border-primary/30 shadow-primary/10 shadow-lg' 
          : 'bg-card border-border/50'
      }`}
    >
      {achievement.unlocked && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full p-2"
        >
          <Star className="h-4 w-4 fill-current" />
        </motion.div>
      )}

      <div className="p-6">
        <div className="flex items-start space-x-4">
          <motion.div
            animate={achievement.unlocked ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
            className={`p-3 rounded-xl ${
              achievement.unlocked 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            <Icon className="h-6 w-6" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className={`font-semibold ${
                achievement.unlocked ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {achievement.title}
              </h3>
              <Badge 
                className={`text-xs ${rarityColors[achievement.rarity]}`}
                variant="outline"
              >
                {rarityNames[achievement.rarity]}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground mb-3">
              {achievement.description}
            </p>

            {!achievement.unlocked && (
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium">
                    {achievement.progress} / {achievement.maxProgress}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {achievement.reward.points} pts
                </Badge>
                {achievement.reward.badge && (
                  <Badge variant="outline" className="text-xs">
                    <Award className="h-3 w-3 mr-1" />
                    {achievement.reward.badge}
                  </Badge>
                )}
              </div>

              {achievement.unlocked && achievement.unlockedAt && (
                <span className="text-xs text-muted-foreground">
                  Desbloqueado {new Date(achievement.unlockedAt).toLocaleDateString('es-ES')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Animated background for unlocked achievements */}
      {achievement.unlocked && (
        <motion.div
          animate={{
            background: [
              'linear-gradient(45deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)',
              'linear-gradient(225deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)',
              'linear-gradient(45deg, transparent 0%, rgba(34, 197, 94, 0.1) 50%, transparent 100%)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 pointer-events-none"
        />
      )}
    </motion.div>
  );
}