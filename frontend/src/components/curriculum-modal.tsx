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

// === STYLING CONSTANTS ===
// Light mode colors (normal theme)
const COURSE_TYPE_COLORS_LIGHT: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a' },
    basic: { bg: '#ecfdf5', border: '#34d399', text: '#064e3b' },
    specialty: { bg: '#faf5ff', border: '#c084fc', text: '#581c87' },
    elective: { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12' },
    practice: { bg: '#fdf2f8', border: '#f472b6', text: '#831843' },
};

// Dark mode colors (normal theme) - muted, softer tones
const COURSE_TYPE_COLORS_DARK: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: '#1e293b', border: '#64748b', text: '#94a3b8' },    // Slate muted
    basic: { bg: '#14332a', border: '#4ade80', text: '#86efac' },      // Green muted
    specialty: { bg: '#2e1065', border: '#a78bfa', text: '#c4b5fd' },  // Purple muted
    elective: { bg: '#292524', border: '#a8a29e', text: '#d6d3d1' },   // Stone muted
    practice: { bg: '#3f1f3d', border: '#e879f9', text: '#f0abfc' },   // Fuchsia muted
};

// Christmas theme colors (light mode) - soft rose and blush tones 🎄
const COURSE_TYPE_COLORS_CHRISTMAS_LIGHT: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: '#fff1f2', border: '#fda4af', text: '#881337' },    // Soft rose
    basic: { bg: '#fff1f2', border: '#fb7185', text: '#9f1239' },      // Blush pink (primary)
    specialty: { bg: '#fdf2f8', border: '#f9a8d4', text: '#831843' },  // Soft pink
    elective: { bg: '#fefce8', border: '#fcd34d', text: '#854d0e' },   // Soft gold
    practice: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },   // Soft green accent
};

// Christmas theme colors (dark mode) - muted cranberry tones 🎄
const COURSE_TYPE_COLORS_CHRISTMAS_DARK: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: '#3f1219', border: '#fda4af', text: '#ffe4e6' },    // Muted cranberry
    basic: { bg: '#4c0519', border: '#fb7185', text: '#fce7f3' },      // Deep rose (primary)
    specialty: { bg: '#3b0d2c', border: '#f9a8d4', text: '#fce7f3' },  // Dark rose
    elective: { bg: '#3d2e05', border: '#fbbf24', text: '#fef9c3' },   // Muted gold
    practice: { bg: '#0a3622', border: '#86efac', text: '#dcfce7' },   // Muted green accent
};

// Cycle header colors - uniform color for all cycles (light mode)
const CYCLE_COLORS_LIGHT: Record<number, { bg: string; text: string }> = {
    1: { bg: '#6366f1', text: '#ffffff' },   // Indigo-500 - vibrant
    2: { bg: '#6366f1', text: '#ffffff' },
    3: { bg: '#6366f1', text: '#ffffff' },
    4: { bg: '#6366f1', text: '#ffffff' },
    5: { bg: '#6366f1', text: '#ffffff' },
    6: { bg: '#6366f1', text: '#ffffff' },
    7: { bg: '#6366f1', text: '#ffffff' },
    8: { bg: '#6366f1', text: '#ffffff' },
    9: { bg: '#6366f1', text: '#ffffff' },
    10: { bg: '#6366f1', text: '#ffffff' },
};

// Cycle header colors - uniform color for all cycles (dark mode)
const CYCLE_COLORS_DARK: Record<number, { bg: string; text: string }> = {
    1: { bg: '#4f46e5', text: '#ffffff' },   // Indigo-600 - slightly darker
    2: { bg: '#4f46e5', text: '#ffffff' },
    3: { bg: '#4f46e5', text: '#ffffff' },
    4: { bg: '#4f46e5', text: '#ffffff' },
    5: { bg: '#4f46e5', text: '#ffffff' },
    6: { bg: '#4f46e5', text: '#ffffff' },
    7: { bg: '#4f46e5', text: '#ffffff' },
    8: { bg: '#4f46e5', text: '#ffffff' },
    9: { bg: '#4f46e5', text: '#ffffff' },
    10: { bg: '#4f46e5', text: '#ffffff' },
};

