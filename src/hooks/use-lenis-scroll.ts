import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { clamp01 } from '../lib/math'

export const useLenisScroll = (): number => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 720px)').matches
    const lenis = new Lenis({
      smoothWheel: !isMobile,
      lerp: isMobile ? 0.12 : 0.05,
      wheelMultiplier: isMobile ? 0.8 : 0.45,
      touchMultiplier: isMobile ? 0.65 : 0.8,
    })

    let frameId = 0

    const updateProgress = () => {
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - viewportHeight)
      setProgress(clamp01(window.scrollY / maxScroll))
    }

    const raf = (time: number) => {
      lenis.raf(time)
      frameId = window.requestAnimationFrame(raf)
    }

    const handleResize = () => {
      updateProgress()
    }

    lenis.on('scroll', updateProgress)
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    frameId = window.requestAnimationFrame(raf)
    updateProgress()

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      lenis.off('scroll', updateProgress)
      lenis.destroy()
    }
  }, [])

  return progress
}
