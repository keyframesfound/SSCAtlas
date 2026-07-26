# SSC Atlas

SSC Atlas is a scroll-directed, cinematic 3D website for St. Stephen's College, Hong Kong.
The entire narrative runs as one uninterrupted timeline over a single campus model.

## Stack

- React + TypeScript + Vite
- Three.js + React Three Fiber + Drei
- Lenis smooth scrolling
- GSAP-ready animation layer

## Core Principles

- One master model only: `public/assets/models/ssc-campus.glb`
- One continuous timeline only: no scene swapping, no page navigation
- Content-driven architecture: all chapter copy and camera definitions in JSON
- Interface minimized so architecture remains the hero

## Content System

Replace these files to update story and choreography without source changes:

- `public/assets/content/buildings.json`
- `public/assets/content/cameraPaths.json`
- `public/assets/content/timeline.json`
- `public/assets/content/statistics.json`

Asset folders:

- `public/assets/models/`
- `public/assets/images/`
- `public/assets/videos/`

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```

## Model Requirements

`ssc-campus.glb` should preserve named building objects so chapters can reference them directly.
Expected examples include:

- `MainEntrance`
- `SchoolHouse`
- `MartinHostel`
- `Chapel`
- `ClassroomBlock`
- `Library`
- `ScienceCentre`
- `NgWahHall`
- `TangShiuKinHall`
- `BenevolenceHouse`
- `LeungKauKuiStudentCentre`
- `NorthHouse`
- `CollegeHouse`
- `HeritageGallery`
- `BellPlaza`
- `CentralSquare`
- `BigField`

If the production model is not present, the app renders a procedural placeholder campus so timeline and UI can still be authored.
