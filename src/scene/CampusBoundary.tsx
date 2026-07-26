import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { smoothstep } from '../lib/math'
import type { Vec3Tuple } from '../types/content'

type CampusBoundaryProps = {
  points: Vec3Tuple[]
  progress: number
}

export const CampusBoundary = ({ points, progress }: CampusBoundaryProps) => {
  const revealProgress = smoothstep(0.07, 0.16, progress)
  const fade = 1 - smoothstep(0.15, 0.24, progress)

  const activePoints = useMemo(() => {
    const count = Math.max(2, Math.floor(points.length * revealProgress))
    return points.slice(0, count)
  }, [points, revealProgress])

  return (
    <group>
      <Line
        points={activePoints}
        color="#9db8ff"
        transparent
        opacity={0.85 * fade}
        lineWidth={2}
      />
      <Line
        points={activePoints}
        color="#e8eef8"
        transparent
        opacity={0.4 * fade}
        lineWidth={5}
      />
    </group>
  )
}
