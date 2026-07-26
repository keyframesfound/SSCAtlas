import { useMemo, type ReactElement } from 'react'
import { Line } from '@react-three/drei'
import { smoothstep } from '../lib/math'

type OpeningContoursProps = {
  progress: number
}

export const OpeningContours = ({ progress }: OpeningContoursProps) => {
  const rings = useMemo(() => {
    const result: Array<{ radius: number; y: number; points: [number, number, number][] }> = []

    for (let ring = 0; ring < 26; ring += 1) {
      const radius = 18 + ring * 3.4
      const points: [number, number, number][] = []

      for (let index = 0; index < 96; index += 1) {
        const angle = (index / 95) * Math.PI * 2
        const noise = Math.sin(angle * 2.5 + ring * 0.4) * 1.8
        points.push([Math.cos(angle) * (radius + noise), 0, Math.sin(angle) * (radius + noise)])
      }

      result.push({ radius, y: ring * 0.12, points })
    }

    return result
  }, [])

  const reveal = smoothstep(0.01, 0.11, progress)
  const opacity = 1 - smoothstep(0.08, 0.19, progress)

  return (
    <group position={[0, -8 + reveal * 8, 0]}>
      {rings.map((ring, idx): ReactElement => (
        <Line
          key={`${ring.radius}-${idx}`}
          points={ring.points}
          color="#dfe3e8"
          transparent
          opacity={opacity * (0.14 + idx * 0.012)}
          lineWidth={0.55}
          position={[0, ring.y, 0]}
        />
      ))}
    </group>
  )
}
