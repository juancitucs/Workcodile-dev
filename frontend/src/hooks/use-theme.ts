import { useState, useEffect } from 'react'

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [christmasTheme, setChristmasTheme] = useState<boolean>(() => {
    return localStorage.getItem('workcodile-christmas-theme') === 'true'
  })

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  useEffect(() => {
    const root = window.document.documentElement
    if (christmasTheme) {
      root.classList.add('christmas')
    } else {
      root.classList.remove('christmas')
    }
    localStorage.setItem('workcodile-christmas-theme', christmasTheme.toString())
  }, [christmasTheme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const toggleChristmasTheme = () => {
    setChristmasTheme(prev => !prev)
  }

  return { theme, setTheme, toggleTheme, christmasTheme, toggleChristmasTheme }
}
