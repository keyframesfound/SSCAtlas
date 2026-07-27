import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import type { Vec3Tuple } from '../types/content'

type CampusBoundaryProps = {
  points: Vec3Tuple[]
  progress: number
}

export const CampusBoundary = ({ points }: CampusBoundaryProps) => {
  const activePoints = useMemo(() => {
    if (points.length < 2) {
      return points
    }

    return [...points, points[0]]
  }, [points])

  return (
    <group>
      <Line
        points={activePoints}
        color="#7da2ff"
        transparent={false}
        opacity={1}
        lineWidth={2}
        depthTest={false}
        depthWrite={false}
      />
    </group>
  )
}
