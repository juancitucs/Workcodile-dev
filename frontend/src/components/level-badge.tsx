import { memo } from 'react';

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

interface LevelBadgeProps {
    level: number;
    size?: 'sm' | 'md' | 'lg';
    customSize?: number; // Tamaño personalizado en píxeles (ej: 24 para 24px)
    className?: string;
}

// Obtiene la imagen del badge según el nivel (niveles 1-10, después se repite el 10)
const getBadgeImage = (level: number): string => {
    const badgeLevel = Math.min(Math.max(level, 1), 10);
    return badgeImages[badgeLevel];
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