// Christmas cycle colors (light mode) - gold/amber gradient 🎄⭐
const CYCLE_COLORS_CHRISTMAS_LIGHT: Record<number, { bg: string; text: string }> = {
    1: { bg: '#fefce8', text: '#713f12' },   // yellow-50
    2: { bg: '#fef9c3', text: '#713f12' },   // yellow-100
    3: { bg: '#fef08a', text: '#713f12' },   // yellow-200
    4: { bg: '#fde047', text: '#713f12' },   // yellow-300
    5: { bg: '#facc15', text: '#ffffff' },   // yellow-400
    6: { bg: '#eab308', text: '#ffffff' },   // yellow-500
    7: { bg: '#ca8a04', text: '#ffffff' },   // yellow-600
    8: { bg: '#a16207', text: '#ffffff' },   // yellow-700
    9: { bg: '#854d0e', text: '#ffffff' },   // yellow-800
    10: { bg: '#713f12', text: '#ffffff' },  // yellow-900
};

// Christmas cycle colors (dark mode) - rich gold/amber gradient 🎄⭐
const CYCLE_COLORS_CHRISTMAS_DARK: Record<number, { bg: string; text: string }> = {
    1: { bg: '#ca8a04', text: '#ffffff' },   // yellow-600
    2: { bg: '#a16207', text: '#ffffff' },   // yellow-700
    3: { bg: '#854d0e', text: '#ffffff' },   // yellow-800
    4: { bg: '#713f12', text: '#ffffff' },   // yellow-900
    5: { bg: '#5c3d10', text: '#ffffff' },   // darker
    6: { bg: '#4a310d', text: '#ffffff' },
    7: { bg: '#3d280b', text: '#ffffff' },
    8: { bg: '#302008', text: '#ffffff' },
    9: { bg: '#231806', text: '#ffffff' },
    10: { bg: '#1a1204', text: '#ffffff' },
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

// === MOCK DATA - MALLA CURRICULAR (Datos reales de UNAM) ===
// TODO BACKEND: El endpoint GET /api/courses debe devolver esta estructura
const MOCK_CURRICULUM: Course[] = [
    // Ciclo 1
    { _id: 'IS-124', code: 'IS-124', name: 'REDACCION Y COMUNICACION', cycle: 1, prerequisites: [], type: 'basic' },
    { _id: 'IS-127', code: 'IS-127', name: 'BIOLOGIA Y MEDIO AMBIENTE', cycle: 1, prerequisites: [], type: 'basic' },
    { _id: 'IS-122', code: 'IS-122', name: 'MATEMATICA I', cycle: 1, prerequisites: [], type: 'basic' },
    { _id: 'IS-123', code: 'IS-123', name: 'METODOLOGIA Y TECNICAS DE ESTUDIO UNIVERSITARIO', cycle: 1, prerequisites: [], type: 'basic' },
    { _id: 'IS-121', code: 'IS-121', name: 'FUNDAMENTOS DE PROGRAMACION', cycle: 1, prerequisites: [], type: 'basic' },
    { _id: 'IS-125', code: 'IS-125', name: 'FILOSOFIA', cycle: 1, prerequisites: [], type: 'basic' },
    { _id: 'IS-126', code: 'IS-126', name: 'SOCIOLOGIA Y REALIDAD NACIONAL', cycle: 1, prerequisites: [], type: 'basic' },
    // Ciclo 2
    { _id: 'IS-225', code: 'IS-225', name: 'MATEMATICAS DISCRETAS I', cycle: 2, prerequisites: [], type: 'basic' },
    { _id: 'IS-226', code: 'IS-226', name: 'MATEMATICA II', cycle: 2, prerequisites: ['IS-122'], type: 'basic' },
    { _id: 'IS-224', code: 'IS-224', name: 'ALGEBRA LINEAL', cycle: 2, prerequisites: ['IS-122'], type: 'basic' },
    { _id: 'IS-223', code: 'IS-223', name: 'PROGRAMACION ORIENTADA A OBJETOS I', cycle: 2, prerequisites: ['IS-121'], type: 'basic' },
    { _id: 'IS-221', code: 'IS-221', name: 'ESTRUCTURA DE DATOS', cycle: 2, prerequisites: ['IS-121'], type: 'basic' },
    { _id: 'IS-227', code: 'IS-227', name: 'ESTADISTICA BASICA', cycle: 2, prerequisites: [], type: 'basic' },
    { _id: 'IS-228', code: 'IS-228', name: 'ETICA', cycle: 2, prerequisites: [], type: 'basic' },
    // Ciclo 3
    { _id: 'IS-325', code: 'IS-325', name: 'MATEMATICAS DISCRETAS II', cycle: 3, prerequisites: ['IS-225'], type: 'basic' },
    { _id: 'IS-324', code: 'IS-324', name: 'MATEMATICA III', cycle: 3, prerequisites: ['IS-226'], type: 'basic' },
    { _id: 'IS-327', code: 'IS-327', name: 'FISICA ELECTRICA', cycle: 3, prerequisites: [], type: 'basic' },
    { _id: 'IS-322', code: 'IS-322', name: 'PROGRAMACION ORIENTADA A OBJETOS II', cycle: 3, prerequisites: ['IS-223'], type: 'basic' },
    { _id: 'IS-323', code: 'IS-323', name: 'FUNDAMENTOS DE SISTEMAS DE INFORMACION', cycle: 3, prerequisites: ['IS-223'], type: 'basic' },
    { _id: 'IS-321', code: 'IS-321', name: 'ANALISIS Y DISEÑO DE ALGORITMOS', cycle: 3, prerequisites: ['IS-221'], type: 'basic' },
    { _id: 'IS-326', code: 'IS-326', name: 'PROBABILIDADES', cycle: 3, prerequisites: ['IS-227'], type: 'basic' },
    // Ciclo 4
    { _id: 'IS-424', code: 'IS-424', name: 'SISTEMAS OPERATIVOS', cycle: 4, prerequisites: [], type: 'basic' },
    { _id: 'IS-425', code: 'IS-425', name: 'MATEMATICA IV', cycle: 4, prerequisites: ['IS-324'], type: 'basic' },
    { _id: 'IS-426', code: 'IS-426', name: 'CIRCUITOS ELECTRICOS Y ELECTRONICOS', cycle: 4, prerequisites: [], type: 'basic' },
    { _id: 'IS-427', code: 'IS-427', name: 'INVESTIGACION OPERATIVA I', cycle: 4, prerequisites: [], type: 'basic' },
    { _id: 'IS-422', code: 'IS-422', name: 'ANALISIS Y DISEÑO DE SISTEMAS I', cycle: 4, prerequisites: [], type: 'basic' },
    { _id: 'IS-421', code: 'IS-421', name: 'ALGORITMOS PARALELOS', cycle: 4, prerequisites: ['IS-321'], type: 'basic' },
    { _id: 'IS-423', code: 'IS-423', name: 'BASE DE DATOS I', cycle: 4, prerequisites: [], type: 'basic' },
    // Ciclo 5
    { _id: 'IS-524', code: 'IS-524', name: 'APLICACIONES WEB I', cycle: 5, prerequisites: [], type: 'basic' },
    { _id: 'IS-525', code: 'IS-525', name: 'METODOS NUMERICOS', cycle: 5, prerequisites: ['IS-425'], type: 'basic' },
    { _id: 'IS-526', code: 'IS-526', name: 'SISTEMAS DIGITALES', cycle: 5, prerequisites: ['IS-426'], type: 'basic' },
    { _id: 'IS-527', code: 'IS-527', name: 'INVESTIGACION OPERATIVA II', cycle: 5, prerequisites: ['IS-427'], type: 'basic' },
    { _id: 'IS-522', code: 'IS-522', name: 'ANALISIS Y DISEÑO DE SISTEMAS II', cycle: 5, prerequisites: ['IS-422'], type: 'basic' },
    { _id: 'IS-521', code: 'IS-521', name: 'SISTEMAS DISTRIBUIDOS', cycle: 5, prerequisites: ['IS-421'], type: 'basic' },
    { _id: 'IS-523', code: 'IS-523', name: 'BASE DE DATOS II', cycle: 5, prerequisites: ['IS-423'], type: 'basic' },
    // Ciclo 6
    { _id: 'IS-624', code: 'IS-624', name: 'APLICACIONES WEB II', cycle: 6, prerequisites: ['IS-524'], type: 'basic' },
    { _id: 'IS-625', code: 'IS-625', name: 'REALIDAD AUMENTADA', cycle: 6, prerequisites: [], type: 'basic' },
    { _id: 'IS-626', code: 'IS-626', name: 'ARQUITECTURA DE COMPUTADORAS', cycle: 6, prerequisites: ['IS-526'], type: 'basic' },
    { _id: 'IS-623', code: 'IS-623', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES I', cycle: 6, prerequisites: [], type: 'basic' },
    { _id: 'IS-621', code: 'IS-621', name: 'INGENIERIA DE SOFTWARE', cycle: 6, prerequisites: ['IS-522', 'IS-523'], type: 'basic' },
    { _id: 'IS-622', code: 'IS-622', name: 'BUSINESS INTELLIGENCE', cycle: 6, prerequisites: ['IS-523'], type: 'basic' },
    // Ciclo 7
    { _id: 'IS-721', code: 'IS-721', name: 'DATA MINING', cycle: 7, prerequisites: [], type: 'basic' },
    { _id: 'IS-724', code: 'IS-724', name: 'PROGRAMACION DE VIDEO JUEGOS I', cycle: 7, prerequisites: [], type: 'basic' },
    { _id: 'IS-726', code: 'IS-726', name: 'LENGUAJE DE BAJO NIVEL', cycle: 7, prerequisites: ['IS-626'], type: 'basic' },
    { _id: 'IS-723', code: 'IS-723', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES II', cycle: 7, prerequisites: ['IS-623'], type: 'basic' },
    { _id: 'IS-722', code: 'IS-722', name: 'CALIDAD DE SOFTWARE', cycle: 7, prerequisites: ['IS-621'], type: 'basic' },
    { _id: 'IS-725', code: 'IS-725', name: 'REDES I', cycle: 7, prerequisites: [], type: 'basic' },
    // Ciclo 8
    { _id: 'IS-821', code: 'IS-821', name: 'CLOUD COMPUTING', cycle: 8, prerequisites: ['IS-721'], type: 'basic' },
    { _id: 'IS-824', code: 'IS-824', name: 'PROGRAMACION DE VIDEO JUEGOS II', cycle: 8, prerequisites: ['IS-724'], type: 'basic' },
    { _id: 'IS-823', code: 'IS-823', name: 'PROYECTO DE INVESTIGACION I', cycle: 8, prerequisites: [], type: 'basic' },
    { _id: 'IS-822', code: 'IS-822', name: 'PROCESAMIENTO DE IMAGENES Y VIDEOS', cycle: 8, prerequisites: [], type: 'basic' },
    { _id: 'IS-827', code: 'IS-827', name: 'ROBOTICA I', cycle: 8, prerequisites: [], type: 'basic' },
    { _id: 'IS-825', code: 'IS-825', name: 'INTERACCION HUMANO COMPUTADOR', cycle: 8, prerequisites: [], type: 'basic' },
    { _id: 'IS-826', code: 'IS-826', name: 'REDES II', cycle: 8, prerequisites: ['IS-725'], type: 'basic' },
    // Ciclo 9
    { _id: 'IS-924', code: 'IS-924', name: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA', cycle: 9, prerequisites: [], type: 'basic' },
    { _id: 'IS-922', code: 'IS-922', name: 'SEGURIDAD INFORMATICA', cycle: 9, prerequisites: [], type: 'basic' },
    { _id: 'IS-923', code: 'IS-923', name: 'PROYECTO DE INVESTIGACION II', cycle: 9, prerequisites: ['IS-823'], type: 'basic' },
    { _id: 'IS-921', code: 'IS-921', name: 'INTELIGENCIA ARTIFICIAL I', cycle: 9, prerequisites: ['IS-822'], type: 'basic' },
    { _id: 'IS-926', code: 'IS-926', name: 'ROBOTICA II', cycle: 9, prerequisites: ['IS-827'], type: 'basic' },
    { _id: 'IS-925', code: 'IS-925', name: 'PROYECTOS INFORMATICOS I', cycle: 9, prerequisites: [], type: 'basic' },
    // Ciclo 10
    { _id: 'IS-1022', code: 'IS-1022', name: 'AUDITORIA DE SISTEMAS DE INFORMACION', cycle: 10, prerequisites: ['IS-922'], type: 'basic' },
    { _id: 'IS-1023', code: 'IS-1023', name: 'SEGURIDAD DE LA INFORMACION', cycle: 10, prerequisites: ['IS-922'], type: 'basic' },
    { _id: 'IS-1024', code: 'IS-1024', name: 'SEMINARIO DE TESIS', cycle: 10, prerequisites: ['IS-923'], type: 'basic' },
    { _id: 'IS-1021', code: 'IS-1021', name: 'INTELIGENCIA ARTIFICIAL II', cycle: 10, prerequisites: ['IS-921'], type: 'basic' },
    { _id: 'IS-1026', code: 'IS-1026', name: 'PROYECTOS INFORMATICOS II', cycle: 10, prerequisites: ['IS-925'], type: 'basic' },
];

// === MAIN COMPONENT ===
export const CurriculumModal = memo(function CurriculumModal({ trigger }: CurriculumModalProps) {
    const { user, authStatus, theme, christmasTheme } = useApp(); // Use auth context + theme
    const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const courseRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch all courses (with fallback to mock data)
    useEffect(() => {
        const fetchAllCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${API_BASE_URL}/api/courses`);
                if (!response.ok) {
                    throw new Error('Failed to fetch all courses');
                }
                const data: Course[] = await response.json();
                setAllCourses(data.map(c => ({ ...c, code: c._id, type: c.type || 'basic' })));
            } catch (err: any) {
                console.warn('Backend courses endpoint not available, using mock data:', err.message);
                // Fallback to mock data when backend fails
                setAllCourses(MOCK_CURRICULUM);
                setError(null); // Clear error since we have fallback
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
                <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] flex flex-col p-0">
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
                <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] flex flex-col p-0">
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
            <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-3">
                    <DialogTitle className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Malla Curricular - Ingeniería de Sistemas
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-2 bg-muted/30 border-y flex flex-wrap gap-x-6 gap-y-1 text-xs">
                    {/* Course type - dynamic based on theme */}
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-3 h-3 rounded"
                            style={{
                                backgroundColor: christmasTheme ? '#fff1f2' : '#ecfdf5',
                                border: `1px solid ${christmasTheme ? '#fb7185' : '#34d399'}`
                            }}
                        />
                        <span>Curso</span>
                    </div>

                    {/* Completed - dynamic based on theme */}
                    <div className="flex items-center gap-1.5" style={{ marginLeft: '5px' }}>
                        <div
                            className="w-3 h-3 rounded"
                            style={{
                                backgroundColor: christmasTheme ? '#fef3c7' : '#C5CBE9',
                                border: `1px solid ${christmasTheme ? '#f59e0b' : '#5C6BC0'}`
                            }}
                        />
                        <span>Completado</span>
                    </div>

                    {/* Connections legend */}
                    <div className="border-l border-border pl-4 flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-amber-600" />
                        <span>Prerrequisito</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowRight className={`h-3 w-3 ${christmasTheme ? 'text-rose-500' : 'text-emerald-600'}`} />
                        <span>Desbloquea</span>
                    </div>

                </div>

                <div
                    className={`flex-1 overflow-auto p-4 relative ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}
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
                                <circle cx="4" cy="4" r="3" fill={christmasTheme ? "#dc2626" : "#22c55e"} />
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
                                    0% { filter: drop-shadow(0 0 2px ${christmasTheme ? '#dc2626' : '#16a34a'}); stroke-width: 3; }
                                    100% { filter: drop-shadow(0 0 8px ${christmasTheme ? '#ef4444' : '#22c55e'}); stroke-width: 4; }
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
                                    stroke={isHighlighted
                                        ? (christmasTheme ? "#dc2626" : "#16a34a")
                                        : (christmasTheme ? "#ef4444" : "#22c55e")}
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
                            // Select cycle colors based on theme and Christmas mode
                            const CYCLE_COLORS = christmasTheme
                                ? (theme === 'dark' ? CYCLE_COLORS_CHRISTMAS_DARK : CYCLE_COLORS_CHRISTMAS_LIGHT)
                                : (theme === 'dark' ? CYCLE_COLORS_DARK : CYCLE_COLORS_LIGHT);
                            const cycleColor = CYCLE_COLORS[cycle.cycle] || CYCLE_COLORS[10];
                            // Glow color based on theme
                            const glowColor = christmasTheme
                                ? 'rgba(251, 191, 36, 0.4)'  // Amber glow
                                : 'rgba(99, 102, 241, 0.4)'; // Indigo glow
                            return (
                                <div key={cycle.cycle} className="w-[130px] flex-shrink-0">
                                    <div
                                        className="text-center py-2 rounded-lg font-bold text-sm mb-2"
                                        style={{
                                            backgroundColor: cycleColor.bg,
                                            color: cycleColor.text,
                                            boxShadow: `0 4px 14px ${glowColor}, 0 2px 4px rgba(0,0,0,0.1)`,
                                        }}
                                    >
                                        Ciclo {toRoman(cycle.cycle)}
                                    </div>
                                    <div className="space-y-2">
                                        {cycle.courses.map((course) => {
                                            // Select course colors based on theme and Christmas mode
                                            const COURSE_TYPE_COLORS = christmasTheme
                                                ? (theme === 'dark' ? COURSE_TYPE_COLORS_CHRISTMAS_DARK : COURSE_TYPE_COLORS_CHRISTMAS_LIGHT)
                                                : (theme === 'dark' ? COURSE_TYPE_COLORS_DARK : COURSE_TYPE_COLORS_LIGHT);
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
                                                    // Connected cards - softer highlight based on theme and mode
                                                    if (christmasTheme) {
                                                        cardStyle = theme === 'dark'
                                                            ? {
                                                                backgroundColor: '#4c1d24', // muted dark rose
                                                                borderColor: '#f87171',
                                                                boxShadow: '0 0 8px rgba(248, 113, 113, 0.3)',
                                                            }
                                                            : {
                                                                backgroundColor: '#ffe4e6', // soft rose-100
                                                                borderColor: '#f43f5e',
                                                                boxShadow: '0 0 8px rgba(244, 63, 94, 0.25)',
                                                            };
                                                    } else {
                                                        cardStyle = theme === 'dark'
                                                            ? {
                                                                backgroundColor: '#14532d', // muted dark green
                                                                borderColor: '#4ade80',
                                                                boxShadow: '0 0 8px rgba(74, 222, 128, 0.3)',
                                                            }
                                                            : {
                                                                backgroundColor: '#dcfce7', // soft green-100
                                                                borderColor: '#22c55e',
                                                                boxShadow: '0 0 8px rgba(34, 197, 94, 0.25)',
                                                            };
                                                    }
                                                    className = `border-2 rounded-lg p-2 shadow-lg z-10 h-[65px] flex flex-col justify-between overflow-hidden ring-1 ${christmasTheme ? 'ring-rose-400' : 'ring-green-400'}`;
                                                } else {
                                                    // Non-connected cards dimmed
                                                    cardStyle = {
                                                        ...cardStyle,
                                                        opacity: 0.3,
                                                    };
                                                }
                                            }

                                            const isCompleted = completedCourses.has(course._id);

                                            // Apply completed styling - gold for Christmas, indigo for normal
                                            const completedStyle = isCompleted ? {
                                                ...cardStyle,
                                                backgroundColor: christmasTheme
                                                    ? (theme === 'dark' ? '#78350f' : '#fef3c7')  // amber dark/light
                                                    : (theme === 'dark' ? '#394AAE' : '#C5CBE9'), // indigo dark/light
                                                borderColor: christmasTheme ? '#f59e0b' : '#5C6BC0',
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
                                                        style={{
                                                            color: isCompleted
                                                                ? (theme === 'dark' ? '#ffffff' : '#1f2937')
                                                                : colors.text
                                                        }}
                                                        title={toTitleCase(course.name)}
                                                    >
                                                        {getShortName(course.name)}
                                                    </p>
                                                    <div className="flex justify-between items-center text-[10px]">
                                                        <span
                                                            className="font-mono"
                                                            style={{
                                                                color: isCompleted
                                                                    ? (theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)')
                                                                    : undefined
                                                            }}
                                                        >
                                                            {course.code}
                                                        </span>
                                                        {/* Check button at bottom right */}
                                                        <button
                                                            onClick={(e) => toggleCourseCompletion(course._id, e)}
                                                            className="w-4 h-4 rounded flex items-center justify-center transition-all z-30"
                                                            style={{
                                                                backgroundColor: isCompleted
                                                                    ? (christmasTheme ? '#f59e0b' : '#5C6BC0')
                                                                    : '#e5e7eb',
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
