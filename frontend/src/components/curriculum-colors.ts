export interface Course {
  _id: string
  name: string
  cycle: number
  prerequisites: string[]
  type: 'general' | 'basic' | 'specialty' | 'elective' | 'practice'
  code: string
}

export const COURSE_TYPE_COLORS_LIGHT: Record<Course['type'], { bg: string; border: string; text: string }> = {
  general: { bg: '#eff6ff', border: '#60a5fa', text: '#1e3a8a' },
  basic: { bg: '#ecfdf5', border: '#34d399', text: '#064e3b' },
  specialty: { bg: '#faf5ff', border: '#c084fc', text: '#581c87' },
  elective: { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12' },
  practice: { bg: '#fdf2f8', border: '#f472b6', text: '#831843' },
}

export const COURSE_TYPE_COLORS_DARK: Record<Course['type'], { bg: string; border: string; text: string }> = {
  general: { bg: '#1e293b', border: '#64748b', text: '#94a3b8' },
  basic: { bg: '#14332a', border: '#4ade80', text: '#86efac' },
  specialty: { bg: '#2e1065', border: '#a78bfa', text: '#c4b5fd' },
  elective: { bg: '#292524', border: '#a8a29e', text: '#d6d3d1' },
  practice: { bg: '#3f1f3d', border: '#e879f9', text: '#f0abfc' },
}

export const COURSE_TYPE_COLORS_CHRISTMAS_LIGHT: Record<Course['type'], { bg: string; border: string; text: string }> = {
  general: { bg: '#fff1f2', border: '#fda4af', text: '#881337' },
  basic: { bg: '#fff1f2', border: '#fb7185', text: '#9f1239' },
  specialty: { bg: '#fdf2f8', border: '#f9a8d4', text: '#831843' },
  elective: { bg: '#fefce8', border: '#fcd34d', text: '#854d0e' },
  practice: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
}

export const COURSE_TYPE_COLORS_CHRISTMAS_DARK: Record<Course['type'], { bg: string; border: string; text: string }> = {
  general: { bg: '#3f1219', border: '#fda4af', text: '#ffe4e6' },
  basic: { bg: '#4c0519', border: '#fb7185', text: '#fce7f3' },
  specialty: { bg: '#3b0d2c', border: '#f9a8d4', text: '#fce7f3' },
  elective: { bg: '#3d2e05', border: '#fbbf24', text: '#fef9c3' },
  practice: { bg: '#0a3622', border: '#86efac', text: '#dcfce7' },
}

const makeCycleColors = (bg: string) =>
  Array.from({ length: 10 }, (_, i) => ({ [i + 1]: { bg, text: '#ffffff' } }))
    .reduce((a, b) => ({ ...a, ...b }), {} as Record<number, { bg: string; text: string }>)

export const CYCLE_COLORS_LIGHT = makeCycleColors('#6366f1')
export const CYCLE_COLORS_DARK = makeCycleColors('#4f46e5')

export const CYCLE_COLORS_CHRISTMAS_LIGHT: Record<number, { bg: string; text: string }> = {
  1: { bg: '#fefce8', text: '#713f12' }, 2: { bg: '#fef9c3', text: '#713f12' },
  3: { bg: '#fef08a', text: '#713f12' }, 4: { bg: '#fde047', text: '#713f12' },
  5: { bg: '#facc15', text: '#ffffff' }, 6: { bg: '#eab308', text: '#ffffff' },
  7: { bg: '#ca8a04', text: '#ffffff' }, 8: { bg: '#a16207', text: '#ffffff' },
  9: { bg: '#854d0e', text: '#ffffff' }, 10: { bg: '#713f12', text: '#ffffff' },
}

export const CYCLE_COLORS_CHRISTMAS_DARK: Record<number, { bg: string; text: string }> = {
  1: { bg: '#ca8a04', text: '#ffffff' }, 2: { bg: '#a16207', text: '#ffffff' },
  3: { bg: '#854d0e', text: '#ffffff' }, 4: { bg: '#713f12', text: '#ffffff' },
  5: { bg: '#5c3d10', text: '#ffffff' }, 6: { bg: '#4a310d', text: '#ffffff' },
  7: { bg: '#3d280b', text: '#ffffff' }, 8: { bg: '#302008', text: '#ffffff' },
  9: { bg: '#231806', text: '#ffffff' }, 10: { bg: '#1a1204', text: '#ffffff' },
}
