import { motion } from 'motion/react'

interface CrocodileIconProps {
  className?: string
  filled?: boolean
  animate?: boolean
}

export function CrocodileIcon({
  className = 'w-4 h-4',
  filled = false,
  animate = false,
}: CrocodileIconProps) {
  const Component = animate ? motion.svg : 'svg'
  const iconProps = animate
    ? {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 },
      }
    : {}

  return (
    <Component
      {...iconProps}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C2 12 4 8 8 8C12 8 16 10 20 10C21 10 22 11 22 12C22 13 21 14 20 14C16 14 12 16 8 16C4 16 2 12 2 12Z"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 10C20.5 9 21 8 22 8C22.5 8 23 8.5 23 9C23 9.5 22.5 10 22 10H20"
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="11" r="0.5" fill="currentColor" />
      <path
        d="M6 16L5 18M10 16L9 18M14 16L13 18M18 14L17 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Component>
  )
}

export function WorkCodileLogo({
  className = 'w-4 h-4',
  animate = false,
}: {
  className?: string
  animate?: boolean
}) {
  const Component = animate ? motion.div : 'div'
  const wrapperProps = animate
    ? {
        whileHover: { scale: 1.1 },
        whileTap: { scale: 0.95 },
      }
    : {}

  return (
    <Component {...wrapperProps} className={className} style={{ lineHeight: 0 }}>
      <CrocodileIcon className="w-full h-full" filled animate={animate} />
    </Component>
  )
}

export function CrocodileEmoji({ className = 'text-base' }: { className?: string }) {
  const sizeClass = className.includes('text-') ? className : 'w-4 h-4'
  const logoSize = sizeClass.includes('text-xs')
    ? 'w-4 h-4'
    : sizeClass.includes('text-sm')
      ? 'w-5 h-5'
      : sizeClass.includes('text-base')
        ? 'w-6 h-6'
        : sizeClass.includes('text-lg')
          ? 'w-8 h-8'
          : sizeClass.includes('text-xl')
            ? 'w-10 h-10'
            : 'w-5 h-5'

  return <WorkCodileLogo className={`${logoSize} inline-block`} animate />
}
