import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useApp } from './app-context';
import { WorkCodileLogo } from './crocodile-icon';
import { 
  Users, 
  BookOpen, 
  MessageCircle, 
  TrendingUp,
  Clock,
  GraduationCap,
  Star,
  Trophy,
  Zap
} from 'lucide-react';

export function HeroSection() {
  const { posts, user } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stats = {
    totalPosts: posts.length,
    totalComments: posts.reduce((acc, post) => acc + post.comments.length, 0),
    activeUsers: Math.floor(Math.random() * 50) + 20, // Simulado
    trending: posts.filter(post => (post.upvotes - post.downvotes) > 5).length
  };

  const greetingTime = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              rotate: [360, 0],
              scale: [1.1, 1, 1.1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/5 rounded-full blur-xl"
          />
        </div>

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            {/* Welcome Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <motion.div
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <WorkCodileLogo className="h-8 w-8 text-primary" />
                </motion.div>
                <div>
                  <motion.h1 
                    className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {greetingTime()}, {user?.name.split(' ')[0]}
                  </motion.h1>
                  <motion.p 
                    className="text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Bienvenido de vuelta a WorkCodile - UNAM
                  </motion.p>
                </div>
              </div>

              <motion.div 
                className="flex flex-wrap gap-2 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentTime.toLocaleTimeString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Badge>
                <Badge variant="secondary" className="bg-accent/10 text-accent-foreground border-accent/20">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  Ing. Sistemas
                </Badge>
                <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                  <Zap className="h-3 w-3 mr-1" />
                  En línea
                </Badge>
              </motion.div>
            </div>

            {/* Stats Grid */}
            <motion.div 
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
            >
              <StatCard 
                icon={BookOpen}
                value={stats.totalPosts}
                label="Publicaciones"
                color="text-blue-500"
                bgColor="bg-blue-500/10"
                delay={0.9}
              />
              <StatCard 
                icon={MessageCircle}
                value={stats.totalComments}
                label="Comentarios"
                color="text-green-500"
                bgColor="bg-green-500/10"
                delay={1.0}
              />
              <StatCard 
                icon={Users}
                value={stats.activeUsers}
                label="En línea"
                color="text-purple-500"
                bgColor="bg-purple-500/10"
                delay={1.1}
              />
              <StatCard 
                icon={TrendingUp}
                value={stats.trending}
                label="Trending"
                color="text-orange-500"
                bgColor="bg-orange-500/10"
                delay={1.2}
              />
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div 
            className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <Button 
              variant="default" 
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-primary/25"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Nueva Publicación
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-primary/5">
              <Star className="h-4 w-4 mr-2" />
              Favoritos
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-accent/5">
              <Trophy className="h-4 w-4 mr-2" />
              Logros
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  color: string;
  bgColor: string;
  delay: number;
}

function StatCard({ icon: Icon, value, label, color, bgColor, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      className="text-center"
    >
      <div className={`inline-flex p-3 rounded-xl ${bgColor} mb-2`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <motion.p 
        className="text-2xl font-bold"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
      >
        {value}
      </motion.p>
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
    </motion.div>
  );
}