import { memo } from 'react';

interface LevelBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
    customSize?: number; // Tamaño personalizado en píxeles (ej: 24 para 24px)
    className?: string;
}

// Obtiene la imagen del badge según el nivel (niveles 1-10, después se repite el 10)
const getBadgeImage = (level: number): string => {
    const badgeLevel = Math.min(Math.max(level, 1), 10);
    return `/badges/nivel${badgeLevel}.png`;
};

// Tamaños predefinidos para el badge
const sizeClasses = {
    sm: 'h-4 w-4',   // 16px - Para comentarios y textos pequeños
    md: 'h-5 w-5',   // 20px - Para posts
    lg: 'h-8 w-8',   // 32px - Para perfil
};

/**
 * Componente reutilizable para mostrar la medalla de nivel del usuario.
 * Se puede usar en posts, comentarios, perfiles, etc.
 * 
 * Uso:
 *   <LevelBadge level={5} size="md" />           // Tamaño predefinido
 *   <LevelBadge level={5} customSize={24} />     // 24px exactos
 */
export const LevelBadge = memo(function LevelBadge({ level, size = 'md', customSize, className = '' }: LevelBadgeProps) {
    const badgeImage = getBadgeImage(level);

    // Si hay customSize, usar inline style; sino usar clases predefinidas
    const sizeClass = customSize ? '' : sizeClasses[size];
    const inlineStyle = customSize ? { width: `${customSize}px`, height: `${customSize}px` } : undefined;

    return (
        <img
            src={badgeImage}
            alt={`Nivel ${level}`}
            className={`level-badge-img ${sizeClass} object-contain inline-block ${className}`}
            style={inlineStyle}
            title={`Nivel ${level}`}
        />
    );
});

export default LevelBadge;
