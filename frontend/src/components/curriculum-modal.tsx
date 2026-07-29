import { useState, useMemo, memo, useRef, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { GraduationCap, ArrowRight, Lock, Check } from 'lucide-react'
import { useApp } from './app-context'
import { Course, COURSE_TYPE_COLORS_LIGHT, COURSE_TYPE_COLORS_DARK, COURSE_TYPE_COLORS_CHRISTMAS_LIGHT, COURSE_TYPE_COLORS_CHRISTMAS_DARK, CYCLE_COLORS_LIGHT, CYCLE_COLORS_DARK, CYCLE_COLORS_CHRISTMAS_LIGHT, CYCLE_COLORS_CHRISTMAS_DARK } from './curriculum-colors'
import { toTitleCase, toRoman, getShortName, getAllPrerequisites, getAllDescendants } from './curriculum-helpers'
import { MOCK_CURRICULUM } from './curriculum-data'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

interface CurriculumModalProps {
  trigger: React.ReactNode
}

export const CurriculumModal = memo(function CurriculumModal({ trigger }: CurriculumModalProps) {
  const { user, authStatus, theme, christmasTheme } = useApp()
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const courseRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [completedCourses, setCompletedCourses] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAllCourses = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses`)
        if (!response.ok) throw new Error('Failed to fetch all courses')
        const data: Course[] = await response.json()
        setAllCourses(data.map(c => ({ ...c, code: c._id, type: c.type || 'basic' })))
      } catch (err: any) {
        console.warn('Backend courses endpoint not available, using mock data:', err.message)
        setAllCourses(MOCK_CURRICULUM)
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAllCourses()
  }, [])

  useEffect(() => {
    const fetchCompletedCourses = async () => {
      if (authStatus !== 'authenticated' || !user) {
        setCompletedCourses(new Set())
        return
      }
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}/api/settings/completed-courses`, {
          headers: { 'x-auth-token': token || '' },
        })
        if (!response.ok) throw new Error('Failed to fetch completed courses')
        const data: string[] = await response.json()
        setCompletedCourses(new Set(data))
      } catch (err: any) {
        console.error('Error fetching completed courses:', err)
        setError(err.message)
      }
    }
    fetchCompletedCourses()
  }, [authStatus, user])

  const curriculumByCycle = useMemo(() => {
    const cyclesMap = new Map<number, Course[]>()
    allCourses.forEach(course => {
      if (!cyclesMap.has(course.cycle)) cyclesMap.set(course.cycle, [])
      cyclesMap.get(course.cycle)?.push(course)
    })
    return Array.from(cyclesMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([cycle, courses]) => ({ cycle, courses }))
  }, [allCourses])

  const { prereqMap, unlocksMap } = useMemo(() => {
    const prereqMap: Record<string, string[]> = {}
    const unlocksMap: Record<string, string[]> = {}
    allCourses.forEach(course => {
      prereqMap[course._id] = course.prerequisites || []
      course.prerequisites?.forEach(prereqId => {
        if (!unlocksMap[prereqId]) unlocksMap[prereqId] = []
        unlocksMap[prereqId].push(course._id)
      })
    })
    return { prereqMap, unlocksMap }
  }, [allCourses])

  const highlighted = useMemo(() => {
    if (!hoveredCourseId) return { prereqs: [], unlocks: [] }
    return {
      prereqs: getAllPrerequisites(hoveredCourseId, prereqMap),
      unlocks: getAllDescendants(hoveredCourseId, unlocksMap),
    }
  }, [hoveredCourseId, prereqMap, unlocksMap])

  const [arrowTrigger, setArrowTrigger] = useState(0)

  const toggleCourseCompletion = useCallback(async (courseId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (authStatus !== 'authenticated' || !user) {
      alert('Debes iniciar sesion para marcar cursos como completados.')
      return
    }
    const isCurrentlyCompleted = completedCourses.has(courseId)
    const token = localStorage.getItem('token')
    setCompletedCourses(prev => {
      const s = new Set(prev)
      if (isCurrentlyCompleted) s.delete(courseId); else s.add(courseId)
      return s
    })
    try {
      const method = isCurrentlyCompleted ? 'DELETE' : 'POST'
      const url = isCurrentlyCompleted
        ? `${API_BASE_URL}/api/settings/completed-courses/${courseId}`
        : `${API_BASE_URL}/api/settings/completed-courses`
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token || '' },
        body: method === 'POST' ? JSON.stringify({ courseId }) : undefined,
      })
      if (!response.ok) throw new Error(`Failed to ${isCurrentlyCompleted ? 'remove' : 'add'} completed course`)
    } catch {
      setCompletedCourses(prev => {
        const s = new Set(prev)
        if (isCurrentlyCompleted) s.add(courseId); else s.delete(courseId)
        return s
      })
      alert('Error al actualizar el estado del curso.')
    }
  }, [completedCourses, authStatus, user])

  const allArrows = useMemo(() => {
    if (!containerRef.current || arrowTrigger === 0) return []
    const containerRect = containerRef.current.getBoundingClientRect()
    const arrows: { x1: number; y1: number; x2: number; y2: number; from: string; to: string }[] = []
    curriculumByCycle.forEach(cycle => {
      cycle.courses.forEach(course => {
        ;(course.prerequisites || []).forEach(prereqId => {
          const fromEl = courseRefs.current[prereqId]
          const toEl = courseRefs.current[course._id]
          if (fromEl && toEl) {
            const fromRect = fromEl.getBoundingClientRect()
            const toRect = toEl.getBoundingClientRect()
            arrows.push({
              x1: fromRect.right - containerRect.left,
              y1: fromRect.top + fromRect.height / 2 - containerRect.top,
              x2: toRect.left - containerRect.left,
              y2: toRect.top + toRect.height / 2 - containerRect.top,
              from: prereqId, to: course._id,
            })
          }
        })
      })
    })
    return arrows
  }, [arrowTrigger, curriculumByCycle])

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const recalc = () => setArrowTrigger(t => t + 1)
    const t1 = setTimeout(recalc, 100)
    const t2 = setTimeout(recalc, 300)
    const t3 = setTimeout(recalc, 500)
    window.addEventListener('resize', recalc)
    const container = containerRef.current
    container?.addEventListener('scroll', recalc)
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
      window.removeEventListener('resize', recalc)
      container?.removeEventListener('scroll', recalc)
    }
  }, [isOpen])

  if (isLoading || error) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-3">
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Malla Curricular - Ingenieria de Sistemas
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            {isLoading ? 'Cargando malla curricular...' : <span className="text-red-500">Error: {error}</span>}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  const getCycleColors = () => christmasTheme
    ? (theme === 'dark' ? CYCLE_COLORS_CHRISTMAS_DARK : CYCLE_COLORS_CHRISTMAS_LIGHT)
    : (theme === 'dark' ? CYCLE_COLORS_DARK : CYCLE_COLORS_LIGHT)

  const getCourseColors = () => christmasTheme
    ? (theme === 'dark' ? COURSE_TYPE_COLORS_CHRISTMAS_DARK : COURSE_TYPE_COLORS_CHRISTMAS_LIGHT)
    : (theme === 'dark' ? COURSE_TYPE_COLORS_DARK : COURSE_TYPE_COLORS_LIGHT)

  const glowColor = christmasTheme ? 'rgba(251, 191, 36, 0.4)' : 'rgba(99, 102, 241, 0.4)'
  const cycleColors = getCycleColors()
  const courseColors = getCourseColors()

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-7xl w-[95vw] h-full max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Malla Curricular - Ingenieria de Sistemas
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-2 bg-muted/30 border-y flex flex-wrap gap-x-6 gap-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: christmasTheme ? '#fff1f2' : '#ecfdf5', border: `1px solid ${christmasTheme ? '#fb7185' : '#34d399'}` }} />
            <span>Curso</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ marginLeft: '5px' }}>
            <div className="w-3 h-3 rounded" style={{ backgroundColor: christmasTheme ? '#fef3c7' : '#C5CBE9', border: `1px solid ${christmasTheme ? '#f59e0b' : '#5C6BC0'}` }} />
            <span>Completado</span>
          </div>
          <div className="border-l border-border pl-4 flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-amber-600" />
            <span>Prerequisito</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ArrowRight className={`h-3 w-3 ${christmasTheme ? 'text-rose-500' : 'text-emerald-600'}`} />
            <span>Desbloquea</span>
          </div>
        </div>

        <div
          className={`flex-1 overflow-auto p-4 relative ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-50'}`}
          ref={containerRef}
          onClick={(e) => { if (e.target === e.currentTarget) setHoveredCourseId(null) }}
        >
          <svg className="absolute inset-0 pointer-events-none z-20" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="circle-end" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                <circle cx="4" cy="4" r="3" fill={christmasTheme ? '#dc2626' : '#22c55e'} />
              </marker>
            </defs>
            <style>{`
              @keyframes flow { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
              .animated-line { stroke-dasharray: 10, 5; animation: flow 0.8s linear infinite; }
              .highlighted-line { stroke-dasharray: 8, 4; animation: flow 0.3s linear infinite, pulse-glow 0.5s ease-in-out infinite alternate; }
              @keyframes pulse-glow { 0% { filter: drop-shadow(0 0 2px ${christmasTheme ? '#dc2626' : '#16a34a'}); stroke-width: 3; } 100% { filter: drop-shadow(0 0 8px ${christmasTheme ? '#ef4444' : '#22c55e'}); stroke-width: 4; } }
              .dimmed-line { opacity: 0.1; }
            `}</style>
            {allArrows.map((arrow, i) => {
              const dx = arrow.x2 - arrow.x1
              const midX = arrow.x1 + dx / 2
              const path = `M ${arrow.x1} ${arrow.y1} C ${midX} ${arrow.y1}, ${midX} ${arrow.y2}, ${arrow.x2} ${arrow.y2}`
              const connectedCourses = hoveredCourseId ? [hoveredCourseId, ...highlighted.prereqs, ...highlighted.unlocks] : []
              const isHighlighted = connectedCourses.includes(arrow.from) && connectedCourses.includes(arrow.to)
              const lineClass = hoveredCourseId ? (isHighlighted ? 'highlighted-line' : 'dimmed-line') : 'animated-line'
              return (
                <path key={i} d={path} fill="none"
                  stroke={isHighlighted ? (christmasTheme ? '#dc2626' : '#16a34a') : (christmasTheme ? '#ef4444' : '#22c55e')}
                  strokeWidth={isHighlighted ? '3' : '2.5'} strokeOpacity={isHighlighted ? '1' : '0.8'}
                  className={lineClass} markerEnd="url(#circle-end)" />
              )
            })}
          </svg>

          <div className="flex gap-12 min-w-max">
            {curriculumByCycle.map((cycle) => {
              const cc = cycleColors[cycle.cycle] || cycleColors[10]
              return (
                <div key={cycle.cycle} className="w-[130px] flex-shrink-0">
                  <div className="text-center py-2 rounded-lg font-bold text-sm mb-2"
                    style={{ backgroundColor: cc.bg, color: cc.text, boxShadow: `0 4px 14px ${glowColor}, 0 2px 4px rgba(0,0,0,0.1)` }}>
                    Ciclo {toRoman(cycle.cycle)}
                  </div>
                  <div className="space-y-2">
                    {cycle.courses.map((course) => {
                      const colors = courseColors[course.type]
                      const isHovered = hoveredCourseId === course._id
                      const isPrereq = highlighted.prereqs.includes(course._id)
                      const isUnlock = highlighted.unlocks.includes(course._id)
                      const isConnected = isHovered || isPrereq || isUnlock
                      const isCompleted = completedCourses.has(course._id)

                      let cardStyle: React.CSSProperties = { backgroundColor: colors.bg, borderColor: colors.border }
                      let className = 'border-2 rounded-lg p-2 cursor-pointer transition-all duration-200 shadow-sm h-[65px] flex flex-col justify-between overflow-hidden'

                      if (hoveredCourseId) {
                        if (isConnected) {
                          cardStyle = christmasTheme
                            ? (theme === 'dark' ? { backgroundColor: '#4c1d24', borderColor: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,0.3)' } : { backgroundColor: '#ffe4e6', borderColor: '#f43f5e', boxShadow: '0 0 8px rgba(244,63,94,0.25)' })
                            : (theme === 'dark' ? { backgroundColor: '#14532d', borderColor: '#4ade80', boxShadow: '0 0 8px rgba(74,222,128,0.3)' } : { backgroundColor: '#dcfce7', borderColor: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.25)' })
                          className = `border-2 rounded-lg p-2 shadow-lg z-10 h-[65px] flex flex-col justify-between overflow-hidden ring-1 ${christmasTheme ? 'ring-rose-400' : 'ring-green-400'}`
                        } else {
                          cardStyle = { ...cardStyle, opacity: 0.3 }
                        }
                      }

                      if (isCompleted) {
                        cardStyle = {
                          ...cardStyle,
                          backgroundColor: christmasTheme ? (theme === 'dark' ? '#78350f' : '#fef3c7') : (theme === 'dark' ? '#394AAE' : '#C5CBE9'),
                          borderColor: christmasTheme ? '#f59e0b' : '#5C6BC0',
                          opacity: Math.min((cardStyle.opacity || 1) as number, 0.85),
                        }
                      }

                      return (
                        <div key={course._id}
                          ref={(el) => { courseRefs.current[course._id] = el }}
                          className={`${className} relative`} style={cardStyle}
                          onClick={() => setHoveredCourseId(prev => prev === course._id ? null : course._id)}>
                          <p className="text-xs font-bold leading-tight mb-1.5 line-clamp-2"
                            style={{ color: isCompleted ? (theme === 'dark' ? '#ffffff' : '#1f2937') : colors.text }}
                            title={toTitleCase(course.name)}>
                            {getShortName(course.name)}
                          </p>
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-mono"
                              style={{ color: isCompleted ? (theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.7)') : undefined }}>
                              {course.code}
                            </span>
                            <button onClick={(e) => toggleCourseCompletion(course._id, e)}
                              className="w-4 h-4 rounded flex items-center justify-center transition-all z-30"
                              style={{ backgroundColor: isCompleted ? (christmasTheme ? '#f59e0b' : '#5C6BC0') : '#e5e7eb', color: isCompleted ? 'white' : '#9ca3af' }}
                              title={isCompleted ? 'Marcar como pendiente' : 'Marcar como completado'}>
                              <Check className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})
