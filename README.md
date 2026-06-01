This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## ToDos

### Planned
- [ ] Infos for Visitors
  - [ ] Overall Infos
  - [ ] Project Infos
    - [ ] Camera Pan on Window
    - [ ] Back-Button -> Camera back to initial position
- [ ] Linkage to Website
- [ ] Fix Bird Trajectory

- [ ] Environment Map?
  
### In Progress

- [X] Camera Follows Birds on Window-Click
  - [ ] Smoother? -> Improve Looping behaviour
- [ ] Sounds
  - [X] Bird Sounds
  - [ ] Backyard Sounds
- [ ] Optimization
  - [ ] MergeGeometries
    - [X] MergeGeometries By Material
    - [ ] Cleanup material creation -> All materials from materials.ts
    - [ ] Material-Data instead of Material?
  
### Done

- [X] Smooth Window Opening
- [X] Day-Night Cycle3 
- [X] Fix Spike Line Lawn
- [X] Fix Bird Position with scene shift
- [X] Fix Balcony Positioning
- [X] User Controlls
  - [X] Disable Audio
  - [X] Disable Birds
- [X] Moonlight
- [X] Check if ServerConnection Error is bug or how to prevent it (Reinitiate?)
- [X] Trees
  - [X] L-Systems
  - [X] Different Variations
  - [X] Position in Gardens
- [X] In-Door Lighting
  - [X] ToDo: Check Stair-Lighting
  - [X] Create "Rythms" for different times
- [X] Walls in Garden
  - [X] Partitioning Algorithm
  - [X] Positioning Walls based on partitioning ;()
  - [X] Decorations
  - [X] Fix Texture Clipping 
