import { motion } from 'motion/react'
import workcodinoImg from '../assets/workcodino.png'

export function WorkCodileLogo({
  className = 'w-8 h-8',
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
    <Component {...wrapperProps} className={`${className} inline-grid place-items-center overflow-hidden`}>
      <img
        src={workcodinoImg}
        alt="WorkCodile Logo"
        className="max-w-full max-h-full w-auto h-auto object-contain"
      />
    </Component>
  )
}


