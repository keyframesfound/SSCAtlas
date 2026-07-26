export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

export const inverseLerp = (start: number, end: number, value: number): number => {
  if (start === end) {
    return 0
  }

  return clamp01((value - start) / (end - start))
}

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = inverseLerp(edge0, edge1, x)
  return t * t * (3 - 2 * t)
}
