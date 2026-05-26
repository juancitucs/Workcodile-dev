import { useEffect, useRef } from 'react';
import { useApp } from './app-context';

/**
 * Componente que reproduce música navideña cuando el tema de Navidad está activo
 * - Se reproduce automáticamente al activar el tema
 * - Se detiene al desactivar el tema
 * - Volumen bajo para no ser intrusivo
 */
export function ChristmasMusicPlayer() {
    const { christmasTheme } = useApp();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Crear elemento de audio si no existe
        if (!audioRef.current) {
            audioRef.current = new Audio('/Campanas-Al-Activar-TemaNavidad.mp3');
            audioRef.current.volume = 0.3; // Volumen bajo
            audioRef.current.loop = false; // Solo una vez al activar
        }

        const audio = audioRef.current;

        if (christmasTheme) {
            // Reproducir cuando se activa el tema
            audio.currentTime = 0; // Reiniciar desde el principio
            audio.play().catch(error => {
                // Navegadores modernos pueden bloquear autoplay
                console.log('Autoplay bloqueado:', error);
            });
        } else {
            // Detener cuando se desactiva el tema
            audio.pause();
            audio.currentTime = 0;
        }

        // Cleanup
        return () => {
            if (audio) {
                audio.pause();
            }
        };
    }, [christmasTheme]);

    // Este componente no renderiza nada visible
    return null;
}
