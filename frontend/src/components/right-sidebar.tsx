import { RecentActivity } from './recent-activity';
import { FeaturedComments } from './featured-comments';
import { TopUsersCard } from './top-users';
import { CurriculumModal } from './curriculum-modal';
import { GuideModal } from './guide-modal';
import { EventsModal } from './events-modal';
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
  { label: 'Malla Curricular', href: '/guia/malla', icon: '📚', modalType: 'curriculum' as const },
  { label: 'Consejos para Nuevos', href: '/guia/consejos', icon: '💡', modalType: 'consejos' as const },
  { label: 'Preguntas Frecuentes', href: '/guia/faq', icon: '❓', modalType: 'faq' as const },
];

export const RightSidebar = memo(function RightSidebar() {

  return (
    <div className="space-y-4">
      {/* All Collapsible Sections */}
      <Accordion type="multiple" defaultValue={['top-users']} className="space-y-3">
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
              <CardContent className="pt-4 pb-4 px-4 space-y-3">
                {GUIDE_LINKS.map((link) => {
                  const buttonContent = (
                    <div className="guide-button flex items-center justify-between p-3 rounded-xl cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="guide-button-icon p-2 rounded-lg bg-muted transition-all">
                          <span className="text-lg">{link.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="guide-button-text text-sm font-semibold transition-colors">
                            {link.label}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="guide-button-arrow h-4 w-4 text-muted-foreground transition-all" />
                    </div>
                  );

                  if (link.modalType === 'curriculum') {
                    return <CurriculumModal key={link.href} trigger={buttonContent} />;
                  } else if (link.modalType === 'consejos') {
                    return <GuideModal key={link.href} trigger={buttonContent} type="consejos" />;
                  } else {
                    return <GuideModal key={link.href} trigger={buttonContent} type="faq" />;
                  }
                })}
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
                    className="sidebar-item flex items-center justify-between p-2.5 cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="sidebar-item-title text-sm font-medium truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                  </div>
                ))}
                <EventsModal
                  trigger={
                    <Button variant="outline" className="w-full mt-2">
                      Ver todos los eventos
                    </Button>
                  }
                />
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