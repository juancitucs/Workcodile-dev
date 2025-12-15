import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import { useApp } from './app-context';
import {
  Users,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Clock,
  TrendingUp,
  Filter
} from 'lucide-react';

interface SidebarProps {
  selectedCourse: string;
  onCourseSelect: (course: string) => void;
  sortBy: 'recent' | 'popular' | 'commented';
  onSortChange: (sort: 'recent' | 'popular' | 'commented') => void;
  className?: string;
}

export function Sidebar({ selectedCourse, onCourseSelect, sortBy, onSortChange }: SidebarProps) {
  const { posts, user, getCoursesByCycle } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle course selection with navigation back to feed if on post detail page
  const handleCourseChange = (course: string) => {
    onCourseSelect(course);
    // If we're on a post detail page (/post/:id), navigate back to home
    if (location.pathname.startsWith('/post/')) {
      navigate('/');
    }
  };

  const getCourseCount = (courseId: string) => {
    if (courseId === 'all') return posts.length;
    return posts.filter(post => post.course === courseId).length;
  };

  const getCycleCount = (cycle: number) => {
    const cycleCourses = getCoursesByCycle(cycle);
    return cycleCourses.reduce((count, course) => count + getCourseCount(course.id), 0);
  };



  const cycles = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card gradient-border shadow-modern fade-in-up">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-primary p-2 rounded-lg">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">¡Hola, {user?.name?.split(' ')[0]}!</h3>
                <p className="text-sm text-muted-foreground">Bienvenido a WorkCodile</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{posts.length}</p>
                <p className="text-xs text-muted-foreground">Posts totales</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">
                  {posts.reduce((sum, post) => sum + post.comments.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Comentarios</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Publicaciones Section */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="glass-card gradient-border shadow-modern">
          <CardHeader className="pb-0 pt-3 px-4">
            <CardTitle className="text-base flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>Publicaciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-3 px-4">
            {/* Sort Controls Only */}
            <div className="space-y-1">
              <label className="text-xs font-medium block">Ordenar por</label>
              <Select
                value={sortBy}
                onValueChange={onSortChange}
              >
                <SelectTrigger className="w-full h-9 cursor-pointer">
                  <Filter className="h-3 w-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span className="text-sm">Más recientes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="popular" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-sm">Más populares</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="commented" className="cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-sm">Más comentados</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cycles and Courses */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card gradient-border shadow-modern">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-base flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span>Ciclos y Cursos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* All Posts Button - First filter option */}
            <Button
              variant={selectedCourse === 'all' ? 'default' : 'ghost'}
              onClick={() => handleCourseChange('all')}
              className="w-full justify-start h-auto p-3 hover-lift transition-all duration-300 mb-4"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-3">
                  <MessageSquare className={`h-4 w-4 ${selectedCourse === 'all' ? 'text-primary-foreground' : 'text-primary'}`} />
                  <div className="text-left">
                    <p className="font-medium">Todas las Publicaciones</p>
                    <p className={`text-xs ${selectedCourse === 'all' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      Ver todos los cursos
                    </p>
                  </div>
                </div>
                <Badge
                  variant={selectedCourse === 'all' ? 'secondary' : 'outline'}
                  className="ml-2"
                >
                  {posts.length}
                </Badge>
              </div>
            </Button>

            <Accordion type="multiple" className="w-full">
              {cycles.map((cycle) => {
                const cycleCourses = getCoursesByCycle(cycle);
                const cycleCount = getCycleCount(cycle);

                if (cycleCourses.length === 0) return null;

                const isCycleSelected = selectedCourse === `cycle-${cycle}`;
                return (
                  <AccordionItem key={cycle} value={`cycle-${cycle}`}>
                    <AccordionTrigger
                      className={`hover:no-underline cursor-pointer ${isCycleSelected ? 'bg-primary/10 text-primary' : ''}`}
                      onClick={() => handleCourseChange(`cycle-${cycle}`)}
                    >
                      <div className="flex items-center justify-between w-full mr-2">
                        <div className="flex items-center space-x-3">
                          <BookOpen className={`h-4 w-4 ${isCycleSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className={`font-medium ${isCycleSelected ? 'text-primary' : ''}`}>Ciclo {cycle}</span>
                        </div>
                        <Badge variant={isCycleSelected ? 'default' : 'outline'} className="ml-2">
                          {cycleCount}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1 pl-4">
                        {cycleCourses.map((course) => {
                          const courseCount = getCourseCount(course.id);
                          const isSelected = selectedCourse === course.id;

                          return (
                            <motion.div
                              key={course.id}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className="cursor-pointer"
                            >
                              <Button
                                variant={isSelected ? 'default' : 'ghost'}
                                onClick={() => handleCourseChange(course.id)}
                                className="w-full justify-start h-auto p-2 text-xs"
                                size="sm"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="text-left">
                                    <p className="font-medium">{course.id}</p>
                                    <p className={`text-xs truncate max-w-[140px] ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                      {course.name}
                                    </p>
                                  </div>
                                  {courseCount > 0 && (
                                    <Badge
                                      variant={isSelected ? 'secondary' : 'outline'}
                                      className="ml-1 text-xs px-1"
                                    >
                                      {courseCount}
                                    </Badge>
                                  )}
                                </div>
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>


    </div>
  );
}