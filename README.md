# SSC Atlas Cinematic Campus Experience

This project is a scroll-directed cinematic 3D experience for St. Stephen's College, built to feel like an architectural film rather than a conventional website.

## Stack

- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- GSAP (timeline smoothing)
- Lenis (scroll smoothing)

## Development

```bash
npm install
npm run dev
```

Build and quality checks:

```bash
npm run lint
npm run build
```

## Content-Driven Architecture

All cinematic content is loaded from external JSON in public/assets/content.

- public/assets/content/scenes.json
- public/assets/content/buildings.json
- public/assets/content/timeline.json
- public/assets/content/statistics.json

This allows non-code updates for chapter copy, camera pacing, section ordering, and site-wide statistics.

## Placeholder Assets

All media/model paths are pre-wired so production assets can be swapped without code edits.

- public/assets/models/campus.glb
- public/assets/models/buildings/*.glb
- public/assets/images/chapters/*.svg
- public/assets/videos/intro.mp4
- public/assets/logos/ssc-crest.svg

Important: current .glb and .mp4 files are placeholders. Replace files in place using the same names to keep all runtime references stable.

## Cinematic Flow

The website is one continuous scroll timeline with directed camera choreography.

1. Topographic Reveal
2. Campus Boundary Reveal
3. Main Entrance
4. School House
5. Chapel
6. Academic Core
7. Library
8. Science Facilities
9. Benevolence and Student Life
10. Sports Complex
11. Boarding Facilities
12. Sunset Campus Overview + CTA

## Performance Notes

- Bundle chunking is configured in vite.config.ts for heavy 3D dependencies.
- Rendering uses fixed-direction camera control and minimal UI overlays.
- Scene geometry is currently lightweight placeholder topology for fast iteration.

## Next Production Steps

1. Replace placeholder GLB models with optimized Draco/KTX2 pipeline assets.
2. Add environment map and physically based material texture sets.
3. Introduce LOD tiers and progressive streaming for campus/building assets.
4. Replace placeholder chapter stills and crest with final brand assets.
