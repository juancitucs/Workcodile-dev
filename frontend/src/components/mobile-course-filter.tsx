import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { useApp } from './app-context';
import { 
  Filter,
  BookOpen, 
  MessageSquare,
  GraduationCap,
  X
} from 'lucide-react';

interface MobileCourseFilterProps {
  selectedCourse: string;
  onCourseSelect: (course: string) => void;
  postsCount: number;
}

export function MobileCourseFilter({ selectedCourse, onCourseSelect, postsCount }: MobileCourseFilterProps) {
  const { posts, getCoursesByCycle, getCourseById } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const getCourseCount = (courseId: string) => {
    if (courseId === 'all') return posts.length;
    return posts.filter(post => post.course === courseId).length;
  };

  const getCycleCount = (cycle: number) => {
    const cycleCourses = getCoursesByCycle(cycle);
    return cycleCourses.reduce((count, course) => count + getCourseCount(course.id), 0);
  };

  const cycles = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleCourseSelect = (courseId: string) => {
    onCourseSelect(courseId);
    setIsOpen(false);
  };

  const selectedCourseData = getCourseById(selectedCourse);
  const selectedCourseName = selectedCourse === 'all' 
    ? 'Todas las publicaciones' 
    : selectedCourseData 
    ? `${selectedCourseData.id} - Ciclo ${selectedCourseData.cycle}`
    : 'Curso seleccionado';

  return (
    <div className="lg:hidden mb-4">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span className="truncate max-w-[200px]">{selectedCourseName}</span>
            </div>
            <Badge variant="secondary" className="ml-2">
              {postsCount}
            </Badge>
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-[300px] p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>Filtrar por Curso</span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="px-6 pb-6 space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
            {/* All Posts Button */}
            <Button
              variant={selectedCourse === 'all' ? 'default' : 'ghost'}
              onClick={() => handleCourseSelect('all')}
              className="w-full justify-start h-auto p-3"
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

            {/* Cycles and Courses */}
            <Accordion type="multiple" className="w-full">
              {cycles.map((cycle) => {
                const cycleCourses = getCoursesByCycle(cycle);
                const cycleCount = getCycleCount(cycle);
                
                if (cycleCourses.length === 0) return null;

                return (
                  <AccordionItem key={cycle} value={`cycle-${cycle}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-2">
                        <div className="flex items-center space-x-3">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-medium">Ciclo {cycle}</span>
                        </div>
                        <Badge variant="outline" className="ml-2">
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
                            >
                              <Button
                                variant={isSelected ? 'default' : 'ghost'}
                                onClick={() => handleCourseSelect(course.id)}
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}