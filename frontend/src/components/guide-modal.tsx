import { memo, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Lightbulb, HelpCircle, BookOpen, Users, Calendar, MapPin } from 'lucide-react';
import { useApp } from './app-context';

interface GuideModalProps {
    trigger: ReactNode;
    type: 'consejos' | 'faq';
}

// Mock data for tips
const CONSEJOS_DATA = [
    {
        Icon: BookOpen,
        title: 'Organiza tu tiempo',
        description: 'Crea un horario de estudio equilibrado. Dedica tiempo específico para cada curso y respeta tus descansos.',
    },
    {
        Icon: Users,
        title: 'Únete a grupos de estudio',
        description: 'Estudiar en grupo puede ayudarte a entender mejor los temas difíciles y hacer amigos.',
    },
    {
        Icon: Calendar,
        title: 'No dejes todo para el final',
        description: 'Empieza los trabajos y proyectos con anticipación. El último minuto es tu peor enemigo.',
    },
    {
        Icon: MapPin,
        title: 'Conoce tu campus',
        description: 'Explora las instalaciones: biblioteca, laboratorios, cafetería y áreas de estudio.',
    },
    {
        Icon: Lightbulb,
        title: 'Pregunta sin miedo',
        description: 'No tengas vergüenza de preguntar a profesores o compañeros. Todos estuvimos en tu lugar.',
    },
];

// Mock data for FAQ
const FAQ_DATA = [
    {
        question: '¿Cómo me inscribo en los cursos?',
        answer: 'Ingresa al sistema académico SIGA con tu código de estudiante durante el período de matrícula. Selecciona los cursos según tu plan de estudios.',
    },
    {
        question: '¿Dónde encuentro mi horario de clases?',
        answer: 'Tu horario está disponible en SIGA > Matrícula > Ver Horario. También puedes verlo en la app móvil de la universidad.',
    },
    {
        question: '¿Cómo contacto a un profesor?',
        answer: 'Los correos de los profesores están en el sílabo de cada curso. También puedes buscarlos en el directorio de la facultad.',
    },
    {
        question: '¿Qué hago si repruebo un curso?',
        answer: 'Puedes llevarlo nuevamente en el siguiente ciclo. Consulta con tu asesor académico sobre las mejores opciones.',
    },
    {
        question: '¿Cómo accedo a la biblioteca virtual?',
        answer: 'Ingresa a biblioteca.unam.edu.pe con tu correo institucional. Tienes acceso a miles de libros y artículos.',
    },
    {
        question: '¿Dónde puedo hacer prácticas pre-profesionales?',
        answer: 'La bolsa de trabajo está en la oficina de bienestar universitario. También publicamos oportunidades aquí en WorkCodile.',
    },
];

export const GuideModal = memo(function GuideModal({ trigger, type }: GuideModalProps) {
    const { christmasTheme } = useApp();
    const isConsejos = type === 'consejos';
    const title = isConsejos ? 'Consejos para Nuevos Estudiantes' : 'Preguntas Frecuentes';
    const iconColorClass = christmasTheme ? 'text-red-500' : 'text-primary';
    const icon = isConsejos ? <Lightbulb className={`h-6 w-6 ${iconColorClass}`} /> : <HelpCircle className={`h-6 w-6 ${iconColorClass}`} />;

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        {icon}
                        {title}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-3">
                    {isConsejos ? (
                        // Consejos layout
                        CONSEJOS_DATA.map((consejo, index) => (
                            <Card key={index} className="sidebar-item hover:shadow-md transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <consejo.Icon className={`h-5 w-5 ${iconColorClass}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base">{consejo.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{consejo.description}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        // FAQ layout
                        FAQ_DATA.map((faq, index) => (
                            <Card key={index} className="sidebar-item hover:shadow-md transition-all cursor-pointer">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-muted rounded-lg">
                                            <HelpCircle className={`h-5 w-5 ${iconColorClass}`} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-base">{faq.question}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
});
