import { useState } from 'react';
import { motion } from 'motion/react';
import { CrocodileIcon, CrocodileEmoji } from './crocodile-icon';

interface CrocodileRatingProps {
  rating: number; // Current average rating (0-5)
  userRating?: number; // User's rating (0-5, 0 means no rating)
  totalRatings: number; // Total number of ratings
  onRate?: (rating: number) => void; // Callback when user rates
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean; // If true, user cannot rate
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg'
};

const crocodileSizes = {
  sm: 'text-sm',
  md: 'text-base', 
  lg: 'text-lg'
};

export function CrocodileRating({ 
  rating, 
  userRating = 0, 
  totalRatings, 
  onRate, 
  size = 'md',
  readonly = false 
}: CrocodileRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRate = (newRating: number) => {
    if (readonly || !onRate) return;
    
    setIsAnimating(true);
    onRate(newRating);
    
    // Reset animation after a short delay
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleMouseEnter = (index: number) => {
    if (!readonly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || userRating;
  const averageRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

  return (
    <div className="space-y-3">
      {/* Interactive crocodiles for user rating */}
      {!readonly && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {userRating > 0 ? `Tu calificación: ${userRating} cocodrilo${userRating !== 1 ? 's' : ''}` : 'Haz clic para calificar:'}
          </p>
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((index) => (
              <motion.button
                key={`user-${index}`}
                className={`${crocodileSizes[size]} transition-all duration-200 hover:scale-125 p-1 rounded-lg ${
                  index <= displayRating 
                    ? 'text-workcodile-green filter drop-shadow-lg bg-workcodile-green/10' 
                    : 'text-muted-foreground hover:text-workcodile-green/70 hover:bg-workcodile-green/5'
                }`}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={() => handleRate(index)}
                whileHover={{ scale: 1.25, y: -2 }}
                whileTap={{ scale: 0.95 }}
                animate={isAnimating && index <= (userRating || 0) ? { 
                  scale: [1, 1.4, 1],
                  rotate: [0, -15, 15, 0],
                  y: [0, -8, 0]
                } : {}}
                title={`Calificar con ${index} cocodrilo${index !== 1 ? 's' : ''}`}
              >
                <CrocodileEmoji className={crocodileSizes[size]} />
              </motion.button>
            ))}
          </div>
          {hoverRating > 0 && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-workcodile-green font-medium mt-2"
            >
              {hoverRating} cocodrilo{hoverRating !== 1 ? 's' : ''}
            </motion.p>
          )}
        </div>
      )}

      {/* Average rating display */}
      <div className="flex items-center justify-center space-x-3 border-t pt-3">
        <div className="flex items-center space-x-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((index) => (
              <span
                key={`avg-${index}`}
                className={`${crocodileSizes[size]} ${
                  index <= averageRating 
                    ? 'text-workcodile-green' 
                    : index - 0.5 <= averageRating
                    ? 'text-workcodile-green/50'
                    : 'text-muted-foreground/30'
                }`}
              >
                <CrocodileEmoji />
              </span>
            ))}
          </div>
        </div>
        
        <div className={`${sizeClasses[size]} text-center`}>
          <div className="font-semibold text-workcodile-green">{rating.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">
            {totalRatings} {totalRatings === 1 ? 'voto' : 'votos'}
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for use in post cards
export function CompactCrocodileRating({ 
  rating, 
  totalRatings, 
  size = 'sm' 
}: Pick<CrocodileRatingProps, 'rating' | 'totalRatings' | 'size'>) {
  const averageRating = Math.round(rating * 2) / 2;
  
  return (
    <div className="flex items-center space-x-2 bg-workcodile-green/5 rounded-lg p-2">
      <div className="flex items-center space-x-0.5">
        {[1, 2, 3, 4, 5].map((index) => (
          <motion.span
            key={index}
            whileHover={{ scale: 1.1 }}
            className={`${crocodileSizes[size]} transition-all ${
              index <= averageRating 
                ? 'text-workcodile-green filter drop-shadow-sm' 
                : index - 0.5 <= averageRating
                ? 'text-workcodile-green/50'
                : 'text-muted-foreground/30'
            }`}
          >
            <CrocodileEmoji />
          </motion.span>
        ))}
      </div>
      
      <div className="flex items-center space-x-1">
        <span className={`${sizeClasses[size]} text-workcodile-green font-semibold`}>
          {rating.toFixed(1)}
        </span>
        
        <span className={`text-xs text-muted-foreground`}>
          ({totalRatings})
        </span>
      </div>
    </div>
  );
}