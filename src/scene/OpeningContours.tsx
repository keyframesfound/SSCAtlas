type OpeningContoursProps = {
  progress: number
}

type ContourPoint = [number, number, number]
type ContourSegment = {
  start: ContourPoint
  end: ContourPoint
}

const contourGrid: number[][] = [
  [22.7, 25.4, 26.6, 28.7, 32.0, 35.4, 34.1, 31.9, 29.3, 26.6, 24.6, 24.1, 23.4, 21.7, 19.0, 15.5, 10.9, 6.9, 6.3, 5.6],
  [21.0, 24.1, 25.9, 28.9, 33.1, 36.7, 36.3, 34.8, 32.7, 29.9, 27.0, 26.5, 26.2, 24.9, 22.3, 18.9, 14.5, 10.4, 8.7, 7.3],
  [18.8, 21.9, 24.7, 28.8, 33.5, 36.7, 37.4, 37.0, 35.6, 33.1, 29.5, 29.0, 29.3, 28.7, 25.7, 22.5, 18.8, 14.9, 11.5, 11.7],
  [15.8, 19.6, 23.6, 28.3, 33.2, 36.3, 37.9, 38.3, 37.9, 36.9, 34.0, 33.1, 32.5, 31.3, 28.5, 26.0, 23.0, 19.8, 17.6, 17.9],
  [12.6, 17.2, 22.4, 27.8, 32.7, 35.8, 38.1, 39.4, 40.1, 40.8, 39.1, 37.6, 35.8, 33.5, 31.2, 29.5, 27.1, 24.8, 24.6, 24.7],
  [11.4, 15.6, 21.4, 26.6, 30.5, 33.2, 37.0, 39.5, 40.9, 42.0, 41.7, 40.8, 38.6, 35.2, 32.9, 30.9, 28.8, 27.3, 28.1, 28.9],
  [10.3, 14.2, 20.4, 25.4, 28.2, 30.4, 35.6, 39.3, 41.5, 43.0, 43.7, 43.4, 41.0, 36.9, 34.5, 32.2, 30.4, 29.8, 31.2, 32.6],
  [9.7, 13.6, 19.5, 23.8, 25.9, 27.7, 33.3, 38.1, 41.5, 43.0, 43.3, 42.8, 41.2, 38.4, 35.7, 33.7, 32.8, 32.8, 32.9, 33.0],
  [9.2, 12.8, 18.3, 22.1, 23.6, 25.0, 31.0, 36.8, 40.9, 42.5, 42.8, 42.4, 41.3, 39.6, 36.8, 35.2, 35.0, 35.2, 34.2, 33.2],
  [8.5, 11.3, 16.3, 19.9, 21.3, 22.3, 29.1, 34.9, 38.8, 40.9, 42.0, 42.1, 41.3, 39.7, 37.7, 37.1, 37.0, 36.7, 34.8, 32.9],
  [9.0, 11.3, 15.5, 18.5, 19.9, 20.7, 27.2, 33.1, 37.4, 40.0, 41.6, 42.2, 41.7, 40.3, 38.5, 38.4, 38.2, 37.1, 34.5, 32.4],
  [10.7, 13.0, 15.8, 18.0, 19.3, 20.1, 25.5, 31.4, 36.5, 40.0, 41.6, 42.5, 42.4, 41.3, 39.1, 39.4, 38.6, 36.4, 33.5, 31.7],
  [11.5, 13.3, 15.5, 17.7, 19.5, 20.0, 24.7, 30.1, 35.2, 39.3, 41.4, 42.6, 42.7, 41.7, 40.0, 39.9, 38.7, 36.1, 32.7, 31.4],
  [12.0, 12.9, 14.9, 17.6, 19.9, 20.0, 24.3, 29.0, 33.7, 38.3, 41.2, 42.6, 42.7, 41.9, 41.0, 40.3, 38.7, 36.0, 32.2, 31.3],
  [10.3, 11.8, 13.6, 16.3, 19.5, 21.7, 24.8, 28.7, 33.0, 37.6, 41.1, 42.8, 43.1, 42.4, 42.0, 41.6, 39.9, 37.1, 34.0, 33.1],
  [8.2, 10.6, 12.2, 14.9, 19.0, 23.6, 25.4, 28.4, 32.5, 37.1, 41.0, 43.2, 43.7, 43.1, 43.0, 43.0, 41.3, 38.5, 36.2, 35.3],
  [8.3, 11.5, 11.6, 13.7, 18.4, 23.0, 26.0, 29.0, 32.7, 37.7, 42.0, 44.3, 45.0, 44.6, 44.2, 43.4, 42.0, 40.4, 39.4, 38.2],
  [8.5, 12.2, 11.7, 13.1, 17.7, 22.4, 26.5, 29.7, 33.2, 38.5, 43.0, 45.2, 46.0, 45.9, 44.9, 43.4, 42.4, 41.9, 42.1, 40.6],
  [9.0, 12.3, 14.0, 15.1, 16.6, 21.3, 26.1, 30.7, 35.3, 40.1, 44.2, 45.7, 46.0, 45.7, 43.9, 42.3, 41.5, 41.6, 42.6, 41.2],
  [9.3, 12.6, 15.7, 16.1, 15.4, 20.6, 26.6, 32.2, 37.3, 41.8, 45.3, 46.1, 45.8, 44.9, 41.9, 40.5, 40.2, 41.0, 42.7, 41.8],
]

const contourLevels = (() => {
  const values = contourGrid.flat()
  const min = Math.min(...values)
  const max = Math.max(...values)
  const levelCount = 9
  const step = (max - min) / (levelCount + 1)

  return Array.from({ length: levelCount }, (_, index) => Number((min + step * (index + 1)).toFixed(1)))
})()

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

