import { memo, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Calendar, MapPin, Clock, Users, GraduationCap, Trophy, BookOpen, Briefcase } from 'lucide-react';
import { Badge } from './ui/badge';

interface EventsModalProps {
    trigger: ReactNode;
}

// Eventos de la Universidad Nacional de Moquegua - Noviembre a Diciembre 2024
const UNAM_EVENTS = [
    {
        id: '1',
        title: 'Semana de Exámenes Parciales',
        date: '18 - 22 Nov 2024',
        time: 'Todo el día',
        location: 'Campus UNAM',
        type: 'academic',
        icon: BookOpen,
        description: 'Período de evaluaciones parciales para todos los programas académicos.',
    },
    {
        id: '2',
        title: 'Feria de Proyectos de Ingeniería',
        date: '25 Nov 2024',
        time: '9:00 AM - 5:00 PM',
        location: 'Auditorio Principal',
        type: 'event',
        icon: GraduationCap,
        description: 'Exposición de proyectos de fin de ciclo de las carreras de Ingeniería.',
    },
    {
        id: '3',
        title: 'Taller de Programación Web con React',
        date: '28 Nov 2024',
        time: '3:00 PM - 6:00 PM',
        location: 'Laboratorio de Cómputo 3',
        type: 'workshop',
        icon: Briefcase,
        description: 'Taller práctico de desarrollo web moderno organizado por la Escuela de Sistemas.',
    },
    {
        id: '4',
        title: 'Campeonato Interfacultades de Vóley',
        date: '02 Dic 2024',
        time: '2:00 PM',
        location: 'Polideportivo UNAM',
        type: 'sports',
        icon: Trophy,
        description: 'Torneo deportivo entre facultades. ¡Ven a apoyar a tu equipo!',
    },
    {
        id: '5',
        title: 'Conferencia: Inteligencia Artificial en Minería',
        date: '05 Dic 2024',
        time: '10:00 AM - 12:00 PM',
        location: 'Auditorio de Ingeniería',
        type: 'conference',
        icon: Users,
        description: 'Charla magistral sobre aplicaciones de IA en el sector minero de Moquegua.',
    },
    {
        id: '6',
        title: 'Inscripción de Matrícula Ciclo 2025-I',
        date: '09 - 13 Dic 2024',
        time: '8:00 AM - 4:00 PM',
        location: 'Oficina de Registros Académicos',
        type: 'academic',
        icon: BookOpen,
        description: 'Período de matrícula para el ciclo académico 2025-I.',
    },
    {
        id: '7',
        title: 'Hackathon UNAM 2024',
        date: '14 - 15 Dic 2024',
        time: '24 horas',
        location: 'Centro de Innovación',
        type: 'event',
        icon: GraduationCap,
        description: 'Maratón de programación con premios para los mejores proyectos tecnológicos.',
    },
    {
        id: '8',
        title: 'Ceremonia de Graduación',
        date: '18 Dic 2024',
        time: '6:00 PM',
        location: 'Plaza Cívica UNAM',
        type: 'ceremony',
        icon: GraduationCap,
        description: 'Ceremonia de graduación promoción 2024. Egresados de todas las facultades.',
    },
    {
        id: '9',
        title: 'Semana de Exámenes Finales',
        date: '16 - 20 Dic 2024',
        time: 'Todo el día',
        location: 'Campus UNAM',
        type: 'academic',
        icon: BookOpen,
        description: 'Período de evaluaciones finales del ciclo académico 2024-II.',
    },
    {
        id: '10',
        title: 'Clausura del Año Académico 2024',
        date: '22 Dic 2024',
        time: '11:00 AM',
        location: 'Auditorio Principal',
        type: 'ceremony',
        icon: Trophy,
        description: 'Evento de cierre del año académico con premiación a mejores estudiantes.',
    },
];

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'academic':
            return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        case 'workshop':
            return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        case 'event':
            return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
        case 'sports':
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
        case 'conference':
            return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400';
        case 'ceremony':
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
        default:
            return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
};

const getEventTypeLabel = (type: string) => {
    switch (type) {
        case 'academic': return 'Académico';
        case 'workshop': return 'Taller';
        case 'event': return 'Evento';
        case 'sports': return 'Deportes';
        case 'conference': return 'Conferencia';
        case 'ceremony': return 'Ceremonia';
        default: return 'Evento';
    }
};

export const EventsModal = memo(function EventsModal({ trigger }: EventsModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <Calendar className="h-6 w-6 text-green-500" />
                        Eventos UNAM Moquegua
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        Calendario de eventos - Noviembre a Diciembre 2024
                    </p>
                </DialogHeader>

                <div className="mt-4 space-y-3">
                    {UNAM_EVENTS.map((event) => {
                        const IconComponent = event.icon;
                        return (
                            <Card key={event.id} className="sidebar-item hover:shadow-md transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${getEventTypeColor(event.type)}`}>
                                            <IconComponent className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <h3 className="sidebar-item-title font-semibold text-base truncate">{event.title}</h3>
                                                <Badge variant="secondary" className={`text-xs shrink-0 ${getEventTypeColor(event.type)}`}>
                                                    {getEventTypeLabel(event.type)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {event.date}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {event.time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
});
