import { motion } from 'motion/react';
import { WorkCodileLogo } from './crocodile-icon';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';

// Loading Spinner con logo de WorkCodile
export function WorkCodileSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      className="inline-block"
    >
      <WorkCodileLogo className={`${sizeClasses[size]} text-primary`} />
    </motion.div>
  );
}

// Loading completo de página
export function PageLoader() {
  return (
    <div className="min-h-screen workcodile-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0, -10, 0]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="mb-6"
        >
          <WorkCodileLogo className="h-16 w-16 text-primary mx-auto" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          WorkCodile
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-6"
        >
          Cargando tu experiencia universitaria...
        </motion.p>

        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.6, duration: 1 }}
          className="w-64 h-1 bg-primary/20 rounded-full overflow-hidden mx-auto"
        >
          <motion.div
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="h-full w-1/3 bg-primary rounded-full"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

// Skeleton para PostCard
export function PostCardSkeleton() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-8 w-8" />
        </div>

        <div className="flex space-x-4">
          <div className="flex flex-col items-center space-y-1">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>

          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-4/5 mb-4" />
            
            <div className="flex space-x-2 mb-4">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>

            <div className="flex space-x-4">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-18" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Skeleton para Sidebar
export function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <Skeleton className="h-6 w-28 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Skeleton feed completo
export function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <PostCardSkeleton />
        </motion.div>
      ))}
    </div>
  );
}

// Floating action con loading
export function FloatingActionButton({ 
  onClick, 
  isLoading = false, 
  children 
}: { 
  onClick: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg shadow-primary/25 disabled:opacity-50 z-40"
    >
      {isLoading ? (
        <WorkCodileSpinner size="sm" />
      ) : (
        children
      )}
    </motion.button>
  );
}

// Pulse Loading Effect
export function PulseLoader({ text = "Cargando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center space-x-3 p-8">
      <div className="flex space-x-1">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
            className="w-2 h-2 bg-primary rounded-full"
          />
        ))}
      </div>
      <span className="text-muted-foreground text-sm">{text}</span>
    </div>
  );
}

// Success Animation
export function SuccessAnimation({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      onAnimationComplete={onComplete}
      className="flex items-center justify-center p-8"
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360]
        }}
        transition={{
          duration: 0.8,
          ease: "easeInOut"
        }}
        className="text-4xl"
      >
        ✅
      </motion.div>
    </motion.div>
  );
}