const pointKey = ([x, , z]: ContourPoint): string => `${x.toFixed(2)}:${z.toFixed(2)}`

const interpolatePoint = (
  xA: number,
  zA: number,
  valueA: number,
  xB: number,
  zB: number,
  valueB: number,
  level: number,
): ContourPoint => {
  const ratio = valueA === valueB ? 0.5 : (level - valueA) / (valueB - valueA)
  const t = clamp01(ratio)

  return [xA + (xB - xA) * t, 0, zA + (zB - zA) * t]
}

const buildContourSegments = (grid: number[][], levels: number[]): ContourSegment[] => {
  const rows = grid.length
  const columns = grid[0]?.length ?? 0
  const extent = 140
  const segments: ContourSegment[] = []

  for (const level of levels) {
    for (let row = 0; row < rows - 1; row += 1) {
      const zA = (row / (rows - 1) - 0.5) * extent
      const zB = ((row + 1) / (rows - 1) - 0.5) * extent

      for (let column = 0; column < columns - 1; column += 1) {
        const xA = (column / (columns - 1) - 0.5) * extent
        const xB = ((column + 1) / (columns - 1) - 0.5) * extent

        const topLeft = grid[row][column]
        const topRight = grid[row][column + 1]
        const bottomRight = grid[row + 1][column + 1]
        const bottomLeft = grid[row + 1][column]

        let caseIndex = 0

        if (topLeft >= level) caseIndex |= 8
        if (topRight >= level) caseIndex |= 4
        if (bottomRight >= level) caseIndex |= 2
        if (bottomLeft >= level) caseIndex |= 1

        if (caseIndex === 0 || caseIndex === 15) {
          continue
        }

        const top = interpolatePoint(xA, zA, topLeft, xB, zA, topRight, level)
        const right = interpolatePoint(xB, zA, topRight, xB, zB, bottomRight, level)
        const bottom = interpolatePoint(xA, zB, bottomLeft, xB, zB, bottomRight, level)
        const left = interpolatePoint(xA, zA, topLeft, xA, zB, bottomLeft, level)
        const center = (topLeft + topRight + bottomRight + bottomLeft) / 4

        switch (caseIndex) {
          case 1:
          case 14:
            segments.push({ start: left, end: bottom })
            break
          case 2:
          case 13:
            segments.push({ start: bottom, end: right })
            break
          case 3:
          case 12:
            segments.push({ start: left, end: right })
            break
          case 4:
          case 11:
            segments.push({ start: top, end: right })
            break
          case 5:
            if (center >= level) {
              segments.push({ start: top, end: left })
              segments.push({ start: bottom, end: right })
            } else {
              segments.push({ start: top, end: right })
              segments.push({ start: left, end: bottom })
            }
            break
          case 6:
          case 9:
            segments.push({ start: top, end: bottom })
            break
          case 7:
          case 8:
            segments.push({ start: top, end: left })
            break
          case 10:
            if (center >= level) {
              segments.push({ start: top, end: right })
              segments.push({ start: left, end: bottom })
            } else {
              segments.push({ start: top, end: left })
              segments.push({ start: bottom, end: right })
            }
            break
          default:
            break
        }
      }
    }
  }

  return segments
}

const stitchSegments = (segments: ContourSegment[]): ContourPoint[][] => {
  const endpointMap = new Map<string, Array<{ segmentIndex: number; pointIndex: 0 | 1 }>>()

  const addEndpoint = (point: ContourPoint, segmentIndex: number, pointIndex: 0 | 1) => {
    const key = pointKey(point)
    const current = endpointMap.get(key) ?? []
    current.push({ segmentIndex, pointIndex })
    endpointMap.set(key, current)
  }

  segments.forEach((segment, segmentIndex) => {
    addEndpoint(segment.start, segmentIndex, 0)
    addEndpoint(segment.end, segmentIndex, 1)
  })

  const used = new Set<number>()
  const paths: ContourPoint[][] = []

  const extendPath = (path: ContourPoint[], appendToEnd: boolean) => {
    while (path.length > 0) {
      const endpoint = appendToEnd ? path[path.length - 1] : path[0]
      const candidates = endpointMap.get(pointKey(endpoint)) ?? []
      const nextCandidate = candidates.find(({ segmentIndex }) => !used.has(segmentIndex))

      if (!nextCandidate) {
        break
      }

      const nextSegment = segments[nextCandidate.segmentIndex]
      const nextPoint = nextCandidate.pointIndex === 0 ? nextSegment.end : nextSegment.start

      used.add(nextCandidate.segmentIndex)

      if (appendToEnd) {
        path.push(nextPoint)
      } else {
        path.unshift(nextPoint)
      }
    }
  }

  segments.forEach((segment, segmentIndex) => {
    if (used.has(segmentIndex)) {
      return
    }

    used.add(segmentIndex)
    const path = [segment.start, segment.end]

    extendPath(path, true)
    extendPath(path, false)

    paths.push(path)
  })

  return paths
}

export const OpeningContours = ({ progress }: OpeningContoursProps) => {
  const contours = useMemo(() => {
    const segments = buildContourSegments(contourGrid, contourLevels)
    return stitchSegments(segments)
  }, [])

  const reveal = smoothstep(0.01, 0.11, progress)
  const opacity = 1 - smoothstep(0.08, 0.19, progress)

  return (
    <group position={[0, -8 + reveal * 8, 0]} scale={[1.45, 1.45, 1.45]}>
      {contours.map((points, idx): ReactElement => (
        <Line
          key={`contour-${idx}`}
          points={points}
          color="#f5f7fa"
          transparent
          opacity={opacity * (0.28 + idx * 0.02)}
          lineWidth={1.05}
        />
      ))}
    </group>
  )
}
