import * as THREE from 'three';


export const PANE_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 0.95, // High transmission for clarity
  opacity: 1,
  metalness: 0,
  roughness: 0, // Perfectly smooth
  envMapIntensity: 1 // Crucial for looking like glass
});

export const PANE_HIGHLIGHT_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: 0xffff99,
  transmission: 0.8,
  opacity: 1,
  metalness: 0,
  roughness: 0, // Perfectly smooth
  envMapIntensity: 1 // Crucial for looking like glass
});

export const WINDOW_FRAME_NORMAL_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xffffff,
});

export const WINDOW_FRAME_HIGHLIGHT_MATERIAL = new THREE.MeshBasicMaterial({
    color: 0xffff99,
});