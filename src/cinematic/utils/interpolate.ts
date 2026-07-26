import type { CameraKeyframe, Vec3 } from "../types";

const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const lerpVec3 = (a: Vec3, b: Vec3, t: number): Vec3 => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
  lerp(a[2], b[2], t),
];

export interface CameraSample {
  position: Vec3;
  target: Vec3;
  fov: number;
}

export const sampleKeyframes = (
  keyframes: CameraKeyframe[],
  progress: number,
): CameraSample => {
  if (!keyframes.length) {
    return {
      position: [0, 120, 300],
      target: [0, 0, 0],
      fov: 42,
    };
  }

  const clamped = clamp(progress);

  if (clamped <= keyframes[0].progress) {
    return {
      position: keyframes[0].position,
      target: keyframes[0].target,
      fov: keyframes[0].fov,
    };
  }

  if (clamped >= keyframes[keyframes.length - 1].progress) {
    const last = keyframes[keyframes.length - 1];
    return { position: last.position, target: last.target, fov: last.fov };
  }

  for (let index = 0; index < keyframes.length - 1; index += 1) {
    const current = keyframes[index];
    const next = keyframes[index + 1];

    if (clamped >= current.progress && clamped <= next.progress) {
      const localT =
        (clamped - current.progress) / (next.progress - current.progress || 1);

      return {
        position: lerpVec3(current.position, next.position, localT),
        target: lerpVec3(current.target, next.target, localT),
        fov: lerp(current.fov, next.fov, localT),
      };
    }
  }

  const fallback = keyframes[keyframes.length - 1];
  return {
    position: fallback.position,
    target: fallback.target,
    fov: fallback.fov,
  };
};

export const smoothStep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};
