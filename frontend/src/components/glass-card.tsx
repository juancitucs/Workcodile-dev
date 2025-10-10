import { ReactNode, forwardRef } from 'react';
import { motion, MotionProps } from 'motion/react';
import { cn } from './ui/utils';

interface GlassCardProps extends MotionProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'accent';
  intensity?: 'light' | 'medium' | 'strong';
  hover?: boolean;
  glow?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ 
    children, 
    className, 
    variant = 'default', 
    intensity = 'medium',
    hover = true,
    glow = false,
    ...motionProps 
  }, ref) => {
    const baseClasses = "rounded-xl border transition-all duration-300";
    
    const variantClasses = {
      default: "bg-background/60 border-border/50",
      primary: "bg-primary/5 border-primary/20",
      secondary: "bg-secondary/60 border-secondary/50", 
      accent: "bg-accent/5 border-accent/20"
    };

    const intensityClasses = {
      light: "backdrop-blur-sm",
      medium: "backdrop-blur-md",
      strong: "backdrop-blur-lg"
    };

    const hoverClasses = hover ? "hover:bg-opacity-80 hover:border-opacity-70 hover:shadow-lg hover:-translate-y-1" : "";
    const glowClasses = glow ? "shadow-lg shadow-primary/10" : "";

    return (
      <motion.div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          intensityClasses[intensity],
          hoverClasses,
          glowClasses,
          className
        )}
        whileHover={hover ? { scale: 1.02 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        {...motionProps}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export default GlassCard;