import { useState, useMemo, memo, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { GraduationCap, ArrowRight, Lock } from 'lucide-react';

// === TYPES ===
interface Course {
    id: string;
    code: string;
    name: string;
    credits: number;
    hours: number;
    type: 'general' | 'basic' | 'specialty' | 'elective' | 'practice';
    prerequisites?: string[];
    description?: string;
}

interface CycleData {
    cycle: number;
    courses: Course[];
}

interface CurriculumModalProps {
    trigger: React.ReactNode;
}

// === STYLING CONSTANTS ===
const COURSE_TYPE_COLORS: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-900' },
    basic: { bg: 'bg-emerald-50', border: 'border-emerald-400', text: 'text-emerald-900' },
    specialty: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-900' },
    elective: { bg: 'bg-orange-50', border: 'border-orange-400', text: 'text-orange-900' },
    practice: { bg: 'bg-pink-50', border: 'border-pink-400', text: 'text-pink-900' },
};

const COURSE_TYPE_LABELS: Record<Course['type'], string> = {
    general: 'General',
    basic: 'Básico',
    specialty: 'Especialidad',
    elective: 'Electivo',
    practice: 'Prácticas',
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

// === MOCK DATA - MALLA CURRICULAR (Datos reales de UNAM) ===
const MOCK_CURRICULUM: CycleData[] = [
    {
        cycle: 1,
        courses: [
            { id: 'IS-124', code: 'IS-124', name: 'REDACCION Y COMUNICACION', credits: 3, hours: 4, type: 'general' },
            { id: 'IS-127', code: 'IS-127', name: 'BIOLOGIA Y MEDIO AMBIENTE', credits: 3, hours: 4, type: 'general' },
            { id: 'IS-122', code: 'IS-122', name: 'MATEMATICA 1', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-123', code: 'IS-123', name: 'METODOLOGIA Y TECNICAS DE ESTUDIO', credits: 2, hours: 3, type: 'general' },
            { id: 'IS-121', code: 'IS-121', name: 'FUNDAMENTOS DE PROGRAMACION', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-125', code: 'IS-125', name: 'FILOSOFIA', credits: 2, hours: 3, type: 'general' },
            { id: 'IS-126', code: 'IS-126', name: 'SOCIOLOGIA Y REALIDAD NACIONAL', credits: 2, hours: 3, type: 'general' },
        ],
    },
    {
        cycle: 2,
        courses: [
            { id: 'IS-225', code: 'IS-225', name: 'MATEMATICAS DISCRETAS 1', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-226', code: 'IS-226', name: 'MATEMATICA 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-122'] },
            { id: 'IS-224', code: 'IS-224', name: 'ALGEBRA LINEAL', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-122'] },
            { id: 'IS-223', code: 'IS-223', name: 'PROGRAMACION ORIENTADA A OBJETOS 1', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-121'] },
            { id: 'IS-221', code: 'IS-221', name: 'ESTRUCTURA DE DATOS', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-121'] },
            { id: 'IS-227', code: 'IS-227', name: 'ESTADISTICA BASICA', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-228', code: 'IS-228', name: 'ETICA', credits: 2, hours: 3, type: 'general' },
        ],
    },
    {
        cycle: 3,
        courses: [
            { id: 'IS-325', code: 'IS-325', name: 'MATEMATICAS DISCRETAS 2', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-225'] },
            { id: 'IS-324', code: 'IS-324', name: 'MATEMATICA 3', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-226'] },
            { id: 'IS-327', code: 'IS-327', name: 'FISICA ELECTRICA', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-322', code: 'IS-322', name: 'PROGRAMACION ORIENTADA A OBJETOS 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-223'] },
            { id: 'IS-323', code: 'IS-323', name: 'FUNDAMENTOS DE SISTEMAS DE INFORMACION', credits: 3, hours: 4, type: 'specialty', prerequisites: ['IS-223'] },
            { id: 'IS-321', code: 'IS-321', name: 'ANALISIS Y DISEÑO DE ALGORITMOS', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-221'] },
            { id: 'IS-326', code: 'IS-326', name: 'PROBABILIDADES', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-227'] },
        ],
    },
    {
        cycle: 4,
        courses: [
            { id: 'IS-424', code: 'IS-424', name: 'SISTEMAS OPERATIVOS', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-425', code: 'IS-425', name: 'MATEMATICA 4', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-324'] },
            { id: 'IS-426', code: 'IS-426', name: 'CIRCUITOS ELECTRICOS Y ELECTRONICOS', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-427', code: 'IS-427', name: 'INVESTIGACION OPERATIVA 1', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-422', code: 'IS-422', name: 'ANALISIS Y DISEÑO DE SISTEMAS 1', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-421', code: 'IS-421', name: 'ALGORITMOS PARALELOS', credits: 3, hours: 4, type: 'specialty', prerequisites: ['IS-321'] },
            { id: 'IS-423', code: 'IS-423', name: 'BASE DE DATOS 1', credits: 4, hours: 6, type: 'specialty' },
        ],
    },
    {
        cycle: 5,
        courses: [
            { id: 'IS-524', code: 'IS-524', name: 'APLICACIONES WEB 1', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-525', code: 'IS-525', name: 'METODOS NUMERICOS', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-425'] },
            { id: 'IS-526', code: 'IS-526', name: 'SISTEMAS DIGITALES', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-426'] },
            { id: 'IS-527', code: 'IS-527', name: 'INVESTIGACION OPERATIVA 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-427'] },
            { id: 'IS-522', code: 'IS-522', name: 'ANALISIS Y DISEÑO DE SISTEMAS 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-422'] },
            { id: 'IS-521', code: 'IS-521', name: 'SISTEMAS DISTRIBUIDOS', credits: 3, hours: 4, type: 'specialty', prerequisites: ['IS-421'] },
            { id: 'IS-523', code: 'IS-523', name: 'BASE DE DATOS 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-423'] },
        ],
    },
    {
        cycle: 6,
        courses: [
            { id: 'IS-624', code: 'IS-624', name: 'APLICACIONES WEB 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-524'] },
            { id: 'IS-625', code: 'IS-625', name: 'REALIDAD AUMENTADA', credits: 3, hours: 4, type: 'elective' },
            { id: 'IS-626', code: 'IS-626', name: 'ARQUITECTURA DE COMPUTADORAS', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-526'] },
            { id: 'IS-623', code: 'IS-623', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES 1', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-621', code: 'IS-621', name: 'INGENIERIA DE SOFTWARE', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-522', 'IS-523'] },
            { id: 'IS-622', code: 'IS-622', name: 'BUSINESS INTELLIGENCE', credits: 3, hours: 4, type: 'specialty', prerequisites: ['IS-523'] },
        ],
    },
    {
        cycle: 7,
        courses: [
            { id: 'IS-721', code: 'IS-721', name: 'DATA MINING', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-724', code: 'IS-724', name: 'PROGRAMACION DE VIDEO JUEGOS 1', credits: 3, hours: 4, type: 'elective' },
            { id: 'IS-726', code: 'IS-726', name: 'LENGUAJE DE BAJO NIVEL', credits: 3, hours: 4, type: 'specialty', prerequisites: ['IS-626'] },
            { id: 'IS-723', code: 'IS-723', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-623'] },
            { id: 'IS-722', code: 'IS-722', name: 'CALIDAD DE SOFTWARE', credits: 3, hours: 4, type: 'specialty', prerequisites: ['IS-621'] },
            { id: 'IS-725', code: 'IS-725', name: 'REDES 1', credits: 4, hours: 6, type: 'specialty' },
        ],
    },
    {
        cycle: 8,
        courses: [
            { id: 'IS-821', code: 'IS-821', name: 'CLOUD COMPUTING', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-721'] },
            { id: 'IS-824', code: 'IS-824', name: 'PROGRAMACION DE VIDEO JUEGOS 2', credits: 3, hours: 4, type: 'elective', prerequisites: ['IS-724'] },
            { id: 'IS-823', code: 'IS-823', name: 'PROYECTO DE INVESTIGACION 1', credits: 3, hours: 4, type: 'practice' },
            { id: 'IS-822', code: 'IS-822', name: 'PROCESAMIENTO DE IMAGENES Y VIDEOS', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-827', code: 'IS-827', name: 'ROBOTICA 1', credits: 3, hours: 4, type: 'elective' },
            { id: 'IS-825', code: 'IS-825', name: 'INTERACCION HUMANO COMPUTADOR', credits: 3, hours: 4, type: 'specialty' },
            { id: 'IS-826', code: 'IS-826', name: 'REDES 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-725'] },
        ],
    },
    {
        cycle: 9,
        courses: [
            { id: 'IS-924', code: 'IS-924', name: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA', credits: 3, hours: 4, type: 'general' },
            { id: 'IS-922', code: 'IS-922', name: 'SEGURIDAD INFORMATICA', credits: 4, hours: 6, type: 'specialty' },
            { id: 'IS-923', code: 'IS-923', name: 'PROYECTO DE INVESTIGACION 2', credits: 3, hours: 4, type: 'practice', prerequisites: ['IS-823'] },
            { id: 'IS-921', code: 'IS-921', name: 'INTELIGENCIA ARTIFICIAL 1', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-822'] },
            { id: 'IS-926', code: 'IS-926', name: 'ROBOTICA 2', credits: 3, hours: 4, type: 'elective', prerequisites: ['IS-827'] },
            { id: 'IS-925', code: 'IS-925', name: 'PROYECTOS INFORMATICOS 1', credits: 4, hours: 8, type: 'practice' },
        ],
    },
    {
        cycle: 10,
        courses: [
            { id: 'IS-1022', code: 'IS-1022', name: 'AUDITORIA DE SISTEMAS DE INFORMACION', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-922'] },
            { id: 'IS-1023', code: 'IS-1023', name: 'SEGURIDAD DE LA INFORMACION', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-922'] },
            { id: 'IS-1024', code: 'IS-1024', name: 'SEMINARIO DE TESIS', credits: 2, hours: 4, type: 'practice', prerequisites: ['IS-923'] },
            { id: 'IS-1021', code: 'IS-1021', name: 'INTELIGENCIA ARTIFICIAL 2', credits: 4, hours: 6, type: 'specialty', prerequisites: ['IS-921'] },
            { id: 'IS-1026', code: 'IS-1026', name: 'PROYECTOS INFORMATICOS 2', credits: 4, hours: 8, type: 'practice', prerequisites: ['IS-925'] },
        ],
    },
];

// Helper function to create short abbreviations
function getShortName(fullName: string): string {
    const abbreviations: Record<string, string> = {
        'FUNDAMENTOS DE PROGRAMACION': 'Fund. Prog.',
        'MATEMATICA 1': 'Mat. 1',
        'MATEMATICA 2': 'Mat. 2',
        'MATEMATICA 3': 'Mat. 3',
        'MATEMATICA 4': 'Mat. 4',
        'METODOLOGIA Y TECNICAS DE ESTUDIO': 'Metodología',
        'REDACCION Y COMUNICACION': 'Redacción',
        'FILOSOFIA': 'Filosofía',
        'SOCIOLOGIA Y REALIDAD NACIONAL': 'Sociología',
        'BIOLOGIA Y MEDIO AMBIENTE': 'Biología',
        'ESTRUCTURA DE DATOS': 'Est. Datos',
        'PROGRAMACION ORIENTADA A OBJETOS 1': 'POO 1',
        'PROGRAMACION ORIENTADA A OBJETOS 2': 'POO 2',
        'ALGEBRA LINEAL': 'Álg. Lineal',
        'MATEMATICAS DISCRETAS 1': 'Discretas 1',
        'MATEMATICAS DISCRETAS 2': 'Discretas 2',
        'ESTADISTICA BASICA': 'Estadística',
        'ETICA': 'Ética',
        'ANALISIS Y DISEÑO DE ALGORITMOS': 'ADA',
        'FUNDAMENTOS DE SISTEMAS DE INFORMACION': 'Fund. Sistemas',
        'PROBABILIDADES': 'Probabilidad',
        'FISICA ELECTRICA': 'Física Eléc.',
        'ALGORITMOS PARALELOS': 'Algo. Paralelos',
        'ANALISIS Y DISEÑO DE SISTEMAS 1': 'ADS 1',
        'ANALISIS Y DISEÑO DE SISTEMAS 2': 'ADS 2',
        'BASE DE DATOS 1': 'BD 1',
        'BASE DE DATOS 2': 'BD 2',
        'SISTEMAS OPERATIVOS': 'Sist. Operativos',
        'CIRCUITOS ELECTRICOS Y ELECTRONICOS': 'Circuitos Elec.',
        'INVESTIGACION OPERATIVA 1': 'Inv. Operativa 1',
        'INVESTIGACION OPERATIVA 2': 'Inv. Operativa 2',
        'SISTEMAS DISTRIBUIDOS': 'Sist. Distribuidos',
        'APLICACIONES WEB 1': 'App Web 1',
        'APLICACIONES WEB 2': 'App Web 2',
        'METODOS NUMERICOS': 'Mét. Numéricos',
        'SISTEMAS DIGITALES': 'Sist. Digitales',
        'INGENIERIA DE SOFTWARE': 'Ing. Software',
        'BUSINESS INTELLIGENCE': 'Business Intel.',
        'PROGRAMACION DE DISPOSITIVOS MOVILES 1': 'Prog. Móvil 1',
        'PROGRAMACION DE DISPOSITIVOS MOVILES 2': 'Prog. Móvil 2',
        'REALIDAD AUMENTADA': 'Realidad Aum.',
        'ARQUITECTURA DE COMPUTADORAS': 'Arq. Comp.',
        'DATA MINING': 'Data Mining',
        'CALIDAD DE SOFTWARE': 'Calidad SW',
        'PROGRAMACION DE VIDEO JUEGOS 1': 'Videojuegos 1',
        'PROGRAMACION DE VIDEO JUEGOS 2': 'Videojuegos 2',
        'REDES 1': 'Redes 1',
        'REDES 2': 'Redes 2',
        'LENGUAJE DE BAJO NIVEL': 'Bajo Nivel',
        'CLOUD COMPUTING': 'Cloud Comp.',
        'PROCESAMIENTO DE IMAGENES Y VIDEOS': 'Proc. Img/Video',
        'PROYECTO DE INVESTIGACION 1': 'Proy. Invest. 1',
        'PROYECTO DE INVESTIGACION 2': 'Proy. Invest. 2',
        'INTERACCION HUMANO COMPUTADOR': 'HCI',
        'ROBOTICA 1': 'Robótica 1',
        'ROBOTICA 2': 'Robótica 2',
        'INTELIGENCIA ARTIFICIAL 1': 'IA 1',
        'INTELIGENCIA ARTIFICIAL 2': 'IA 2',
        'SEGURIDAD INFORMATICA': 'Seg. Informática',
        'FORMACION DE EMPRESAS CON BASE TECNOLOGICA': 'Form. Empresas',
        'PROYECTOS INFORMATICOS 1': 'Proy. Inf. 1',
        'PROYECTOS INFORMATICOS 2': 'Proy. Inf. 2',
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
    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const courseRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Build maps
    const { prereqMap, unlocksMap } = useMemo(() => {
        const prereqMap: Record<string, string[]> = {};
        const unlocksMap: Record<string, string[]> = {};

        MOCK_CURRICULUM.forEach(cycle => {
            cycle.courses.forEach(course => {
                prereqMap[course.id] = course.prerequisites || [];
                course.prerequisites?.forEach(prereqId => {
                    if (!unlocksMap[prereqId]) unlocksMap[prereqId] = [];
                    unlocksMap[prereqId].push(course.id);
                });
            });
        });

        return { prereqMap, unlocksMap };
    }, []);

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

    // Calculate ALL arrows (always visible)
    const allArrows = useMemo(() => {
        if (!containerRef.current || arrowTrigger === 0) return [];

        const containerRect = containerRef.current.getBoundingClientRect();
        const newArrows: { x1: number; y1: number; x2: number; y2: number }[] = [];

        // Draw arrows for ALL prerequisite relationships
        MOCK_CURRICULUM.forEach(cycle => {
            cycle.courses.forEach(course => {
                const prereqs = course.prerequisites || [];
                prereqs.forEach(prereqId => {
                    const fromEl = courseRefs.current[prereqId];
                    const toEl = courseRefs.current[course.id];

                    if (fromEl && toEl) {
                        const fromRect = fromEl.getBoundingClientRect();
                        const toRect = toEl.getBoundingClientRect();

                        newArrows.push({
                            x1: fromRect.right - containerRect.left,
                            y1: fromRect.top + fromRect.height / 2 - containerRect.top,
                            x2: toRect.left - containerRect.left,
                            y2: toRect.top + toRect.height / 2 - containerRect.top,
                        });
                    }
                });
            });
        });

        return newArrows;
    }, [arrowTrigger]);

    // State to track if dialog is open
    const [isOpen, setIsOpen] = useState(false);

    // Trigger arrow recalculation when dialog opens
    useEffect(() => {
        if (isOpen) {
            // Recalculate arrows with delay to ensure DOM is ready
            const timer = setTimeout(() => {
                setArrowTrigger(t => t + 1);
            }, 150);

            const recalc = () => setArrowTrigger(t => t + 1);
            window.addEventListener('resize', recalc);

            return () => {
                clearTimeout(timer);
                window.removeEventListener('resize', recalc);
            };
        }
    }, [isOpen]);

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

                <div className="px-6 py-2 bg-muted/30 border-y flex gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-amber-600" />
                        <span>Prerrequisito</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowRight className="h-3 w-3 text-emerald-600" />
                        <span>Desbloquea</span>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-4 bg-slate-50 relative" ref={containerRef}>
                    {/* SVG Overlay for Curved Arrows */}
                    <svg className="absolute inset-0 pointer-events-none z-20" style={{ overflow: 'visible' }}>
                        <defs>
                            <marker id="arrowhead-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                                <polygon points="0 0, 8 3, 0 6" fill="#059669" />
                            </marker>
                        </defs>
                        {allArrows.map((arrow, i) => {
                            // Calculate bezier curve control points
                            const dx = arrow.x2 - arrow.x1;
                            const midX = arrow.x1 + dx / 2;

                            // Create a smooth S-curve
                            const path = `M ${arrow.x1} ${arrow.y1} C ${midX} ${arrow.y1}, ${midX} ${arrow.y2}, ${arrow.x2} ${arrow.y2}`;

                            return (
                                <path
                                    key={i}
                                    d={path}
                                    fill="none"
                                    stroke="#059669"
                                    strokeWidth="2"
                                    strokeOpacity="0.7"
                                    markerEnd="url(#arrowhead-green)"
                                />
                            );
                        })}
                    </svg>
                    <div className="flex gap-12 min-w-max">
                        {MOCK_CURRICULUM.map((cycle) => (
                            <div key={cycle.cycle} className="w-[130px] flex-shrink-0">
                                <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white text-center py-2 rounded-lg font-bold text-sm mb-2 shadow-md">
                                    Ciclo {toRoman(cycle.cycle)}
                                </div>
                                <div className="space-y-2">
                                    {cycle.courses.map((course) => {
                                        const colors = COURSE_TYPE_COLORS[course.type];
                                        const isHovered = hoveredCourseId === course.id;
                                        const isPrereq = highlighted.prereqs.includes(course.id);
                                        const isUnlock = highlighted.unlocks.includes(course.id);

                                        let className = `${colors.bg} ${colors.border} border-2 rounded-lg p-2 cursor-pointer transition-colors duration-200 shadow-sm min-h-[60px] flex flex-col justify-between`;

                                        if (hoveredCourseId) {
                                            if (isHovered) {
                                                className = `${colors.bg} ${colors.border} border-2 ring-2 ring-blue-500 rounded-lg p-2 shadow-lg z-10 min-h-[60px] flex flex-col justify-between font-semibold`;
                                            } else if (isPrereq) {
                                                className = `bg-amber-200 border-amber-500 border-2 rounded-lg p-2 shadow-md min-h-[60px] flex flex-col justify-between`;
                                            } else if (isUnlock) {
                                                className = `bg-emerald-200 border-emerald-500 border-2 rounded-lg p-2 shadow-md min-h-[60px] flex flex-col justify-between`;
                                            } else {
                                                className = `${colors.bg} ${colors.border} border-2 rounded-lg p-2 opacity-25 min-h-[60px] flex flex-col justify-between`;
                                            }
                                        }

                                        return (
                                            <div
                                                key={course.id}
                                                ref={(el) => { courseRefs.current[course.id] = el; }}
                                                className={className}
                                                onMouseEnter={() => setHoveredCourseId(course.id)}
                                                onMouseLeave={() => setHoveredCourseId(null)}
                                            >
                                                <p className={`text-xs font-bold leading-tight mb-1.5 ${colors.text} line-clamp-2`} title={toTitleCase(course.name)}>
                                                    {getShortName(course.name)}
                                                </p>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <span className="text-muted-foreground font-mono">
                                                        {course.code}
                                                    </span>
                                                    <span className="font-semibold text-slate-600">
                                                        {course.credits}c
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
});
