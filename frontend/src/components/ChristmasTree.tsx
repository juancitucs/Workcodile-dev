import { useApp } from './app-context';
import { motion } from 'motion/react';

/**
 * Árbol de Navidad decorativo para el sidebar
 * Solo se muestra cuando el tema navideño está activo
 */
export function ChristmasTree() {
    const { christmasTheme } = useApp();

    if (!christmasTheme) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="christmas-tree-container flex justify-center items-end py-4"
        >
            <div className="christmas-tree relative">
                {/* Estrella en la cima */}
                <motion.div
                    className="tree-star"
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    ⭐
                </motion.div>

                {/* Capas del árbol */}
                <div className="tree-layer tree-layer-1"></div>
                <div className="tree-layer tree-layer-2"></div>
                <div className="tree-layer tree-layer-3"></div>

                {/* Luces decorativas */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`tree-light tree-light-${i + 1}`}
                        animate={{
                            opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                    />
                ))}

                {/* Tronco */}
                <div className="tree-trunk"></div>
            </div>
        </motion.div>
    );
}
