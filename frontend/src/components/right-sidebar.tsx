import { RecentActivity } from './recent-activity';
import { FeaturedComments } from './featured-comments';
import { TopUsersCard } from './top-users';
import { CurriculumModal } from './curriculum-modal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Activity, MessageSquare, Trophy, BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { memo } from 'react';

/**
 * MOCK DATA - Eventos próximos
 * BACKEND TODO: Replace with API call GET /api/events/upcoming?limit=3
 */
const MOCK_EVENTS = [
  {
    id: '1',
    title: 'Semana de Exámenes Parciales',
    date: '20 Dic 2024',
    type: 'academic',
  },
  {
    id: '2',
    title: 'Taller de Programación Web',
    date: '22 Dic 2024',
    type: 'workshop',
  },
  {
    id: '3',
    title: 'Feria de Proyectos',
    date: '15 Ene 2025',
    type: 'event',
  },
];

/**
 * MOCK DATA - Links de guía
 * isModal: true means it opens a modal instead of navigating
 */
const GUIDE_LINKS = [
  { label: 'Malla Curricular', href: '/guia/malla', icon: '📚', isModal: true },
  { label: 'Consejos para Nuevos', href: '/guia/consejos', icon: '💡', isModal: false },
  { label: 'Preguntas Frecuentes', href: '/guia/faq', icon: '❓', isModal: false },
];

export const RightSidebar = memo(function RightSidebar() {

  return (
    <div className="space-y-4">
      {/* All Collapsible Sections */}
      <Accordion type="multiple" defaultValue={['top-users', 'guide', 'events']} className="space-y-3">
        {/* Top Users - Collapsible */}
        <AccordionItem value="top-users" className="border-none">
          <AccordionTrigger className="hover:no-underline cursor-pointer glass-card gradient-border shadow-sm px-4 py-4 rounded-lg hover:bg-accent/50 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold">Top Usuarios</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <TopUsersCard />
          </AccordionContent>
        </AccordionItem>

        {/* Guía para Cachimbos - Collapsible */}
        <AccordionItem value="guide" className="border-none">
          <AccordionTrigger className="hover:no-underline cursor-pointer glass-card gradient-border shadow-sm px-4 py-4 rounded-lg hover:bg-accent/50 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold">Guía para Cachimbos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <Card className="glass-card gradient-border shadow-modern">
              <CardContent className="pt-4 pb-3 px-4 space-y-2">
                {GUIDE_LINKS.map((link) => (
                  link.isModal ? (
                    <CurriculumModal
                      key={link.href}
                      trigger={
                        <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group">
                          <div className="flex items-center space-x-2">
                            <span>{link.icon}</span>
                            <span className="text-sm font-medium">{link.label}</span>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      }
                    />
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{link.icon}</span>
                        <span className="text-sm font-medium">{link.label}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  )
                ))}
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link to="/guia">Ver guía completa</Link>
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Eventos Próximos - Collapsible */}
        <AccordionItem value="events" className="border-none">
          <AccordionTrigger className="hover:no-underline cursor-pointer glass-card gradient-border shadow-sm px-4 py-4 rounded-lg hover:bg-accent/50 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold">Eventos Próximos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <Card className="glass-card gradient-border shadow-modern">
              <CardContent className="pt-4 pb-3 px-4 space-y-2">
                {MOCK_EVENTS.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" asChild>
                  <Link to="/eventos">Ver todos los eventos</Link>
                </Button>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Recent Activity - Collapsible */}
        <AccordionItem value="activity" className="border-none">
          <AccordionTrigger className="hover:no-underline cursor-pointer glass-card gradient-border shadow-sm px-4 py-4 rounded-lg hover:bg-accent/50 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold">Actividad Reciente</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <RecentActivity />
          </AccordionContent>
        </AccordionItem>

        {/* Featured Comments - Collapsible */}
        <AccordionItem value="comments" className="border-none">
          <AccordionTrigger className="hover:no-underline cursor-pointer glass-card gradient-border shadow-sm px-4 py-4 rounded-lg hover:bg-accent/50 transition-all">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-base font-semibold">Comentarios Destacados</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-3">
            <FeaturedComments />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
});