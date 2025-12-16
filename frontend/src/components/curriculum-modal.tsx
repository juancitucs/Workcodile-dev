import { useState, useMemo, memo, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { GraduationCap, ArrowRight, Lock, Check } from 'lucide-react';
import { useApp } from './app-context';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// === TYPES ===
// Local Course interface to avoid conflicts with global types.ts
interface Course {
    _id: string;
    name: string;
    cycle: number;
    prerequisites: string[];
    type: 'general' | 'basic' | 'specialty' | 'elective' | 'practice'; // Added type for styling
    code: string; // Added for display
}

interface CycleData {
    cycle: number;
    courses: Course[];
}

interface CurriculumModalProps {
    trigger: React.ReactNode;
}

// === STYLING CONSTANTS (using hex values for inline styles) ===
const COURSE_TYPE_COLORS: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a' },      // blue
    basic: { bg: '#ecfdf5', border: '#34d399', text: '#064e3b' },        // basic
    specialty: { bg: '#faf5ff', border: '#c084fc', text: '#581c87' },    // purple
    elective: { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12' },     // orange
    practice: { bg: '#fdf2f8', border: '#f472b6', text: '#831843' },     // pink
};

// Progressive cycle colors - lighter to darker
const CYCLE_COLORS: Record<number, { bg: string; text: string }> = {
    1: { bg: '#E8EAF6', text: '#1a1a2e' },
    2: { bg: '#C5CBE9', text: '#1a1a2e' },
    3: { bg: '#9FA8DA', text: '#1a1a2e' },
    4: { bg: '#7986CB', text: '#ffffff' },
    5: { bg: '#5C6BC0', text: '#ffffff' },
    6: { bg: '#3F51B5', text: '#ffffff' },
    7: { bg: '#394AAE', text: '#ffffff' },
    8: { bg: '#3140A5', text: '#ffffff' },
    9: { bg: '#29379D', text: '#ffffff' },
    10: { bg: '#1B278D', text: '#ffffff' },
};

// Helper function to convert UPPERCASE to Title Case
function toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

// Helper function to convert numbers to Roman numerals
function toRoman(num: number): string {
    const romanNumerals: Record<number, string> = {
        1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
        6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X'
    };
    return romanNumerals[num] || num.toString();
}

// Helper function to create short abbreviations
function getShortName(fullName: string): string {
    const abbreviations: Record<string, string> = {
        'FUNDAMENTOS DE PROGRAMACION': 'F. Programacion',
        'MATEMATICA I': 'Matemática 1',
        'MATEMATICA II': 'Matemática 2',
        'MATEMATICA III': 'Matemática 3',
        'MATEMATICA IV': 'Matemática 4',
        'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO': 'Metodología',
        'REDACCION Y COMUNICACION': 'Redacción',
        'FILOSOFIA': 'Filosofía',
        'SOCIOLOGIA Y REALIDAD NACIONAL': 'Sociología',
        'BIOLOGIA Y MEDIO AMBIENTE': 'Biología',
        'ESTRUCTURA DE DATOS': 'Est. Datos',
        'PROGRAMACION ORIENTADA A OBJETOS I': 'POO 1',
        'PROGRAMACION ORIENTADA A OBJETOS II': 'POO 2',
        'ALGEBRA LINEAL': 'Álg. Lineal',
        'MATEMATICAS DISCRETAS I': 'M. Discretas 1',
        'MATEMATICAS DISCRETAS II': 'MDiscretas 2',
        'ESTADISTICA BASICA': 'Estadística',
        'ETICA': 'Ética',
        'ANALISIS Y DISEÑO DE ALGORITMOS': 'ADA',
        'FUNDAMENTOS DE SISTEMAS DE INFORMACION': 'Fund. Sistemas',
        'PROBABILIDADES': 'Probabilidad',
        'FISICA ELECTRICA': 'Física Eléc.',
        'ALGORITMOS PARALELOS': 'Algo. Paralelos',
        'ANALISIS Y DISEÑO DE SISTEMAS I': 'ADS 1',
        'ANALISIS Y DISEÑO DE SISTEMAS II': 'ADS 2',
        'BASE DE DATOS I': 'BD 1',
        'BASE DE DATOS II': 'BD 2',
        'SISTEMAS OPERATIVOS': 'Sist. Operativos',
        'CIRCUITOS ELECTRICOS Y ELECTRONICOS': 'Circuitos Elec.',
        'INVESTIGACION OPERATIVA I': 'Inv. Operat. 1',
        'INVESTIGACION OPERATIVA II': 'Inv. Operat.2',
        'SISTEMAS DISTRIBUIDOS': 'Sist. Distribuidos',
        'APLICACIONES WEB I': 'App Web 1',
        'APLICACIONES WEB II': 'App Web 2',
        'METODOS NUMERICOS': 'Mét. Numéricos',
        'SISTEMAS DIGITALES': 'Sist. Digitales',
        'INGENIERIA DE SOFTWARE': 'Ing. Software',
        'BUSINESS INTELLIGENCE': 'Business Intel.',
        'PROGRAMACION DE DISPOSITIVOS MOVILES I': 'Pro. Móviles 1',
        'PROGRAMACION DE DISPOSITIVOS MOVILES II': 'Pro. Móviles 2',
        'REALIDAD AUMENTADA': 'Realidad Aum.',
        'ARQUITECTURA DE COMPUTADORAS': 'Arq. Comp.',
        'DATA MINING': 'Data Mining',
        'CALIDAD DE SOFTWARE': 'Calidad SW',
        'PROGRAMACION DE VIDEO JUEGOS I': 'Videojuego 1 ',
        'PROGRAMACION DE VIDEO JUEGOS II': 'Videojuego 2',
        'REDES I': 'Redes 1',
        'REDES II': 'Redes 2',
        'LENGUAJE DE BAJO NIVEL': 'Bajo Nivel',
        'CLOUD COMPUTING': 'Cloud Comp.',
        'PROCESAMIENTO DE IMAGENES Y VIDEOS': 'Proc. Img/Video',
        'PROYECTO DE INVESTIGACION I': 'Proy. Invest. 1',
        'PROYECTO DE INVESTIGACION II': 'Proy. Invest. 2',
        'INTERACCION HUMANO COMPUTADOR': 'HCI',
        'ROBOTICA I': 'Robótica 1',
        'ROBOTICA II': 'Robótica 2',
        'INTELIGENCIA ARTIFICIAL I': 'IA 1',
        'INTELIGENCIA ARTIFICIAL II': 'IA 2',
        'SEGURIDAD INFORMATICA': 'Seg. Inform.',
        'FORMACION DE EMPRESAS CON BASE TECNOLOGICA': 'Form. Empresas',
        'PROYECTOS INFORMATICOS I': 'Proy. Informat. 1',
        'PROYECTOS INFORMATICOS II': 'Proy. Informat. 2',
        'AUDITORIA DE SISTEMAS DE INFORMACION': 'Auditoría SI',
        'SEGURIDAD DE LA INFORMACION': 'Seg. Info.',
        'SEMINARIO DE TESIS': 'Sem. Tesis',
    };

    return abbreviations[fullName] || toTitleCase(fullName);
}

// === RECURSIVE HELPER FUNCTIONS ===
function getAllPrerequisites(courseId: string, prereqMap: Record<string, string[]>): string[] {
    const result: string[] = [];
    const visited = new Set<string>();

    function recurse(id: string) {
        if (visited.has(id)) return;
        visited.add(id);

        const directPrereqs = prereqMap[id] || [];
        for (const prereqId of directPrereqs) {
            result.push(prereqId);
            recurse(prereqId);
        }
    }

    recurse(courseId);
    return result;
}

function getAllDescendants(courseId: string, unlocksMap: Record<string, string[]>): string[] {
    const result: string[] = [];
    const visited = new Set<string>();

    function recurse(id: string) {
        if (visited.has(id)) return;
        visited.add(id);

        const directUnlocks = unlocksMap[id] || [];
        for (const unlockId of directUnlocks) {
            result.push(unlockId);
            recurse(unlockId);
        }
    }

    recurse(courseId);
    return result;
}

// === MAIN COMPONENT ===
export const CurriculumModal = memo(function CurriculumModal({ trigger }: CurriculumModalProps) {
    const { user, authStatus } = useApp(); // Use auth context
    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const courseRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all courses
    useEffect(() => {
        const fetchAllCourses = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses`);
                if (!response.ok) {
                    throw new Error('Failed to fetch all courses');
                }
                const data: Course[] = await response.json();
                setAllCourses(data.map(c => ({...c, code: c._id, type: 'basic'}))); // Add default type and code
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllCourses();
    }, []);

    // Fetch user's completed courses
    useEffect(() => {
        const fetchCompletedCourses = async () => {
            if (authStatus !== 'authenticated' || !user) {
                setCompletedCourses(new Set());
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_BASE_URL}/api/settings/completed-courses`, {
                    headers: {
                        'x-auth-token': token || '',
                    },
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch completed courses');
                }
                const data: string[] = await response.json();
                setCompletedCourses(new Set(data));
            } catch (err: any) {
                console.error('Error fetching completed courses:', err);
                setError(err.message);
            }
        };
        fetchCompletedCourses();
    }, [authStatus, user]);


    // Group courses by cycle for rendering
    const curriculumByCycle = useMemo(() => {
        const cyclesMap = new Map<number, Course[]>();
        allCourses.forEach(course => {
            if (!cyclesMap.has(course.cycle)) {
                cyclesMap.set(course.cycle, []);
            }
            cyclesMap.get(course.cycle)?.push(course);
        });

        return Array.from(cyclesMap.entries())
            .sort(([cycleA], [cycleB]) => cycleA - cycleB)
            .map(([cycle, courses]) => ({ cycle, courses }));
    }, [allCourses]);

    // Build maps for prerequisites and unlocks
    const { prereqMap, unlocksMap } = useMemo(() => {
        const prereqMap: Record<string, string[]> = {};
        const unlocksMap: Record<string, string[]> = {};

        allCourses.forEach(course => {
            prereqMap[course._id] = course.prerequisites || [];
            course.prerequisites?.forEach(prereqId => {
                if (!unlocksMap[prereqId]) unlocksMap[prereqId] = [];
                unlocksMap[prereqId].push(course._id);
            });
        });

        return { prereqMap, unlocksMap };
    }, [allCourses]);

    // Get highlighted IDs
    const highlighted = useMemo(() => {
        if (!hoveredCourseId) return { prereqs: [], unlocks: [] };
        return {
            prereqs: getAllPrerequisites(hoveredCourseId, prereqMap),
            unlocks: getAllDescendants(hoveredCourseId, unlocksMap),
        };
    }, [hoveredCourseId, prereqMap, unlocksMap]);

    // State to trigger arrow recalculation
    const [arrowTrigger, setArrowTrigger] = useState(0);

    // Toggle curso completado via API
    const toggleCourseCompletion = useCallback(async (courseId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Evita activar el click de la tarjeta

        if (authStatus !== 'authenticated' || !user) {
            alert('Debes iniciar sesión para marcar cursos como completados.');
            return;
        }

        const isCurrentlyCompleted = completedCourses.has(courseId);
        const token = localStorage.getItem('token');

        // Optimistic UI update
        setCompletedCourses(prev => {
            const newSet = new Set(prev);
            if (isCurrentlyCompleted) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });

        try {
            const method = isCurrentlyCompleted ? 'DELETE' : 'POST';
            const url = isCurrentlyCompleted
                ? `${API_BASE_URL}/api/settings/completed-courses/${courseId}`
                : `${API_BASE_URL}/api/settings/completed-courses`;

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token || '',
                },
                body: method === 'POST' ? JSON.stringify({ courseId }) : undefined,
            });

            if (!response.ok) {
                throw new Error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'add'} completed course`);
            }

            // Backend response contains the updated list, reconcile if needed
            // For now, optimistic update is sufficient, if it fails, the catch block will revert.
        } catch (err) {
            console.error('Error toggling course completion:', err);
            // Revert optimistic UI update on error
            setCompletedCourses(prev => {
                const newSet = new Set(prev);
                if (isCurrentlyCompleted) { // if it was completed, add it back
                    newSet.add(courseId);
                } else { // if it was not completed, remove the added one
                    newSet.delete(courseId);
                }
                return newSet;
            });
            alert('Error al actualizar el estado del curso. Por favor, inténtalo de nuevo.');
        }
    }, [completedCourses, authStatus, user]);


    // Calculate ALL arrows (always visible)
    const allArrows = useMemo(() => {
        if (!containerRef.current || arrowTrigger === 0) return [];

        const containerRect = containerRef.current.getBoundingClientRect();
        const newArrows: { x1: number; y1: number; x2: number; y2: number; from: string; to: string }[] = [];

        // Draw arrows for ALL prerequisite relationships
        curriculumByCycle.forEach(cycle => {
            cycle.courses.forEach(course => {
                const prereqs = course.prerequisites || [];
                prereqs.forEach(prereqId => {
                    const fromEl = courseRefs.current[prereqId];
                    const toEl = courseRefs.current[course._id]; // Use _id

                    if (fromEl && toEl) {
                        const fromRect = fromEl.getBoundingClientRect();
                        const toRect = toEl.getBoundingClientRect();

                        newArrows.push({
                            x1: fromRect.right - containerRect.left,
                            y1: fromRect.top + fromRect.height / 2 - containerRect.top,
                            x2: toRect.left - containerRect.left,
                            y2: toRect.top + toRect.height / 2 - containerRect.top,
                            from: prereqId,
                            to: course._id, // Use _id
                        });
                    }
                });
            });
        });

        return newArrows;
    }, [arrowTrigger, curriculumByCycle]);

    // State to track if dialog is open
    const [isOpen, setIsOpen] = useState(false);

    // Trigger arrow recalculation when dialog opens
    useEffect(() => {
        if (isOpen) {
            const recalc = () => setArrowTrigger(t => t + 1);

            // Multiple delayed recalculations to ensure layout is stable
            const timer1 = setTimeout(recalc, 100);
            const timer2 = setTimeout(recalc, 300);
            const timer3 = setTimeout(recalc, 500);

            window.addEventListener('resize', recalc);

            // Add scroll listener to container
            const container = containerRef.current;
            if (container) {
                container.addEventListener('scroll', recalc);
            }

            return () => {
                clearTimeout(timer1);
                clearTimeout(timer2);
                clearTimeout(timer3);
                window.removeEventListener('resize', recalc);
                if (container) {
                    container.removeEventListener('scroll', recalc);
                }
            };
        }
    }, [isOpen]);

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-3">
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Malla Curricular - Ingeniería de Sistemas
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center">Cargando malla curricular...</div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>{trigger}</DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 pb-3">
                        <DialogTitle className="flex items-center gap-2">
                            <GraduationCap className="h-6 w-6" />
                            Malla Curricular - Ingeniería de Sistemas
                        </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 text-center text-red-500">Error: {error}</div>
                </DialogContent>
            </Dialog>
        );
    }


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-[95vw] max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-3">
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />
                        Malla Curricular - Ingeniería de Sistemas
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-2 bg-muted/30 border-y flex flex-wrap gap-x-6 gap-y-1 text-xs">
                    {/* Course type */}
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ecfdf5', border: '1px solid #34d399' }} />
                        <span>Curso</span>
                    </div>

                    {/* Completed */}
                    <div className="flex items-center gap-1.5" style={{ marginLeft: '5px' }}>
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: '#C5CBE9', border: '1px solid #5C6BC0' }} />
                        <span>Completado</span>
                    </div>

                    {/* Connections legend */}
                    <div className="border-l border-border pl-4 flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-amber-600" />
                        <span>Prerrequisito</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3 text-emerald-600" />
                        <span>Desbloquea</span>
                    </div>

                </div>

                <div
                    className="flex-1 overflow-auto p-4 bg-slate-50 relative"
                    ref={containerRef}
                    onClick={(e) => {
                        // Only deselect if clicking directly on the container, not on a card
                        if (e.target === e.currentTarget) {
                            setHoveredCourseId(null);
                        }
                    }}
                >
                    {/* SVG Overlay for Curved Lines with Circle Ends */}
                    <svg className="absolute inset-0 pointer-events-none z-20" style={{ overflow: 'visible' }}>
                        <defs>
                            <marker id="circle-end" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                <circle cx="4" cy="4" r="3" fill="#22c55e" />
                            </marker>
                        </defs>
                        <style>
                            {`
                                @keyframes flow {
                                    0% { stroke-dashoffset: 20; }
                                    100% { stroke-dashoffset: 0; }
                                }
                                .animated-line {
                                    stroke-dasharray: 10, 5;
                                    animation: flow 0.8s linear infinite;
                                }
                                .highlighted-line {
                                    stroke-dasharray: 8, 4;
                                    animation: flow 0.3s linear infinite, pulse-glow 0.5s ease-in-out infinite alternate;
                                }
                                @keyframes pulse-glow {
                                    0% { filter: drop-shadow(0 0 2px #16a34a); stroke-width: 3; }
                                    100% { filter: drop-shadow(0 0 8px #22c55e); stroke-width: 4; }
                                }
                                .dimmed-line {
                                    opacity: 0.1;
                                }
                            `}
                        </style>
                        {allArrows.map((arrow, i) => {
                            // Calculate bezier curve control points
                            const dx = arrow.x2 - arrow.x1;
                            const midX = arrow.x1 + dx / 2;

                            // Create a smooth S-curve
                            const path = `M ${arrow.x1} ${arrow.y1} C ${midX} ${arrow.y1}, ${midX} ${arrow.y2}, ${arrow.x2} ${arrow.y2}`;

                            // Check if this arrow connects to any highlighted course
                            const connectedCourses = hoveredCourseId
                                ? [hoveredCourseId, ...highlighted.prereqs, ...highlighted.unlocks]
                                : [];
                            // Arrow is highlighted only if BOTH endpoints are in the connected set
                            const isHighlighted = connectedCourses.includes(arrow.from) && connectedCourses.includes(arrow.to);

                            const lineClass = hoveredCourseId
                                ? (isHighlighted ? 'highlighted-line' : 'dimmed-line')
                                : 'animated-line';

                            return (
                                <path
                                    key={i}
                                    d={path}
                                    fill="none"
                                    stroke={isHighlighted ? "#16a34a" : "#22c55e"}
                                    strokeWidth={isHighlighted ? "3" : "2.5"}
                                    strokeOpacity={isHighlighted ? "1" : "0.8"}
                                    className={lineClass}
                                    markerEnd="url(#circle-end)"
                                />
                            );
                        })}
                    </svg>
                    <div className="flex gap-12 min-w-max">
                        {curriculumByCycle.map((cycle) => {
                            const cycleColor = CYCLE_COLORS[cycle.cycle] || CYCLE_COLORS[10];
                            return (
                                <div key={cycle.cycle} className="w-[130px] flex-shrink-0">
                                    <div
                                        className="text-center py-2 rounded-lg font-bold text-sm mb-2 shadow-md"
                                        style={{ backgroundColor: cycleColor.bg, color: cycleColor.text }}
                                    >
                                        Ciclo {toRoman(cycle.cycle)}
                                    </div>
                                    <div className="space-y-2">
                                        {cycle.courses.map((course) => {
                                            const colors = COURSE_TYPE_COLORS[course.type];
                                            const isHovered = hoveredCourseId === course._id;
                                            const isPrereq = highlighted.prereqs.includes(course._id);
                                            const isUnlock = highlighted.unlocks.includes(course._id);
                                            const isConnected = isHovered || isPrereq || isUnlock;

                                            // Base inline styles for colors
                                            let cardStyle: React.CSSProperties = {
                                                backgroundColor: colors.bg,
                                                borderColor: colors.border,
                                            };

                                            let className = 'border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 shadow-sm h-[65px] flex flex-col justify-between overflow-hidden';

                                            if (hoveredCourseId) {
                                                if (isConnected) {
                                                    // Connected cards - strong green background for high contrast
                                                    cardStyle = {
                                                        backgroundColor: '#bbf7d0', // green-200 - more saturated
                                                        borderColor: '#16a34a',     // workcodile-green-dark
                                                        boxShadow: '0 0 12px rgba(22, 163, 74, 0.5)',
                                                    };
                                                    className = 'border-2 rounded-lg p-2 shadow-xl z-10 h-[65px] flex flex-col justify-between overflow-hidden ring-2 ring-green-600';
                                                } else {
                                                    // Non-connected cards dimmed
                                                    cardStyle = {
                                                        ...cardStyle,
                                                        opacity: 0.3,
                                                    };
                                                }
                                            }

                                            const isCompleted = completedCourses.has(course._id);

                                            // Apply completed styling with cycle blue colors
                                            const completedStyle = isCompleted ? {
                                                ...cardStyle,
                                                backgroundColor: '#C5CBE9', // Lighter cycle blue
                                                borderColor: '#5C6BC0',     // Cycle 5 indigo
                                                opacity: Math.min((cardStyle.opacity || 1) as number, 0.85),
                                            } : cardStyle;

                                            return (
                                                <div
                                                    key={course._id}
                                                    ref={(el) => { courseRefs.current[course._id] = el; }}
                                                    className={`${className} relative`}
                                                    style={completedStyle}
                                                    onClick={() => setHoveredCourseId(prev => prev === course._id ? null : course._id)}
                                                >

                                                    <p
                                                        className="text-xs font-bold leading-tight mb-1.5 line-clamp-2"
                                                        style={{ color: colors.text }}
                                                        title={toTitleCase(course.name)}
                                                    >
                                                        {getShortName(course.name)}
                                                    </p>
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span className="text-muted-foreground font-mono">
                                                            {course.code}
                                                        </span>
                                                        {/* Check button at bottom right */}
                                                        <button
                                                            onClick={(e) => toggleCourseCompletion(course._id, e)}
                                                            className="w-4 h-4 rounded flex items-center justify-center transition-all z-30"
                                                            style={{
                                                                backgroundColor: isCompleted ? '#5C6BC0' : '#e5e7eb',
                                                                color: isCompleted ? 'white' : '#9ca3af'
                                                            }}
                                                            title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}
                                                        >
                                                            <Check className="h-2.5 w-2.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
});
