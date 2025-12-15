import { useState, useMemo, memo, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Badge } from './ui/badge';
import { GraduationCap, ArrowRight, Lock, Check } from 'lucide-react';

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

// === STYLING CONSTANTS (using hex values for inline styles) ===
const COURSE_TYPE_COLORS: Record<Course['type'], { bg: string; border: string; text: string }> = {
    general: { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a' },      // blue
    basic: { bg: '#ecfdf5', border: '#34d399', text: '#064e3b' },        // basic
    specialty: { bg: '#faf5ff', border: '#c084fc', text: '#581c87' },    // purple
    elective: { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12' },     // orange
    practice: { bg: '#fdf2f8', border: '#f472b6', text: '#831843' },     // pink
};

const COURSE_TYPE_LABELS: Record<Course['type'], string> = {
    general: 'General',
    basic: 'Básico',
    specialty: 'Especialidad',
    elective: 'Electivo',
    practice: 'Prácticas',
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

// === MOCK DATA - MALLA CURRICULAR (Datos reales de UNAM) ===
const MOCK_CURRICULUM: CycleData[] = [
    {
        cycle: 1,
        courses: [
            { id: 'IS-124', code: 'IS-124', name: 'REDACCION Y COMUNICACION', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-127', code: 'IS-127', name: 'BIOLOGIA Y MEDIO AMBIENTE', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-122', code: 'IS-122', name: 'MATEMATICA 1', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-123', code: 'IS-123', name: 'METODOLOGIA Y TECNICAS DE ESTUDIO', credits: 2, hours: 3, type: 'basic' },
            { id: 'IS-121', code: 'IS-121', name: 'FUNDAMENTOS DE PROGRAMACION', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-125', code: 'IS-125', name: 'FILOSOFIA', credits: 2, hours: 3, type: 'basic' },
            { id: 'IS-126', code: 'IS-126', name: 'SOCIOLOGIA Y REALIDAD NACIONAL', credits: 2, hours: 3, type: 'basic' },
        ],
    },
    {
        cycle: 2,
        courses: [
            { id: 'IS-225', code: 'IS-225', name: 'MATEMATICAS DISCRETAS 1', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-226', code: 'IS-226', name: 'MATEMATICA 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-122'] },
            { id: 'IS-224', code: 'IS-224', name: 'ALGEBRA LINEAL', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-122'] },
            { id: 'IS-223', code: 'IS-223', name: 'PROGRAMACION ORIENTADA A OBJETOS 1', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-121'] },
            { id: 'IS-221', code: 'IS-221', name: 'ESTRUCTURA DE DATOS', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-121'] },
            { id: 'IS-227', code: 'IS-227', name: 'ESTADISTICA BASICA', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-228', code: 'IS-228', name: 'ETICA', credits: 2, hours: 3, type: 'basic' },
        ],
    },
    {
        cycle: 3,
        courses: [
            { id: 'IS-325', code: 'IS-325', name: 'MATEMATICAS DISCRETAS 2', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-225'] },
            { id: 'IS-324', code: 'IS-324', name: 'MATEMATICA 3', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-226'] },
            { id: 'IS-327', code: 'IS-327', name: 'FISICA ELECTRICA', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-322', code: 'IS-322', name: 'PROGRAMACION ORIENTADA A OBJETOS 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-223'] },
            { id: 'IS-323', code: 'IS-323', name: 'FUNDAMENTOS DE SISTEMAS DE INFORMACION', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-223'] },
            { id: 'IS-321', code: 'IS-321', name: 'ANALISIS Y DISEÑO DE ALGORITMOS', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-221'] },
            { id: 'IS-326', code: 'IS-326', name: 'PROBABILIDADES', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-227'] },
        ],
    },
    {
        cycle: 4,
        courses: [
            { id: 'IS-424', code: 'IS-424', name: 'SISTEMAS OPERATIVOS', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-425', code: 'IS-425', name: 'MATEMATICA 4', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-324'] },
            { id: 'IS-426', code: 'IS-426', name: 'CIRCUITOS ELECTRICOS Y ELECTRONICOS', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-427', code: 'IS-427', name: 'INVESTIGACION OPERATIVA 1', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-422', code: 'IS-422', name: 'ANALISIS Y DISEÑO DE SISTEMAS 1', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-421', code: 'IS-421', name: 'ALGORITMOS PARALELOS', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-321'] },
            { id: 'IS-423', code: 'IS-423', name: 'BASE DE DATOS 1', credits: 4, hours: 6, type: 'basic' },
        ],
    },
    {
        cycle: 5,
        courses: [
            { id: 'IS-524', code: 'IS-524', name: 'APLICACIONES WEB 1', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-525', code: 'IS-525', name: 'METODOS NUMERICOS', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-425'] },
            { id: 'IS-526', code: 'IS-526', name: 'SISTEMAS DIGITALES', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-426'] },
            { id: 'IS-527', code: 'IS-527', name: 'INVESTIGACION OPERATIVA 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-427'] },
            { id: 'IS-522', code: 'IS-522', name: 'ANALISIS Y DISEÑO DE SISTEMAS 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-422'] },
            { id: 'IS-521', code: 'IS-521', name: 'SISTEMAS DISTRIBUIDOS', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-421'] },
            { id: 'IS-523', code: 'IS-523', name: 'BASE DE DATOS 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-423'] },
        ],
    },
    {
        cycle: 6,
        courses: [
            { id: 'IS-624', code: 'IS-624', name: 'APLICACIONES WEB 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-524'] },
            { id: 'IS-625', code: 'IS-625', name: 'REALIDAD AUMENTADA', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-626', code: 'IS-626', name: 'ARQUITECTURA DE COMPUTADORAS', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-526'] },
            { id: 'IS-623', code: 'IS-623', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES 1', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-621', code: 'IS-621', name: 'INGENIERIA DE SOFTWARE', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-522', 'IS-523'] },
            { id: 'IS-622', code: 'IS-622', name: 'BUSINESS INTELLIGENCE', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-523'] },
        ],
    },
    {
        cycle: 7,
        courses: [
            { id: 'IS-721', code: 'IS-721', name: 'DATA MINING', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-724', code: 'IS-724', name: 'PROGRAMACION DE VIDEO JUEGOS 1', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-726', code: 'IS-726', name: 'LENGUAJE DE BAJO NIVEL', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-626'] },
            { id: 'IS-723', code: 'IS-723', name: 'PROGRAMACION DE DISPOSITIVOS MOVILES 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-623'] },
            { id: 'IS-722', code: 'IS-722', name: 'CALIDAD DE SOFTWARE', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-621'] },
            { id: 'IS-725', code: 'IS-725', name: 'REDES 1', credits: 4, hours: 6, type: 'basic' },
        ],
    },
    {
        cycle: 8,
        courses: [
            { id: 'IS-821', code: 'IS-821', name: 'CLOUD COMPUTING', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-721'] },
            { id: 'IS-824', code: 'IS-824', name: 'PROGRAMACION DE VIDEO JUEGOS 2', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-724'] },
            { id: 'IS-823', code: 'IS-823', name: 'PROYECTO DE INVESTIGACION 1', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-822', code: 'IS-822', name: 'PROCESAMIENTO DE IMAGENES Y VIDEOS', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-827', code: 'IS-827', name: 'ROBOTICA 1', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-825', code: 'IS-825', name: 'INTERACCION HUMANO COMPUTADOR', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-826', code: 'IS-826', name: 'REDES 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-725'] },
        ],
    },
    {
        cycle: 9,
        courses: [
            { id: 'IS-924', code: 'IS-924', name: 'FORMACION DE EMPRESAS CON BASE TECNOLOGICA', credits: 3, hours: 4, type: 'basic' },
            { id: 'IS-922', code: 'IS-922', name: 'SEGURIDAD INFORMATICA', credits: 4, hours: 6, type: 'basic' },
            { id: 'IS-923', code: 'IS-923', name: 'PROYECTO DE INVESTIGACION 2', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-823'] },
            { id: 'IS-921', code: 'IS-921', name: 'INTELIGENCIA ARTIFICIAL 1', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-822'] },
            { id: 'IS-926', code: 'IS-926', name: 'ROBOTICA 2', credits: 3, hours: 4, type: 'basic', prerequisites: ['IS-827'] },
            { id: 'IS-925', code: 'IS-925', name: 'PROYECTOS INFORMATICOS 1', credits: 4, hours: 8, type: 'basic' },
        ],
    },
    {
        cycle: 10,
        courses: [
            { id: 'IS-1022', code: 'IS-1022', name: 'AUDITORIA DE SISTEMAS DE INFORMACION', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-922'] },
            { id: 'IS-1023', code: 'IS-1023', name: 'SEGURIDAD DE LA INFORMACION', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-922'] },
            { id: 'IS-1024', code: 'IS-1024', name: 'SEMINARIO DE TESIS', credits: 2, hours: 4, type: 'basic', prerequisites: ['IS-923'] },
            { id: 'IS-1021', code: 'IS-1021', name: 'INTELIGENCIA ARTIFICIAL 2', credits: 4, hours: 6, type: 'basic', prerequisites: ['IS-921'] },
            { id: 'IS-1026', code: 'IS-1026', name: 'PROYECTOS INFORMATICOS 2', credits: 4, hours: 8, type: 'basic', prerequisites: ['IS-925'] },
        ],
    },
];

// Helper function to create short abbreviations
function getShortName(fullName: string): string {
    const abbreviations: Record<string, string> = {
        'FUNDAMENTOS DE PROGRAMACION': 'F. Programacion',
        'MATEMATICA 1': 'Matemática 1',
        'MATEMATICA 2': 'Matemática 2',
        'MATEMATICA 3': 'Matemática 3',
        'MATEMATICA 4': 'Matemática 4',
        'METODOLOGIA Y TECNICAS DE ESTUDIO': 'Metodología',
        'REDACCION Y COMUNICACION': 'Redacción',
        'FILOSOFIA': 'Filosofía',
        'SOCIOLOGIA Y REALIDAD NACIONAL': 'Sociología',
        'BIOLOGIA Y MEDIO AMBIENTE': 'Biología',
        'ESTRUCTURA DE DATOS': 'Est. Datos',
        'PROGRAMACION ORIENTADA A OBJETOS 1': 'POO 1',
        'PROGRAMACION ORIENTADA A OBJETOS 2': 'POO 2',
        'ALGEBRA LINEAL': 'Álg. Lineal',
        'MATEMATICAS DISCRETAS 1': 'M. Discretas 1',
        'MATEMATICAS DISCRETAS 2': 'MDiscretas 2',
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
        'INVESTIGACION OPERATIVA 1': 'Inv. Operat. 1',
        'INVESTIGACION OPERATIVA 2': 'Inv. Operat.2',
        'SISTEMAS DISTRIBUIDOS': 'Sist. Distribuidos',
        'APLICACIONES WEB 1': 'App Web 1',
        'APLICACIONES WEB 2': 'App Web 2',
        'METODOS NUMERICOS': 'Mét. Numéricos',
        'SISTEMAS DIGITALES': 'Sist. Digitales',
        'INGENIERIA DE SOFTWARE': 'Ing. Software',
        'BUSINESS INTELLIGENCE': 'Business Intel.',
        'PROGRAMACION DE DISPOSITIVOS MOVILES 1': 'Pro. Móviles 1',
        'PROGRAMACION DE DISPOSITIVOS MOVILES 2': 'Pro. Móviles 2',
        'REALIDAD AUMENTADA': 'Realidad Aum.',
        'ARQUITECTURA DE COMPUTADORAS': 'Arq. Comp.',
        'DATA MINING': 'Data Mining',
        'CALIDAD DE SOFTWARE': 'Calidad SW',
        'PROGRAMACION DE VIDEO JUEGOS 1': 'Videojuego 1 ',
        'PROGRAMACION DE VIDEO JUEGOS 2': 'Videojuego 2',
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
        'SEGURIDAD INFORMATICA': 'Seg. Inform.',
        'FORMACION DE EMPRESAS CON BASE TECNOLOGICA': 'Form. Empresas',
        'PROYECTOS INFORMATICOS 1': 'Proy. Informat. 1',
        'PROYECTOS INFORMATICOS 2': 'Proy. Informat. 2',
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

    /**
     * ============================================================================
     * CURSOS COMPLETADOS - INTEGRACIÓN BACKEND (para Tux)
     * ============================================================================
     * 
     * ESTADO ACTUAL: Usa localStorage como fallback temporal.
     * OBJETIVO: Conectar con API del backend para persistir en MongoDB.
     * 
     * --- ENDPOINTS QUE TUX DEBE CREAR EN EL BACKEND ---
     * 
     * 1. GET /api/users/:userId/completed-courses
     *    - Retorna array de IDs de cursos completados: ["IS-122", "IS-124", ...]
     *    - Requiere autenticación (token JWT)
     * 
     * 2. POST /api/users/:userId/completed-courses
     *    - Body: { courseId: "IS-122" }
     *    - Agrega un curso a la lista de completados
     *    - Retorna: { success: true, completedCourses: [...] }
     * 
     * 3. DELETE /api/users/:userId/completed-courses/:courseId
     *    - Elimina un curso de la lista de completados
     *    - Retorna: { success: true, completedCourses: [...] }
     * 
     * --- MODELO MONGODB (Schema para User) ---
     * 
     * // En el modelo User agregar:
     * completedCourses: {
     *   type: [String],  // Array de IDs de cursos: ["IS-122", "IS-224", ...]
     *   default: []
     * }
     * 
     * --- CÓMO CONECTAR (reemplazar el código de abajo) ---
     * 
     * import { useAuth } from '../hooks/useAuth'; // o como tengan autenticación
     * import { useQuery, useMutation } from '@tanstack/react-query'; // si usan react-query
     * 
     * // En el componente:
     * const { user } = useAuth();
     * 
     * // Cargar cursos completados del backend:
     * const { data: completedCourses = [] } = useQuery({
     *   queryKey: ['completed-courses', user?.id],
     *   queryFn: () => fetch(`/api/users/${user.id}/completed-courses`).then(r => r.json()),
     *   enabled: !!user?.id
     * });
     * 
     * // Mutación para toggle:
     * const toggleMutation = useMutation({
     *   mutationFn: (courseId) => {
     *     const isCompleted = completedCourses.includes(courseId);
     *     if (isCompleted) {
     *       return fetch(`/api/users/${user.id}/completed-courses/${courseId}`, { method: 'DELETE' });
     *     } else {
     *       return fetch(`/api/users/${user.id}/completed-courses`, {
     *         method: 'POST',
     *         body: JSON.stringify({ courseId })
     *       });
     *     }
     *   },
     *   onSuccess: () => queryClient.invalidateQueries(['completed-courses'])
     * });
     * 
     * ============================================================================
     */

    // TEMPORAL: Usa localStorage hasta que Tux conecte el backend
    const [completedCourses, setCompletedCourses] = useState<Set<string>>(() => {
        // TODO (Tux): Reemplazar con useQuery para cargar de /api/users/:userId/completed-courses
        const saved = localStorage.getItem('workcodile-completed-courses');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // TEMPORAL: Guarda en localStorage hasta que Tux conecte el backend
    useEffect(() => {
        // TODO (Tux): Eliminar este useEffect cuando conectes el backend
        localStorage.setItem('workcodile-completed-courses', JSON.stringify([...completedCourses]));
    }, [completedCourses]);

    // Toggle curso completado
    const toggleCourseCompletion = useCallback((courseId: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Evita activar el click de la tarjeta

        // TODO (Tux): Reemplazar con toggleMutation.mutate(courseId)
        setCompletedCourses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(courseId)) {
                newSet.delete(courseId);
            } else {
                newSet.add(courseId);
            }
            return newSet;
        });
    }, []);

    // Calculate ALL arrows (always visible)
    const allArrows = useMemo(() => {
        if (!containerRef.current || arrowTrigger === 0) return [];

        const containerRect = containerRef.current.getBoundingClientRect();
        const newArrows: { x1: number; y1: number; x2: number; y2: number; from: string; to: string }[] = [];

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
                            from: prereqId,
                            to: course.id,
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
                        {MOCK_CURRICULUM.map((cycle) => {
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
                                            const isHovered = hoveredCourseId === course.id;
                                            const isPrereq = highlighted.prereqs.includes(course.id);
                                            const isUnlock = highlighted.unlocks.includes(course.id);
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

                                            const isCompleted = completedCourses.has(course.id);

                                            // Apply completed styling with cycle blue colors
                                            const completedStyle = isCompleted ? {
                                                ...cardStyle,
                                                backgroundColor: '#C5CBE9', // Lighter cycle blue
                                                borderColor: '#5C6BC0',     // Cycle 5 indigo
                                                opacity: Math.min((cardStyle.opacity || 1) as number, 0.85),
                                            } : cardStyle;

                                            return (
                                                <div
                                                    key={course.id}
                                                    ref={(el) => { courseRefs.current[course.id] = el; }}
                                                    className={`${className} relative`}
                                                    style={completedStyle}
                                                    onClick={() => setHoveredCourseId(prev => prev === course.id ? null : course.id)}
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
                                                            onClick={(e) => toggleCourseCompletion(course.id, e)}
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
