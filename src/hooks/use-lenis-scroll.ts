import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { clamp01 } from '../lib/math'

export const useLenisScroll = (): number => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.05,
      wheelMultiplier: 0.45,
      touchMultiplier: 0.8,
    })

    let frameId = 0

    const updateProgress = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
      setProgress(clamp01(window.scrollY / maxScroll))
    }

    const raf = (time: number) => {
      lenis.raf(time)
      frameId = window.requestAnimationFrame(raf)
    }

    lenis.on('scroll', updateProgress)
    frameId = window.requestAnimationFrame(raf)
    updateProgress()

    return () => {
      window.cancelAnimationFrame(frameId)
      lenis.off('scroll', updateProgress)
      lenis.destroy()
    }
  }, [])

  return progress
}
