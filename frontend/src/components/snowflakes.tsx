import { useApp } from './app-context';

/**
 * Componente de copos de nieve animados
 * Solo se muestra cuando el tema navideño está activo
 * 20 copos de nieve cayendo con diferentes velocidades y tamaños
 */
export function Snowflakes() {
    const { christmasTheme } = useApp();

    // Solo renderizar si el tema navideño está activo
    if (!christmasTheme) return null;

    // Crear 20 copos de nieve
    const snowflakes = Array.from({ length: 20 }, (_, i) => (
        <div key={i} className="snowflake">
            ❄
        </div>
    ));

    return (
        <div className="snowflakes" aria-hidden="true">
            {snowflakes}
        </div>
    );
}
