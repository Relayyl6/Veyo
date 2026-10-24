// Route file: app/(utils)/map.tsx
// The actual implementation is platform-split in components/:
//   components/MapScreen.native.tsx  → loaded on iOS & Android
//   components/MapScreen.tsx         → loaded on web/server (safe stub)
// Metro resolves the correct file automatically.
export { default } from '@/components/MapScreen';
